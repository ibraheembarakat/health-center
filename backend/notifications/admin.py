from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'recipient',
        'recipient_first_name',
        'recipient_last_name',
        'sent_by',
        'title',
        'notification_type',
        'is_read',
        'is_active',
        'created_at',
    )

    list_filter = (
        'notification_type',
        'is_read',
        'is_active',
        'created_at',
    )

    search_fields = (
        'title',                    # بحث في العنوان
        'message',
        'recipient__username',      # بحث باسم المستلم
        'recipient__first_name',    # بحث بالاسم الأول
        'recipient__last_name',     # بحث بالكنية
        'recipient__national_id',
        'sent_by__username',
    )

    readonly_fields = (
        'created_at',
        'read_at',
    )

    fieldsets = (
        ('Notification content', {
            'fields': (
                'title',
                'message',
                'notification_type',
            ),
        }),
        ('Participants', {
            'fields': (
                'recipient',
                'sent_by',
            ),
        }),
        ('Notification status', {
            'fields': (
                'is_read',
                'is_active',
                'read_at',
            ),
        }),
        ('Dates', {
            'fields': (
                'created_at',
            ),
        }),
    )

    # ===== ترتيب افتراضي =====
    ordering = ('-created_at',)

    @admin.display(description='Recipient first name')
    def recipient_first_name(self, obj):
        return obj.recipient.first_name

    @admin.display(description='Recipient last name')
    def recipient_last_name(self, obj):
        return obj.recipient.last_name