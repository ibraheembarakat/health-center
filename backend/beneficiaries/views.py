from rest_framework import viewsets, mixins, status
# هون رح نستخدم الفيو سيت لان نحن بدنا بس الكرييت وامر المي للوصول لصفحه المستفيد
# الميكسين بيستورد الكرييت
# ستاتوس مشان نحدد العطل في حال كان فيه عطل
from rest_framework.decorators import action

from rest_framework.response import Response
#مشان يحول البيانات لجيسون
from rest_framework.pagination import PageNumberPagination
from aid.models import AidSchedule
from .models import Beneficiary
from .serializers import (
    BeneficiarySerializer,
    BeneficiaryCreateSerializer,
    BeneficiaryBriefSerializer,
    BeneficiaryMeSerializer,
)
from .permissions import (
    IsRegistrationEmployee,
    IsBeneficiaryOwner,
    IsAwarenessEmployee,
)
from django.db.models import Q

class BeneficiaryListPagination(PageNumberPagination):
    page_size = 100
    
class BeneficiaryViewSet(
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Beneficiary.objects.select_related('user').all()
    pagination_class = BeneficiaryListPagination
    # حيب المستفيدين وبيانات اليوزر تبعهن
    def get_serializer_class(self):
        if self.action == 'create':
            return BeneficiaryCreateSerializer

        if self.action == 'brief_list':
            return BeneficiaryBriefSerializer

        if self.action == 'me':
            return BeneficiaryMeSerializer

        return BeneficiarySerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsRegistrationEmployee()]

        if self.action == 'me':
            return [IsBeneficiaryOwner()]

        if self.action == 'brief_list':
            return [IsAwarenessEmployee()]

        return [IsRegistrationEmployee()]

    @action(
        detail=False,
        methods=['get'],
        url_path='me',
    )
    #هون م(نضيف ايند بوينت خاص داخل الفيو سيت هذا الرابط يقبل غيت فقط واسم الرابط هو مي والرابط ما يحتاج اي دي
    def me(self, request):
        try:
            beneficiary = (
                Beneficiary.objects
                .select_related('user')
                .get(user=request.user)
            )
            #جيب ملف المستفيد المرتبط بهذا الحساب
        except Beneficiary.DoesNotExist:
            return Response(
                {
                    'detail': (
                        'No beneficiary profile is associated '
                        'with this account.'
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        AidSchedule.expire_due_pending(
            beneficiary=beneficiary,
        )

        serializer = self.get_serializer(
            beneficiary,
        )
        #خذ كائن beneficiary
        # واستخدم serializer المناسب لتحويله إلى بيانات قابلة للإرجاع كـ JSON
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['get'],
        url_path='list',
    )
    def brief_list(self, request):
        queryset = (
            Beneficiary.objects
            .select_related('user')
            .all()
        )

        search = request.query_params.get('search')

        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__username__icontains=search)
            )

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
            )
            return self.get_paginated_response(
                serializer.data
            )

        serializer = self.get_serializer(
            queryset,
            many=True,
        )

        return Response(serializer.data)

    #ارجع بيانات المستفيد ك json او postman للفرونت