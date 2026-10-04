from django.db import models
from django.conf import settings
class Backup(models.Model):
    file_path = models.CharField(
        max_length=500,
        verbose_name='File path'
    )
    file_size = models.PositiveIntegerField(
        verbose_name='File size (bytes)'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_backups',
        verbose_name='Created by'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Created at'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Backup'
        verbose_name_plural = 'Backups'
    
    def __str__(self):
        return f"Backup — {self.created_at.strftime('%Y-%m-%d %H:%M')}"