from django.utils import timezone

from django.db import models
from users.models import CustomUser
from django.core.exceptions import ValidationError
class Complaint(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('resolved', 'Resolved'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name='User', related_name='complaints')
    status=models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Status')
    title = models.CharField(max_length=200, verbose_name='Complaint title')
    description = models.TextField(verbose_name='Complaint description')
    reply = models.TextField(blank=True, null=True, verbose_name='Reply')
    replied_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Replied by', related_name='replied_complaints')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created at',editable=False)
    replies_at = models.DateTimeField(blank=True, null=True, verbose_name='Replied at',editable=False)
    class Meta:
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"
    def save(self, *args, **kwargs):
        if self.reply and not self.replied_by:
            raise ValidationError("The employee who replied must be specified when a reply is provided.")
        is_new_reply = bool(self.reply) and not self.replies_at
            
        if is_new_reply:
            self.replies_at=timezone.now()
            self.status='resolved'
            #هون مشان في حال ردينا ينحفظ الوقت التلقائي للرد
        super().save(*args, **kwargs) 
        if is_new_reply:
            from notifications.models import Notification
            Notification.objects.create(
                recipient=self.user,
                sent_by=self.replied_by,
                title='Reply to complaint',
                message=f'Your complaint "{self.title}" has been answered. Click to view the reply.',
                notification_type='complaint_reply',
            )
# Create your models here.