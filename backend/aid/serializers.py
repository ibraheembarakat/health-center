from rest_framework import serializers
from .models import AidSchedule, AidHistory
from django.utils import timezone
from notifications.models import Notification


class AidScheduleSerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True,
    )
    # آخر مرة انبعت إشعار لهاد المستفيد
    last_notification_sent = serializers.SerializerMethodField()

    class Meta:
        model = AidSchedule
        fields = [
            'id',
            'beneficiary_name',
            'schedule_date',
            'status',
            'status_display',
            'created_by_name',
            'created_at',
            'last_notification_sent',
        ]
        read_only_fields = [
            'id',
            'schedule_date',
            'status',
            'created_at',
        ]

    def get_beneficiary_name(self, obj):
        user = obj.beneficiary.user
        full_name = user.get_full_name()
        return full_name if full_name else user.username

    def get_created_by_name(self, obj):
        full_name = obj.created_by.get_full_name()
        return full_name if full_name else obj.created_by.username

    def get_last_notification_sent(self, obj):
        # آخر مرة انبعت إشعار aid_pickup لهاد المستفيد
        # مفيدة للموظف عشان يعرف إذا المستفيد مبلّغ أو لأ
        last = Notification.objects.filter(
            recipient=obj.beneficiary.user,
            notification_type='aid_pickup',
        ).order_by('-created_at').first()

        if last:
            return last.created_at
        return None


class AidScheduleCreateSerializer(serializers.Serializer):
    # غيّرنا من beneficiary (مفرد) لـ beneficiaries (قائمة)
    # مشان نقدر نجدول موعد لأكتر من مستفيد بنفس الوقت
    beneficiaries = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )
    schedule_date = serializers.DateTimeField()

    def validate_schedule_date(self, value):
        # التاريخ لازم يكون بالمستقبل
        if value <= timezone.now():
            raise serializers.ValidationError(
                'The appointment date must be in the future.'
            )
        return value

    def validate_beneficiaries(self, value):
        # نزيل التكرار أول شي
        unique_ids = list(set(value))

        # نتحقق إنو كل id موجود فعلاً بجدول المستفيدين
        from beneficiaries.models import Beneficiary

        existing = set(
            Beneficiary.objects.filter(
                id__in=unique_ids,
            ).values_list(
                'id',
                flat=True,
            )
        )

        # أي id مش موجود → خطأ
        invalid = [
            beneficiary_id
            for beneficiary_id in unique_ids
            if beneficiary_id not in existing
        ]

        if invalid:
            raise serializers.ValidationError(
                f'Beneficiary IDs not found: {invalid}'
            )

        return unique_ids

    def validate(self, attrs):
        beneficiary_ids = attrs.get('beneficiaries')
        now = timezone.now()

        # نمنع إنشاء موعد جديد إذا كان عند المستفيد موعد pending صالح
        duplicates = list(
            AidSchedule.objects.filter(
                beneficiary_id__in=beneficiary_ids,
                status='pending',
                schedule_date__gt=now,
            )
            .order_by('beneficiary_id')
            .values_list(
                'beneficiary_id',
                flat=True,
            )
            .distinct()
        )

        if duplicates:
            raise serializers.ValidationError(
                {
                    'beneficiaries': (
                        'These beneficiaries already have an active '
                        f'pending appointment: {duplicates}'
                    )
                }
            )

        return attrs


class LookupPendingSerializer(serializers.Serializer):
    national_id = serializers.RegexField(
        regex=r'^[0-9]{11}$',
        max_length=11,
        min_length=11,
        trim_whitespace=True,
        error_messages={
            'invalid': (
                'The national ID must contain exactly 11 digits.'
            ),
            'max_length': (
                'The national ID must contain exactly 11 digits.'
            ),
            'min_length': (
                'The national ID must contain exactly 11 digits.'
            ),
        },
    )


class PendingScheduleLookupResultSerializer(
    serializers.ModelSerializer
):
    beneficiary_id = serializers.IntegerField(
        source='beneficiary.id',
        read_only=True,
    )
    beneficiary_name = serializers.SerializerMethodField()
    national_id = serializers.CharField(
        source='beneficiary.user.national_id',
        read_only=True,
    )
    photo = serializers.ImageField(
        source='beneficiary.photo',
        read_only=True,
    )
    registration_date = serializers.DateField(
        source='beneficiary.registration_date',
        read_only=True,
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True,
    )

    class Meta:
        model = AidSchedule
        fields = [
            'id',
            'beneficiary_id',
            'beneficiary_name',
            'national_id',
            'photo',
            'registration_date',
            'schedule_date',
            'status',
            'status_display',
        ]
        read_only_fields = [
            'id',
            'schedule_date',
            'status',
        ]

    def get_beneficiary_name(self, obj):
        user = obj.beneficiary.user
        full_name = user.get_full_name().strip()
        return full_name if full_name else user.username


class VerifyFaceSerializer(serializers.Serializer):
    photo = serializers.ImageField(
        write_only=True,
        required=True,
        allow_null=False,
    )


class ConfirmSerializer(serializers.Serializer):
    verification_token = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=False,
        trim_whitespace=True,
    )
    manual_override = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
    )

    def validate(self, attrs):
        verification_token = attrs.get('verification_token')
        manual_override = attrs.get(
            'manual_override',
            False,
        )

        if not verification_token and not manual_override:
            raise serializers.ValidationError(
                'A verification token or manual override is required.'
            )

        if verification_token and manual_override:
            raise serializers.ValidationError(
                'Use either a verification token or manual override, '
                'not both.'
            )

        return attrs


class AidHistorySerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.SerializerMethodField()
    schedule_date = serializers.DateTimeField(
        source='aid_Schedule.schedule_date',
        read_only=True,
    )
    delivered_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AidHistory
        fields = [
            'id',
            'beneficiary_name',
            'schedule_date',
            'delivery_date',
            'confirmed_by_beneficiary',
            'face_verified',
            'face_match_score',
            'delivered_by_name',
        ]
        read_only_fields = [
            'id',
            'delivery_date',
            'confirmed_by_beneficiary',
            'face_verified',
            'face_match_score',
        ]

    def get_beneficiary_name(self, obj):
        user = obj.aid_Schedule.beneficiary.user
        full_name = user.get_full_name()
        return full_name if full_name.strip() else user.username

    def get_delivered_by_name(self, obj):
        full_name = obj.delivered_by.get_full_name()
        return full_name if full_name.strip() else obj.delivered_by.username