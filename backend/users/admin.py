from django.contrib import admin
from django.core.exceptions import ValidationError
#استيراد مظام لوحه الادارى الجاهزه في دحانغو
# Register your models here.
# هون بضيف عليه اذا بدي المدير يضيف عقاهدع البيانات
from django.contrib.auth.admin import UserAdmin
# شي جاهو لادارة المستخدمين داخل ادمن
# يعني مثلا لتغيير كلمات السر عنا بالنظام
from .models import CustomUser


@admin.register(CustomUser)
#سجّل موديل CustomUser داخل Django Admin
#واستخدم معه طريقة العرض والإدارة الجاهزة UserAdmin.
class CustomUserAdmin(UserAdmin):
    list_display = (
        'username',
        'first_name',
        'last_name',
        'email',
        'role',
        'phone',
        'date_joined',
        'is_staff',
        'is_active',
        'is_superuser',
    )

    list_filter = (
        'role',
        'is_staff',
        'is_active',
        'is_superuser',
        'date_joined',
    )

    search_fields = (
        'username',
        'first_name',
        'last_name',
        'email',
        'phone',
        'national_id',
    )

    readonly_fields = (
        'date_joined',
        'last_login',
        'is_staff',
        'is_superuser',
    )

    fieldsets = (
        ('Account', {
            'fields': (
                'username',
                'password',
            ),
        }),
        ('Personal information', {
            'fields': (
                'first_name',
                'last_name',
                'email',
                'phone',
                'address',
                'national_id',
            ),
        }),
        ('Role and permissions', {
            'fields': (
                'role',
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            ),
        }),
        ('Important dates', {
            'fields': (
                'last_login',
                'date_joined',
            ),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': (
                'wide',
            ),
            'fields': (
                'username',
                'email',
                'phone',
                'address',
                'national_id',
                'role',
                'password1',
                'password2',
                'first_name',
                'last_name',
            ),
        }),
    )

    ordering = (
        'role',
        'username',
    )

    # ===== منع إنشاء Manager ثاني =====
    def save_model(self, request, obj, form, change):
        # هل الـ role المختار هو manager؟
        if obj.role == 'manager':
            # ابحث عن أي manager موجود في DB
            existing_manager = CustomUser.objects.filter(
                role='manager'
            ).exclude(
                pk=obj.pk  # استثني المستخدم الحالي (حالة التعديل)
            ).exists()

            # لو لقى manager ثاني → ارفض
            if existing_manager:
                raise ValidationError(
                    'Only one manager is allowed in the system.'
                )

        # لو مفيش تعارض → احفظ عادي
        super().save_model(request, obj, form, change)