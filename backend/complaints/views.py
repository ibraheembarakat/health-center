from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import mixins,viewsets
#الميكسينز بوفرلي العمليات يللي بدي ياها والفيو سيتس للربط مع الراوتر الافتراضي
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintCreateSerializer, ReplySerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter ,OrderingFilter
from rest_framework.permissions import IsAuthenticated
from .permissions import IsBeneficiaryForCreate,IsHelpDeskForReply,IsOwnerOrStaff
class ComplaintViewSet(mixins.CreateModelMixin,mixins.ListModelMixin,mixins.RetrieveModelMixin,viewsets.GenericViewSet#يربط الميكسينز مع الراوتر والريتريف هو عرض شكوى واخدة
    ):
    filter_backends=[DjangoFilterBackend,SearchFilter,OrderingFilter]
    filterset_fields =['status']
    search_fields=['title','description']
    ordering_fields=['created_at','replies_at']

    def get_serializer_class(self):#نختار السيرياليز حسب العمليه 
        if self.action=='create':
            return ComplaintCreateSerializer
        return ComplaintSerializer
    def get_queryset(self):#نفلتر الشكاوي حسب دور المستخدم
        user=self.request.user
        if user.role=='beneficiary':
            return Complaint.objects.filter(user=user)
        elif user.role =='helpdesk':
            return Complaint.objects.all()
        else:
            return Complaint.objects.none()
    def get_permissions(self):#نختار الصلاحيه حسب العمليه
        if self.action=='create':
            return[IsBeneficiaryForCreate()]
        elif self.action in ['list','retrieve']:
            return[IsOwnerOrStaff()]
        elif self.action == 'reply':
            return [IsHelpDeskForReply()]
        return [IsAuthenticated()]
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        #لتحديد اسم صاحب الشكوى
    def create(self, request, *args, **kwargs):
        # نستقبل البيانات بسيرياليزر الإنشاء
        create_serializer = self.get_serializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        # نحفظ (perform_create بيحط user)
        self.perform_create(create_serializer)
        # نرجّع الرد بسيرياليزر العرض الكامل (مع id, status, created_at)
        read_serializer = ComplaintSerializer(create_serializer.instance)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)
    @action(detail=True, methods=['post'], url_path='reply')
    def reply(self, request, pk=None):
        complaint = self.get_object()
        serializer = ReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint.reply = serializer.validated_data['reply']
        complaint.replied_by = request.user
        complaint.save()  # الموديل (save) يتكفّل بالباقي
        return Response(ComplaintSerializer(complaint).data)