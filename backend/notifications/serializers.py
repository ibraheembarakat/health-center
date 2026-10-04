from rest_framework import serializers
from .models import Notification
from beneficiaries.models import Beneficiary
class NotificationSerializer(serializers.ModelSerializer):
    sender_name=serializers.SerializerMethodField()
    type_display=serializers.CharField(source='get_notification_type_display', read_only=True)
    class Meta:
        model=Notification
        fields=['id','sender_name','title','message','notification_type','type_display','is_read','created_at']
        read_only_fields = ['id','title','message','notification_type','is_read','created_at']
    def get_sender_name(self,obj):
        full_name=obj.sent_by.get_full_name()
        return full_name if full_name.strip() else obj.sent_by.username
class SendNotificationSerializer(serializers.Serializer):
    recipients=serializers.ListField(child=serializers.IntegerField(), allow_empty=False)
    title=serializers.CharField(min_length=1, max_length=200)
    message=serializers.CharField(min_length=10)
    def validate_recipients(self, value):
        unique_ids=list(set(value))
        existing_beneficiary_user_ids=Beneficiary.objects.filter(user_id__in=unique_ids).values_list('user_id', flat=True)#هون يعني ارقام باللائحه ما ك تيوبلز موجودين باللائحه
        invalid_ids=[i for i in unique_ids if i not in existing_beneficiary_user_ids]
        if invalid_ids:
            raise serializers.ValidationError(f"Invalid recipient IDs: {invalid_ids}")
        return unique_ids
