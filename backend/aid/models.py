from django.db import models
from users.models import CustomUser
from django.conf import settings
from django.utils import timezone
#هون مشان نستخدم اليوزر الممخصص بدل الافتراضيي
# هون لان رح نربط الايد هيستوري بالموظف يللي سلم المساعده

#هون لانشاء الاشعارات اللي رح تنبعت للمستخدمين
from beneficiaries.models import Beneficiary


class AidSchedule(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('missed', 'Missed'),
        ('received', 'Received'),
    ]

    beneficiary = models.ForeignKey(
        Beneficiary,
        on_delete=models.CASCADE,
        verbose_name='Beneficiary',
        related_name='aid_schedules',
    )
    schedule_date = models.DateTimeField(
        verbose_name='Aid pickup date',
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Aid status',
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Created at',
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Updated at',
    )
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        verbose_name='Created by',
        related_name='created_aid_schedules',
    )

    class Meta:
        verbose_name = 'Aid schedule'
        verbose_name_plural = 'Aid schedules'
        ordering = ['-schedule_date']

    def __str__(self):
        return (
            f'Aid pickup schedule for '
            f'{self.beneficiary.user.username} at '
            f'{self.schedule_date.strftime("%Y-%m-%d %H:%M:%S")}'
        )

    @property
    def is_expired(self):
        return (
            self.status == 'pending'
            and self.schedule_date < timezone.now()
        )

    def expire_if_due(self, save=True):
        """Mark the schedule as missed when its scheduled time has passed."""
        if not self.is_expired:
            return False

        self.status = 'missed'

        if save:
            self.save(update_fields=['status', 'updated_at'])

        return True

    @classmethod
    def expire_due_pending(cls, beneficiary=None):
        """Mark expired pending schedules as missed."""
        now = timezone.now()

        queryset = cls.objects.filter(
            status='pending',
            schedule_date__lt=now,
        )

        if beneficiary is not None:
            queryset = queryset.filter(
                beneficiary=beneficiary,
            )

        return queryset.update(
            status='missed',
            updated_at=now,
        )

    def save(self, *args, **kwargs):
        # تحقق من حالة المساعدة قبل الحفظ
        is_new = self._state.adding
        super().save(*args, **kwargs)

        #يعني بعد مينحفظ الموعد رح يبعت اشعار
        # إذا كانت الحالة "بانتظار الاستلام"، قم بإنشاء إشعار للمستفيد
        if is_new:
            from notifications.models import Notification

            Notification.objects.create(
                recipient=self.beneficiary.user,
                sent_by=self.created_by,
                title='New aid pickup appointment',
                message=(
                    f'You have an aid pickup appointment at '
                    f'{self.schedule_date.strftime("%Y-%m-%d %H:%M:%S")}.'
                ),
                notification_type='aid_pickup',
            )


class AidHistory(models.Model):
    AID_TYPE_CHOICES = [
        ('food_package', 'Food package'),
    ]

    # هون العلاقه ون تو ون لان انا بدي كل تاريخ يكون مربوط بموهد واهد بس
    aid_Schedule = models.OneToOneField(
        AidSchedule,
        on_delete=models.PROTECT,
        verbose_name='Aid schedule',
        related_name='aid_history',
    )
    delivery_date = models.DateField(
        auto_now_add=True,
        verbose_name='Delivery date',
    )
    face_verified = models.BooleanField(
        null=True,
        blank=True,
        verbose_name='Face verified',
    )
    face_match_score = models.FloatField(
        null=True,
        blank=True,
        verbose_name='Face match score',
    )
    confirmed_by_beneficiary = models.BooleanField(
        default=False,
        verbose_name='Confirmed by beneficiary',
    )
    delivered_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        verbose_name='Delivered by',
        related_name='delivered_aids_histories',
    )

    class Meta:
        verbose_name = 'Aid delivery history'
        verbose_name_plural = 'Aid delivery histories'
        ordering = ['-delivery_date']

    def __str__(self):
        return (
            f'Aid delivery history for '
            f'{self.aid_Schedule.beneficiary.user.username} '
            f'on {self.delivery_date}'
        )