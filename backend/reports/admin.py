from django import forms
from django.contrib import admin
from django.core.exceptions import ValidationError

from .models import Report


class ReportAdminForm(forms.ModelForm):
    class Meta:
        model = Report
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        period_start = cleaned_data.get('period_start')
        period_end = cleaned_data.get('period_end')

        if (
            period_start
            and period_end
            and period_start > period_end
        ):
            raise ValidationError(
                'The period start date cannot be after the period end date.'
            )

        return cleaned_data


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    form = ReportAdminForm

    list_display = (
        'title',
        'report_type',
        'period_start',
        'period_end',
        'created_by',
        'created_by_first_name',
        'created_by_last_name',
        'created_at',
    )

    list_filter = (
        'report_type',
    )

    search_fields = (
        'title',
        'created_by__username',
        'created_by__first_name',
        'created_by__last_name',
    )

    readonly_fields = (
        'created_by',
        'created_at',
        'updated_at',
    )

    fieldsets = (
        ('Report information', {
            'fields': (
                'title',
                'report_type',
                'content',
            ),
        }),
        ('Report period', {
            'fields': (
                'period_start',
                'period_end',
            ),
        }),
        ('Creation information', {
            'fields': (
                'created_by',
                'created_at',
                'updated_at',
            ),
        }),
    )

    ordering = ('-created_at',)

    def save_model(self, request, obj, form, change):
        if not obj.created_by_id:
            obj.created_by = request.user

        super().save_model(request, obj, form, change)

    @admin.display(description='Creator first name')
    def created_by_first_name(self, obj):
        return obj.created_by.first_name

    @admin.display(description='Creator last name')
    def created_by_last_name(self, obj):
        return obj.created_by.last_name