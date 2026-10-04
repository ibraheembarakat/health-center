

# Create your views here.
#هون تاخد الطلب وترد استجابه يللي هي json
#مكان دوال ال api
'''from django.http import JsonResponse 
#تحول بيانات python الى json وتردها ك response
def welcome(request):# وهاد التابع برد جيسون 
    # وعرفت تابع بياخد الريكويست وبحوله لبايثون
    data = {
        "message": "مرحباً بمركز دعم التغذية الصحية"
    }
    return JsonResponse(data, json_dumps_params={'ensure_ascii': False})
# هون مشان اللغه ما يحولها لرموز '''
from rest_framework_simplejwt.views import TokenObtainPairView
#هاد شي جاهز بيستقبل اليوزر نيم والباسوورد وبيبعتلهن للسيرياليزر وبرد الريسبونز يللي فيه الاكسيس والريفريش
from rest_framework.permissions import AllowAny , IsAuthenticated # لان اللوج ان لازم يكون متاح للجميع
from .serializers import CustomTokenObtainPairSerializer #هذا السيرياليزر يللي كتبناه بملف السيرياليزر
from rest_framework.views import APIView #بدنا نعمل فيو بسيط فيه داله بوست
#وظيفه الفيو جديد بس انه يقتل الريفريش توكن
from rest_framework.response import Response # هون ليبعت الجيسون يللي هي الاي بي اي
from rest_framework import status  #لكتابه اكواد واضحه بحالات الاخطاء
from rest_framework_simplejwt.tokens import RefreshToken# بحول التوكن لاوبجيكت مشان لبعدين اقتله بالديد ليست
from rest_framework_simplejwt.exceptions import TokenError# بيمسك التوكن اذا كان فيه غلط او منتهي 
from django.contrib.auth import logout 
from django.contrib.auth.tokens import default_token_generator # هي مولد توكن جاهز مشان اعاده تعيين كلمه المرور
from django.utils.http import urlsafe_base64_encode #يحول رقم المستخدم الى نص امن للاستخدام بالرابط
from django.utils.encoding import force_bytes #بحول رقم المستخدم الى بايتس قبل ميدخله ب يو ار ال سيف انكود يعني بالامبروت يللي فوقها
from django.core.mail import send_mail #هاد تابع ارسال الايميل
from django.contrib.auth import get_user_model #يرجع موديل المستخدم الحالي بمشروعك 
 #موديل المستخدم الحالي بمشروعي .يعني بكتب هيك بدل ماكتب كوستوم يوزر احسنلي 
from django.utils.http import urlsafe_base64_decode #مشان فك تشفير اليو اي دي يللي بعته عالايميل
from django.utils.encoding import force_str #مشان نحول نتيجه فك الترميز من بايت لرقم
from rest_framework.exceptions import PermissionDenied
class CustomTokenObtainPairView(TokenObtainPairView):# هون كلاس بيورث فيو تسجيل الدخول الجاهز الخاص ب 
        serializer_class = CustomTokenObtainPairSerializer #هون مشان وقت يجي طلب ما نستخدم السيرياليزر الافتراضي ونستخدم السيرياليزر يللي كتبناه من فوق 
        permission_classes = [AllowAny] #هي الايند بوينتس مفتوحه قدام الكل

class LogoutView(APIView):# ايند بوينت لتسجيل الخروج
    permission_classes = [IsAuthenticated]# فقط اذا كنت انا مسجل دهول فيي اعمل تسجيل خروج
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail':'refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({'detail':'The token is invalid or expired'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.role=='manager':
            logout(request)
        return Response({'detail':'Logout successful'}, status=status.HTTP_205_RESET_CONTENT)
class PasswordResetView(APIView):
    permission_classes = [AllowAny]#هي مسموح لاي شخص
    def post(self, request):
        email = request.data.get('email')#يمكن يكون الايميل غير موجود
        if not email :
            return Response({'detail':'email is required'},status=status.HTTP_400_BAD_REQUEST)
        User = get_user_model()
        try :
            user=User.objects.get(email=email)
        except User.DoesNotExist :
            user=None
        if user is not None :
            token =default_token_generator.make_token(user)#توليد توكنم لاعاده تعيين كلمه السر 
            uid = urlsafe_base64_encode(force_bytes(user.pk))#اخدت رقم المستفيد وحولته لصيغه امنه فيني ابعتها بالايميل 
            message = (
                f"To reset your password, use the following values:\n\n"
                f"uid: {uid}\n"
                f"token: {token}\n\n"
                f"This reset token is valid for one hour."
            )
            send_mail(
                subject="Password Reset - Health Nutritional Support Center",
                message=message,
                from_email=None,# مشان يرجع عالافتراضي
                recipient_list=[email],#ارسال الايميل للايميل يللي كتبه المستخدم
                fail_silently=False,#اذا فشل الارسال احكي ما تسكت
            )
        return Response({"detail": "If the email is registered, a password reset link has been sent."},status=status.HTTP_200_OK)
class PasswordResetConfirmView(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        uid=request.data.get('uid')
        token=request.data.get('token')
        new_password=request.data.get('new_password')
        #هون بجيبن وبخزنن الخطوة يللي بعدها تحقق منن
        if not uid or not token or not new_password:
            return Response({"detail": "uid, token and new_password are required"},status=status.HTTP_400_BAD_REQUEST)
        User = get_user_model()
        try:
            pk=force_str(urlsafe_base64_decode(uid))
            user=User.objects.get(pk=pk)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'detail':'invalid or expired reset link'},status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user,token):
            return Response({'detail':'invalid or expired reset link'},status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password has been reset successfully"},status=status.HTTP_200_OK)

class CurrentUserView(APIView):
   # يرجّع بيانات الموظف المسجّل دخوله — للموظفين فقط (مش المستفيدين).
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        # المستفيد يستخدم /api/beneficiaries/me/ بدلاً من هنا
        if user.role == 'beneficiary':
            raise PermissionDenied("هذه الصفحة مخصصة للموظفين فقط.")
        return Response({"id": user.id,"username": user.username,"email": user.email,"first_name": user.first_name,"last_name": user.last_name,"full_name": f"{user.first_name} {user.last_name}".strip(),"role": user.role,"phone": user.phone,"address": user.address,})   
     