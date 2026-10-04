from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from beneficiaries.face_utils import (
    FaceProcessingError,
    compare,
    extract_encoding,
)
from beneficiaries.models import Beneficiary
from notifications.models import Notification

from .models import AidSchedule, AidHistory
from .permissions import (
    CanViewSchedules,
    IsAwarenessForConfirm,
    IsAwarenessForSchedule,
)
from .serializers import (
    AidHistorySerializer,
    AidScheduleCreateSerializer,
    AidScheduleSerializer,
    ConfirmSerializer,
    LookupPendingSerializer,
    PendingScheduleLookupResultSerializer,
    VerifyFaceSerializer,
)
from .verification import issue_token, read_token


class AidScheduleViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    GenericViewSet,
):
    filterset_fields = ['status']
    ordering_fields = ['schedule_date', 'created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return AidScheduleCreateSerializer

        if self.action == 'lookup_pending':
            return LookupPendingSerializer

        if self.action == 'verify_face':
            return VerifyFaceSerializer

        if self.action == 'confirm':
            return ConfirmSerializer

        return AidScheduleSerializer

    def get_queryset(self):
        user = self.request.user

        base = AidSchedule.objects.select_related(
            'beneficiary__user',
            'created_by',
        )

        if user.role == 'beneficiary':
            return base.filter(
                beneficiary__user=user,
            )

        if user.role in ['awareness', 'manager']:
            return base.all()

        return AidSchedule.objects.none()

    def get_permissions(self):
        if self.action == 'create':
            return [IsAwarenessForSchedule()]

        if self.action in [
            'lookup_pending',
            'verify_face',
            'confirm',
        ]:
            return [IsAwarenessForConfirm()]

        if self.action in ['list', 'retrieve']:
            return [CanViewSchedules()]

        return [IsAuthenticated()]

    def perform_create(self, serializer):
        # فاضي — الإنشاء بيصير يدوياً بالـ create
        # لأنو صار عنا أكتر من مستفيد بنفس الطلب
        pass

    def _expire_visible_pending(self):
        user = self.request.user

        if user.role == 'beneficiary':
            beneficiary = getattr(
                user,
                'beneficiary_profile',
                None,
            )

            if beneficiary is not None:
                AidSchedule.expire_due_pending(
                    beneficiary=beneficiary,
                )

            return

        if user.role in ['awareness', 'manager']:
            AidSchedule.expire_due_pending()

    def list(self, request, *args, **kwargs):
        self._expire_visible_pending()

        return super().list(
            request,
            *args,
            **kwargs,
        )

    def create(self, request, *args, **kwargs):
        AidSchedule.expire_due_pending()

        serializer = self.get_serializer(
            data=request.data,
        )
        serializer.is_valid(
            raise_exception=True,
        )

        beneficiary_ids = sorted(
            serializer.validated_data['beneficiaries']
        )
        schedule_date = serializer.validated_data[
            'schedule_date'
        ]

        with transaction.atomic():
            beneficiaries = list(
                Beneficiary.objects.select_for_update()
                .filter(
                    id__in=beneficiary_ids,
                )
                .order_by('id')
            )

            if len(beneficiaries) != len(beneficiary_ids):
                raise ValidationError({
                    'beneficiaries': (
                        'One or more beneficiaries no longer exist.'
                    )
                })

            for beneficiary in beneficiaries:
                AidSchedule.expire_due_pending(
                    beneficiary=beneficiary,
                )

            duplicate_ids = sorted(set(
                AidSchedule.objects.filter(
                    beneficiary_id__in=beneficiary_ids,
                    status='pending',
                    schedule_date__gt=timezone.now(),
                ).values_list(
                    'beneficiary_id',
                    flat=True,
                )
            ))

            if duplicate_ids:
                raise ValidationError({
                    'beneficiaries': (
                        'These beneficiaries already have an active '
                        f'pending appointment: {duplicate_ids}'
                    )
                })

            created_schedules = []

            for beneficiary in beneficiaries:
                # ننشئ موعد لكل مستفيد لحاله
                # لازم نستخدم .create() مش bulk_create
                # لأنو .create() بيشغّل save() يللي بينشئ الإشعار التلقائي
                # لو استخدمنا bulk_create ما رح ينبعث أي إشعار
                schedule = AidSchedule.objects.create(
                    beneficiary=beneficiary,
                    schedule_date=schedule_date,
                    created_by=request.user,
                )
                created_schedules.append(schedule)

        # نرجّع كل المواعيد المنشأة بالـ serializer الغني
        # many=True لأنو في أكتر من موعد
        output = AidScheduleSerializer(
            created_schedules,
            many=True,
            context=self.get_serializer_context(),
        )

        return Response(
            output.data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=['post'],
        url_path='lookup-pending',
    )
    def lookup_pending(self, request):
        AidSchedule.expire_due_pending()

        serializer = self.get_serializer(
            data=request.data,
        )
        serializer.is_valid(
            raise_exception=True,
        )

        national_id = serializer.validated_data[
            'national_id'
        ]

        schedule = (
            AidSchedule.objects.select_related(
                'beneficiary__user',
                'created_by',
            )
            .filter(
                beneficiary__user__national_id=national_id,
                status='pending',
                schedule_date__gt=timezone.now(),
            )
            .order_by('schedule_date')
            .first()
        )

        if schedule is None:
            return Response(
                {
                    'detail': (
                        'No active pending appointment was found.'
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        output = PendingScheduleLookupResultSerializer(
            schedule,
            context=self.get_serializer_context(),
        )

        return Response(
            output.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='verify-face',
    )
    def verify_face(self, request, pk=None):
        AidSchedule.expire_due_pending()

        instance = self.get_object()

        if instance.expire_if_due():
            return Response(
                {
                    'detail': 'This appointment has expired.'
                },
                status=status.HTTP_409_CONFLICT,
            )

        if instance.status != 'pending':
            return Response(
                {
                    'detail': (
                        'This appointment is no longer pending.'
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )

        if not instance.beneficiary.face_encoding:
            return Response(
                {
                    'code': 'face_data_unavailable',
                    'detail': (
                        'The beneficiary has no stored face data. '
                        'Use manual override to confirm delivery.'
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            data=request.data,
        )
        serializer.is_valid(
            raise_exception=True,
        )

        try:
            live_encoding = extract_encoding(
                serializer.validated_data['photo']
            )
            matched, score = compare(
                instance.beneficiary.face_encoding,
                live_encoding,
            )
        except FaceProcessingError as error:
            response_status = status.HTTP_400_BAD_REQUEST

            if error.code == 'model_unavailable':
                response_status = (
                    status.HTTP_503_SERVICE_UNAVAILABLE
                )

            return Response(
                {
                    'photo': {
                        'code': error.code,
                        'message': error.message,
                    }
                },
                status=response_status,
            )

        verification_token = issue_token(
            schedule_id=instance.id,
            employee_id=request.user.id,
            matched=matched,
            score=score,
        )

        return Response(
            {
                'matched': matched,
                'score': score,
                'verification_token': verification_token,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='confirm',
    )
    def confirm(self, request, pk=None):
        AidSchedule.expire_due_pending()

        serializer = self.get_serializer(
            data=request.data,
        )
        serializer.is_valid(
            raise_exception=True,
        )

        verification_token = serializer.validated_data.get(
            'verification_token'
        )
        manual_override = serializer.validated_data.get(
            'manual_override',
            False,
        )

        with transaction.atomic():
            instance = get_object_or_404(
                AidSchedule.objects.select_for_update()
                .select_related(
                    'beneficiary__user',
                    'created_by',
                ),
                pk=pk,
            )

            if instance.expire_if_due():
                return Response(
                    {
                        'detail': 'This appointment has expired.'
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            if instance.status != 'pending':
                return Response(
                    {
                        'detail': (
                            'This appointment has already been '
                            'received or marked as missed.'
                        )
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            face_verified = None
            face_match_score = None

            if verification_token:
                token_payload = read_token(
                    verification_token,
                    schedule_id=instance.id,
                    employee_id=request.user.id,
                )

                if token_payload is None:
                    return Response(
                        {
                            'detail': (
                                'The verification token is invalid '
                                'or has expired.'
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                face_verified = token_payload['matched']
                face_match_score = token_payload['score']

            elif not manual_override:
                return Response(
                    {
                        'detail': (
                            'A verification token or manual '
                            'override is required.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            instance.status = 'received'
            instance.save(
                update_fields=[
                    'status',
                    'updated_at',
                ]
            )

            # ننشئ سجل التسليم
            # aid_Schedule بحرف S كبير — زي ما هو بالموديل
            # delivered_by = الموظف اللي أكّد مش المنشئ
            history = AidHistory.objects.create(
                aid_Schedule=instance,
                delivered_by=request.user,
                confirmed_by_beneficiary=False,
                face_verified=face_verified,
                face_match_score=face_match_score,
            )

            # ننشئ الإشعار يدوياً هون
            # لأنو AidSchedule.save() بتنشئ إشعار بس عند is_new
            # وهون إحنا بنحدث مش بننشئ
            Notification.objects.create(
                recipient=instance.beneficiary.user,
                sent_by=request.user,
                title='Aid receipt confirmed',
                message=(
                    'Your aid receipt for the appointment '
                    'scheduled on '
                    f'{instance.schedule_date.strftime("%Y-%m-%d")} '
                    'has been confirmed.'
                ),
                notification_type='aid_received',
            )

        response_data = AidScheduleSerializer(
            instance,
            context=self.get_serializer_context(),
        ).data

        response_data['aid_history_id'] = history.id
        response_data['face_verified'] = (
            history.face_verified
        )
        response_data['face_match_score'] = (
            history.face_match_score
        )

        return Response(
            response_data,
            status=status.HTTP_200_OK,
        )


class AidHistoryViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    GenericViewSet,
):
    serializer_class = AidHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        base = AidHistory.objects.select_related(
            'aid_Schedule__beneficiary__user',
            'delivered_by',
        )

        if user.role == 'beneficiary':
            return base.filter(
                aid_Schedule__beneficiary__user=user,
            )

        if user.role in ['awareness', 'manager']:
            return base.all()

        return AidHistory.objects.none()

    @action(
        detail=False,
        methods=['get'],
        url_path='me',
    )
    def me(self, request):
        qs = AidHistory.objects.select_related(
            'aid_Schedule__beneficiary__user',
            'delivered_by',
        ).filter(
            aid_Schedule__beneficiary__user=request.user,
        )

        serializer = self.get_serializer(
            qs,
            many=True,
        )

        return Response(serializer.data)