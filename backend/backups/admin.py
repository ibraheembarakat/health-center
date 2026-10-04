from django.contrib import admin
from .models import Backup


@admin.register(Backup)
class BackupAdmin(admin.ModelAdmin):
    list_display = (
        'file_path',
        'get_file_size_display',
        'created_by',
        'created_by_first_name',
        'created_by_last_name',
        'created_at',
    )

    list_filter = (
        'created_at',
    )

    search_fields = (
        'file_path',
        'created_by__username',
        'created_by__first_name',
        'created_by__last_name',
    )

    readonly_fields = (
        'file_path',
        'file_size',
        'created_by',
        'created_at',
    )

    fieldsets = (
        ('Backup data', {
            'fields': (
                'file_path',
                'file_size',
                'created_by',
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

    @admin.display(description='File size')
    def get_file_size_display(self, obj):
        if obj.file_size < 1024:
            return f'{obj.file_size} B'
        elif obj.file_size < 1024 * 1024:
            return f'{round(obj.file_size / 1024, 1)} KB'
        else:
            return f'{round(obj.file_size / (1024 * 1024), 1)} MB'

    @admin.display(description='Creator first name')
    def created_by_first_name(self, obj):
        return obj.created_by.first_name

    @admin.display(description='Creator last name')
    def created_by_last_name(self, obj):
        return obj.created_by.last_name