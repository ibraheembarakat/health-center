from django.contrib import admin
from .models import AidSchedule, AidHistory


@admin.register(AidSchedule)
class AidScheduleAdmin(admin.ModelAdmin):

    # ===== الأعمدة في صفحة القائمة =====
    list_display = (
        'beneficiary',
        'beneficiary_first_name',
        'beneficiary_last_name',
        'schedule_date',
        'status',
        'created_by',
        'created_by_first_name',
        'created_by_last_name',
        'created_at',
    )

    # ===== فلاتر جانبية =====
    list_filter = (
        'status',
    )

    # ===== حقول البحث =====
    search_fields = (
        'beneficiary__user__username',
        'beneficiary__user__first_name',
        'beneficiary__user__last_name',
        'beneficiary__user__national_id',
    )

    # ===== حقول للقراءة فقط =====
    readonly_fields = (
        'status',
        'created_at',
        'updated_at',
    )

    # ===== تنظيم الحقول =====
    fieldsets = (
        ('Schedule data', {
            'fields': (
                'beneficiary',
                'schedule_date',
                'status',
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

    ordering = ('-schedule_date',)

    # ===== Actions جماعية =====
    actions = ('mark_as_missed',)

    @admin.display(description='Beneficiary first name')
    def beneficiary_first_name(self, obj):
        return obj.beneficiary.user.first_name

    @admin.display(description='Beneficiary last name')
    def beneficiary_last_name(self, obj):
        return obj.beneficiary.user.last_name

    @admin.action(description='Mark selected appointments as missed')
    def mark_as_missed(self, request, queryset):
        updated_count = queryset.filter(
            status='pending'
        ).update(status='missed')
        self.message_user(
            request,
            f'{updated_count} appointment(s) were marked as missed.'
        )

    # ===== دوال العرض =====
    @admin.display(description='Creator first name')
    def created_by_first_name(self, obj):
        return obj.created_by.first_name

    @admin.display(description='Creator last name')
    def created_by_last_name(self, obj):
        return obj.created_by.last_name


@admin.register(AidHistory)
class AidHistoryAdmin(admin.ModelAdmin):

    # ===== الأعمدة في صفحة القائمة =====
    list_display = (
        'get_beneficiary',
        'beneficiary_first_name',
        'beneficiary_last_name',
        'delivery_date',
        'confirmed_by_beneficiary',
        'face_verified',
        'face_match_score',
        'delivered_by',
        'delivered_by_first_name',
        'delivered_by_last_name',
    )

    # ===== فلاتر جانبية =====
    list_filter = (
        'confirmed_by_beneficiary',
        'face_verified',
    )

    # ===== حقول البحث =====
    search_fields = (
        'aid_Schedule__beneficiary__user__username',
        'aid_Schedule__beneficiary__user__national_id',
    )

    # ===== حقول للقراءة فقط =====
    readonly_fields = (
        'delivery_date',
        'face_verified',
        'face_match_score',
    )

    # ===== تنظيم الحقول =====
    fieldsets = (
        ('Delivery data', {
            'fields': (
                'aid_Schedule',
                'delivered_by',
                'delivery_date',
                'confirmed_by_beneficiary',
                'face_verified',
                'face_match_score',
            ),
        }),
    )

    ordering = ('-delivery_date',)

    @admin.display(description='Beneficiary first name')
    def beneficiary_first_name(self, obj):
        return obj.aid_Schedule.beneficiary.user.first_name

    @admin.display(description='Beneficiary last name')
    def beneficiary_last_name(self, obj):
        return obj.aid_Schedule.beneficiary.user.last_name

    # ===== دوال العرض =====
    @admin.display(description='Beneficiary')
    def get_beneficiary(self, obj):
        return obj.aid_Schedule.beneficiary.user.username

    @admin.display(description='Delivered by first name')
    def delivered_by_first_name(self, obj):
        return obj.delivered_by.first_name

    @admin.display(description='Delivered by last name')
    def delivered_by_last_name(self, obj):
        return obj.delivered_by.last_name