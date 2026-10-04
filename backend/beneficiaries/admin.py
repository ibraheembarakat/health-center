from django.contrib import admin
from .models import Beneficiary


@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'photo',
        'user_first_name',
        'user_last_name',
        'date_of_birth',
        'gender',
        'registration_date',
        'height',
        'weight',
        'BMI',
        'nutrition_status',
    )

    list_filter = (
        'nutrition_status',
        'gender',
        'registration_date',
    )

    search_fields = (
        'user__username',
        'user__first_name',
        'user__last_name',
        'user__national_id',
    )

    readonly_fields = (
        'photo',
        'BMI',
        'nutrition_status',
        'registration_date',
    )

    fieldsets = (
        ('Linked user', {
            'fields': (
                'user',
            ),
        }),
        ('Personal data', {
            'fields': (
                'photo',
                'date_of_birth',
                'gender',
            ),
        }),
        ('Physical and nutritional data', {
            'fields': (
                'height',
                'weight',
                'BMI',
                'nutrition_status',
            ),
        }),
        ('Registration information', {
            'fields': (
                'registration_date',
            ),
        }),
    )

    @admin.display(description='First name')
    def user_first_name(self, obj):
        return obj.user.first_name

    @admin.display(description='Last name')
    def user_last_name(self, obj):
        return obj.user.last_name