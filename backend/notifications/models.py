from django.utils import timezone

from django.db import models
from users.models import CustomUser


class Notification(models.Model):
    recipient = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        verbose_name='Recipient',
        related_name='notifications',
    )
    sent_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        verbose_name='Notification sender',
        related_name='sent_notifications',
    )
    message = models.TextField(
        verbose_name='Message',
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Created at',
        editable=False,
    )
    title = models.CharField(
        max_length=200,
        verbose_name='Notification title',
    )

    NOTIFICATION_TYPE_CHOICES = [
        ('complaint_reply', 'Complaint reply'),
        ('aid_pickup', 'Aid pickup appointment'),
        ('aid_received', 'Aid received confirmation'),
        ('manual', 'Manual notification'),
    ]

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPE_CHOICES,
        verbose_name='Notification type',
    )
    is_read = models.BooleanField(
        default=False,
        verbose_name='Is read',
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Is active',
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        editable=False,
        verbose_name='Read at',
    )

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.username}"

    def save(self, *args, **kwargs):
        if self.is_read and not self.read_at:
            self.read_at = timezone.now()

        super().save(*args, **kwargs)


# Create your models here.