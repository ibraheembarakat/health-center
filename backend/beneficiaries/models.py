from django.db import models 
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator 
from django.core.exceptions import ValidationError 
from users.models import CustomUser 
 
# Create your models here. 
class Beneficiary(models.Model): 
    GENDER_CHOICES=[ 
        ('M','Male'), 
        ('F','Female'), 
    ] 
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, verbose_name='User',related_name='beneficiary_profile') 
    #هون انا ورثت الجدزل 
    # يعني كل مستخدم رح يكون عنده ملف شخصي واحد فقط من نوع المستفيد 
    #واذا تم حذف المستخدم رح يتم حذف الملف الشخصي الخاص فيه 
    #related_name يعني لما اجي من جدول المستخدم واريد اوصل لملف المستفيد بستخدم هاد الاسم 
    date_of_birth=models.DateField(verbose_name='Date of birth') 
    gender=models.CharField(max_length=1,choices=GENDER_CHOICES,verbose_name='Gender') 
    registration_date=models.DateField(auto_now_add=True,verbose_name='Registration date') 
    #auto_now_add يعني لما يتم انشاء سجل جديد رح ياخذ تاريخ الانشاء تلقائيا 
    height=models.DecimalField(max_digits=5, decimal_places=2, verbose_name='Height (cm)',validators=[MinValueValidator(40, message="Height must be at least 40 cm."), MaxValueValidator(200, message="Height must not exceed 200 cm.")]) 
    weight=models.DecimalField(max_digits=5, decimal_places=2, verbose_name='Weight (kg)',validators=[MinValueValidator(2, message="Weight must be at least 2 kg."), MaxValueValidator(120, message="Weight must not exceed 120 kg.")]) 
    BMI=models.DecimalField(max_digits=5, decimal_places=2, verbose_name='Body mass index (BMI)', editable=False) 
    NUTRITION_STATUS_CHOICES = [ 
    ('severe_malnutrition', 'Severe malnutrition'), 
    ('moderate_malnutrition', 'Moderate malnutrition'), 
] 
    nutrition_status=models.CharField(max_length=25, choices=NUTRITION_STATUS_CHOICES, verbose_name='Nutrition status', editable=False) 

    photo = models.ImageField(
        upload_to='beneficiaries/profile_images/',
        max_length=255,
        null=True,
        blank=True,
        verbose_name='Beneficiary profile photo',
    )

    face_encoding = models.JSONField(
        null=True,
        blank=True,
        editable=False,
        verbose_name='Face encoding',
    )

    class Meta: 
        verbose_name = 'Beneficiary' 
        verbose_name_plural = 'Beneficiaries' 
    def __str__(self): 
        return f"{self.user.username} - {self.get_nutrition_status_display()}" 
    def save(self, *args, **kwargs): 
        self.BMI = round(self.weight / ((self.height / 100) ** 2), 2) 
        if self.BMI < 16: 
            self.nutrition_status = 'severe_malnutrition' 
        elif self.BMI < 17: 
            self.nutrition_status = 'moderate_malnutrition' 
        else: 
            raise ValidationError( 
                f'This person cannot be registered. Body mass index (BMI) = {self.BMI}. ' 
                f'The center only accepts severe malnutrition cases (BMI below 16) or moderate malnutrition cases (BMI from 16 to 16.99).' 
            ) 
        super().save(*args, **kwargs) 