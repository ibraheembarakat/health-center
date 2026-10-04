from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'user',
        'user_first_name',
        'user_last_name',
        'status',
        'created_at',
        'replied_by',
        'replies_at',
    )

    list_filter = (
        'status',
        'created_at',
        'replies_at',
    )

    search_fields = (
        'title',
        'description',
        'user__username',
        'user__first_name',
        'user__last_name',
        'user__national_id',
    )

    readonly_fields = (
        'user',
        'title',
        'description',
        'status',
        'replied_by',
        'created_at',
        'replies_at',  # ← اسم الحقل عندك replies_at مش replied_at
    )

    fieldsets = (
        ('Complaint data', {
            'fields': (
                'user',
                'title',
                'description',
            ),
        }),
        ('Complaint reply', {
            'fields': (
                'status',
                'reply',
                'replied_by',
                'replies_at',
            ),
        }),
        ('Dates', {
            'fields': (
                'created_at',
            ),
        }),
    )

    ordering = ('-created_at',)

    def has_add_permission(self, request):
        return False

    def get_readonly_fields(self, request, obj=None):
        readonly = self.readonly_fields

        if obj and obj.reply:
            return readonly + ('reply',)

        return readonly

    def save_model(self, request, obj, form, change):
        if obj.reply and not obj.replied_by:
            obj.replied_by = request.user

        super().save_model(request, obj, form, change)

    @admin.display(description='First name')
    def user_first_name(self, obj):
        return obj.user.first_name

    @admin.display(description='Last name')
    def user_last_name(self, obj):
        return obj.user.last_name