from rest_framework import mixins#هون مشان يرجع اكتر من نوع وعنا راوتر بحددلنا شو برجع
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from rest_framework.response import Response#حتى نرجع رد للفرونت 
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer,SendNotificationSerializer
from .permissions import IsRecipient,CanSendNotifications

class NotificationViewSet(mixins.ListModelMixin,mixins.RetrieveModelMixin, GenericViewSet):#فيو سيت خاص بالاشعارات يعني انهالكلاس رح يمسك روابط لبعدين
    serializer_class = NotificationSerializer#لتحويلها ل json
    filterset_fields=['is_read','notification_type']# فلتره للربط
    def get_queryset(self):#البيانات يللي مسموح شوفها
        return Notification.objects.filter(recipient=self.request.user)#اي سجلات من جدول النوتيفيكيشن مسموح للمستخدم يشوفها 
    def get_permissions(self):#العمليه المسمحلي اعملها
        if self.action=='send':
            return [CanSendNotifications()]
        return [IsRecipient()]#الاذن للمستخدمين اللي رح يشوفو الاشعارات
    #ولازم يكون مسجل دخول عشان يشوف الاشعارات
    #قائمه الاشعارات غير المقروءة

    @action(detail=False, methods=['get'])
    def unread(self,request):#اسم الداله صار جزء من الرابط
        qs=self.get_queryset().filter(is_read=False)#نجيب الاشعارات
        serializer=self.get_serializer(qs,many=True)#نحولها ل json ماني تساوي ترو لان ممكن يكون عنا اكتر من اشعار 
        return Response(serializer.data)#هون منرجع النتيجه كجيسون
    
    #عدد الاشعارات غير المقروءه
    @action(detail=False,methods=['get'],url_path='unread-count')#هون غيرنا اسم الرابط
    def unread_count(self,request):
        count=self.get_queryset().filter(is_read=False).count()#نحسب عدد الاشعارات غير المقروءه
        return Response({'count':count})#نرجعها كجيسون
    #تعلم اشعار كمقروء 
    @action(detail=True,methods=['post'],url_path='mark-read')#هون غيرنا اسم الرابط
    def mark_as_read(self,request,pk=None):#هون غيرنا اسم الرابط
        notification=self.get_object()#نجيب الاشعار
        notification.is_read=True#نغير حالته لمقروء
        notification.read_at=timezone.now()#نحط وقت القراءة
        notification.save()#نحفظ التغيرات
        return Response({'status':'marked as read'})
    #تعليم كل الاشعارات كمقروءه
    @action(detail=False,methods=['post'],url_path='mark-all-read')#هون غيرنا اسم الرابط
    def mark_all_as_read(self,request):
        updated=self.get_queryset().filter(is_read=False).update(is_read=True,read_at=timezone.now())#نغير كل الاشعارات غير المقروءه لمقروءه
        return Response({'marked':updated})#نرجع عدد الاشعارات الي تغيرت    
    #ارسال اشعارات يدوية
    @action(detail=False,methods=['post'],url_path='send')#هون غيرنا اسم الرابط 
    def send(self,request):
        serializer=SendNotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recipients=serializer.validated_data['recipients']
        title=serializer.validated_data['title']
        message=serializer.validated_data['message']
        notification=[Notification(recipient_id=recipient_id,sent_by=request.user,title=title,message=message,notification_type='manual')
        for recipient_id in recipients]
        Notification.objects.bulk_create(notification)
        return Response({'status':'notifications sent','count':len(notification)})
