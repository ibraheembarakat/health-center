from rest_framework import serializers# هو بحول البيانات من اوبجكت لجيسون
from .models import Complaint

class ComplaintSerializer(serializers.ModelSerializer):
    user_name=serializers.SerializerMethodField()
    replied_by_name=serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)# هون كل شي للباك الفرونت ما الهن علاقه 
    class Meta:
        model=Complaint
        fields=['id','user_name','title','description','status','status_display','reply','replied_by_name','replies_at','created_at']
        read_only_fields=fields
    def get_user_name(self,obj):
        full_name=obj.user.get_full_name()
        return full_name if full_name.strip() else obj.user.username
    def get_replied_by_name(self,obj):
        if obj.replied_by:
            full_name=obj.replied_by.get_full_name()
            return full_name if full_name.strip() else obj.replied_by.username
        return None
class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model =Complaint
        fields=['title','description']#بكفي نرسل هدول وقت الشكوى
        def validate_title(self,value):
            if len(value.strip())<5:
                raise serializers.ValidationError("the title must be more than 5 words")
            if len(value.strip())>200:
                raise serializers.ValidationError("the title cant be more than 200 words")
            return value
        def validate_description(self,value):
            if len(value.strip())<10:
                raise serializers.ValidationError("the discription must be more than 10 words")
            return value
class ReplySerializer(serializers.Serializer):
    reply =serializers.CharField()
    def validate_reply(self, value):
        if len(value.strip())<5:
            raise serializers.ValidationError("the answer must be 5 words at least")
        return value
        
        
            
