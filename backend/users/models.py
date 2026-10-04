from django.db import models
#هون بكتب بايثون بدل ماي اس كيو ال  يعني هون بتعامل مع قاعده البيانات
# Create your models here.
from django.contrib.auth.models import AbstractUser
# هون بعمل جدول جديد اسمه يوزر وبيكون فيه الحقول الافتراضيه لليوزر زي الاسم والبريد الالكتروني وكلمه السر
#بضيفا لهي مشان خليه يورث كل المستهدمين من هالجدول كله حسب دوره حسب كل مين بسجل دخول 
from django.core.validators import RegexValidator
#مشان التحقق من رقم الهاتف او الرقم الوطني  او اي شي بدي اتحقق منه مثلا هي هيي الفاليديت والتابع هو regex
from django.core.exceptions import ValidationError
# هون بستخدمه اذا بدي ارمي خطا معين اذا ما تحقق شرط معين مثلا   



class CustomUser(AbstractUser):
    REQUIRED_FIELDS=['email','phone','address','national_id']
    ROLE_CHOICES = [
        ('beneficiary','Beneficiary'),
        ('registration','Registration'),
        ('awareness','Awareness'),
        ('helpdesk','Help desk'),
        ('manager','Manager')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='beneficiary',verbose_name='Role')
    phone_validator=RegexValidator(regex=r'^09[0-9]{8}$', message="The phone number must start with 09 and contain exactly 10 digits.")
#هون عملت تحقق ريجيكس (^هو رقم بدايه النص ) الصفر بتجي اول شي بعدها لازم يكون ارقام من صفر لتسعهوعددهن لازم يكون تسعه
#$ دولار بتغبر عن نهايه القراءه
    phone =models.CharField(max_length=10, validators=[phone_validator], verbose_name='phone number')
    address =models.TextField(verbose_name='address')
    national_id = models.CharField(max_length=11,unique=True, validators=[RegexValidator(regex=r'^[0-9]{11}$', message="The national ID must contain exactly 11 digits.")], verbose_name='national id')
    class Meta:# هون بحدد اسم العرض في الادمن
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    def __str__(self):
            return f"{self.username} ({self.get_role_display()})"
        #وظيفه الاف هو بحول النص لسترينج بيسمحلي حط متحولات داخله
        #ممكن احذف عرض الدور لبعدين
        # سيف هو عباره عن تابع جاهز بجانغو نحن منعمله اوفررايد عند حالات معينه
    def save(self, *args, **kwargs):
        if self.role =='manager':
            existing_manager = CustomUser.objects.filter(role='manager').exclude(pk=self.pk).exists()
            #كوستوم يوزر هو اسم الجدول دوت اوبجيكتس يللي هو الماناجر في جانغو دوت اسم التابع (عنا الفلتر هو مشانيصفي الغيت مشان يجيب واحدوالاولكل المستخدمين
            # هون بعدين اكسكلود يعني باستثناء البرايماري كي حيث البرايماري كي تساويالغرض نفسه دوت البرايماري كي تبعه  
            #اكسيست ترجع ترو او فولس اذا فيه او ما فيه والفيرست بتجيب اول سطر بعد الفلتره بس بدون 
            if existing_manager:
                raise ValidationError("Only one manager is allowed in the system.")
            self.is_staff = True
            #المدير لازم يكون ستاف يعني يقدر يدخل الادمن
            self.is_superuser = True
            # عنده كل الصلاحيات
        else:
            self.is_staff = False
            self.is_superuser = False
        super().save(*args, **kwargs)
        # هون مشان بعد مخلصت شغلي يستدعي السيف الاصليه مشان تنحفظ بقاعده البيانات
    def is_manager_role(self):
        return self.role == 'manager'
    #هالتابع بستخدمه اذا بدي اعرف اذا هاد المستخدم هو مدير او لا
    def is_beneficiary_role(self):
        return self.role == 'beneficiary'
    #هالتابع بستخدمه اذا بدي اعرف اذا هاد المستخدم هو مستفيد او لا
    def is_registration_role(self):
        return self.role == 'registration'
    #هالتابع بستخدمه اذا بدي اعرف اذا هاد المستخدم هو تسجيل او لا
    def is_awareness_role(self):
        return self.role == 'awareness'
    #هالتابع بستخدمه اذا بدي اعرف اذا هاد المستخدم هو توعيه او لا
    def is_helpdesk_role(self):
        return self.role == 'helpdesk'
    #هالتابع بستخدمه اذا بدي اعرف اذا هاد المستخدم هو مكتب مساعدة او لا