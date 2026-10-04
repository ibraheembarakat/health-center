from rest_framework_simplejwt.serializers import TokenObtainPairSerializer#كلاس يتامد من اليوزر نيم والباسوورد ويتاكد اذا الحساب اكتيف ويولد ريفريش واكسيس توكن
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.contrib.auth import login#بيعمل سيسن للمستخدم بنستخدمه فقط بحاله المدير فقط اذا الرول يساوي
'''class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):#ماعمل اوفر رايد للسيرياليزر الجاهز وهاد السيرياليزر من احل تسجيل الدخول 
    def validate(self, attrs):#بيانات تدخل الى الاي تي تي ار 
        
        try:
            data = super().validate(attrs)
        except AuthenticationFailed:
            raise AuthenticationFailed(
                "the password or username is not true",
                code='authentication_failed'
            )# استدعاء الكلاس الاب للتحقق من صحه اليوزر وكلمه السر 
        user = self.user 
        data['id']=user.id 
        data['username']=user.username
        data['email']=user.email
        data['full_name']=f"{user.first_name} {user.last_name}".strip()# الستريب ضفتا مشان تشيل الفراغات الزياده من بدياه النص واخر النص

        if user.role=='manager':
            request =self.context.get('request')#هون بجيب الريكويست من داخل الاسيرياليزر
            if request is not None :
                login(request,user)# هون اعملنا سيشن للمستخدم
        return data'''
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        User = get_user_model()
        username_or_email = attrs.get(self.username_field)

        if username_or_email and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                attrs[self.username_field] = user_obj.username
            except User.DoesNotExist:
                pass

        try:
            data = super().validate(attrs)
        except AuthenticationFailed:
            raise AuthenticationFailed(
                "the password or username is not true",
                code='authentication_failed'
            )

        user = self.user

        data['id'] = user.id
        data['username'] = user.username
        data['email'] = user.email
        data['role'] = user.role
        data['full_name'] = f"{user.first_name} {user.last_name}".strip()

        if user.role == 'manager':
            request = self.context.get('request')
            if request is not None:
                login(request, user)

        return data