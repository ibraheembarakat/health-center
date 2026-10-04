from django.db import models
from django.conf import settings
class Report(models.Model):
    REPORT_TYPE_CHOICES=[
        ('monthly','Monthly'),
        ('yearly','Yearly'),
        ('custom','Custom'),
    ]
    title=models.CharField(max_length=255,verbose_name='Report title')
    report_type=models.CharField(max_length=20,choices=REPORT_TYPE_CHOICES,verbose_name='Report type')
    content=models.JSONField(verbose_name='Report content')
    period_start=models.DateField(verbose_name='Period start date')
    period_end=models.DateField(verbose_name='Period end date')  
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='created_reports', verbose_name='Created by')
   # هون بس المدير بينشئ التقارير
    created_at=models.DateTimeField(auto_now_add=True,verbose_name='Created at')
    updated_at=models.DateTimeField(auto_now=True,verbose_name='Updated at')
    class Meta:
        verbose_name='Report'
        verbose_name_plural='Reports'
        ordering=['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_report_type_display()})"