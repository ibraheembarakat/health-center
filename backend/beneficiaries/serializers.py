import secrets
            #12 = عدد البايتات. الناتج URL-safe (حروف + أرقام + - و _)، طوله تقريباً 16-17 حرف.
from django.core.mail import send_mail
            #هون لطباعه الايميل حسب ايميل باك اند الموجود بسيتينجز
from django.conf import settings
            #مشان نقرا يللي كتبناه بالسيتينجز
from django.db import transaction
            #هون مشان نربط البينيفيساري باليوزر يا لتنين بينجحوا يا لتنين بيففشلوا
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from aid.models import AidSchedule, AidHistory
from notifications.models import Notification
from rest_framework import serializers
from users.models import CustomUser
from .models import Beneficiary
from .face_utils import (
    FaceProcessingError,
    compress_photo,
    extract_encoding,
)
from django.utils import timezone


class BeneficiaryUserSerializer(serializers.ModelSerializer):
    class Meta:
        model=CustomUser
        fields=['id','username','first_name','last_name','email','phone','address','national_id']
        read_only_fields = fields


class BeneficiarySerializer(serializers.ModelSerializer):
    user = BeneficiaryUserSerializer(read_only=True)
    nutrition_status_display = serializers.CharField(
        source='get_nutrition_status_display',
        read_only=True
    )

    class Meta:
        model=Beneficiary
        fields=[
            'id',
            'user',
            'photo',
            'date_of_birth',
            'gender',
            'registration_date',
            'height',
            'weight',
            'BMI',
            'nutrition_status',
            'nutrition_status_display',
        ]

        read_only_fields = fields


class BeneficiaryMeSerializer(BeneficiarySerializer):
    total_received = serializers.SerializerMethodField()
    total_pickup_notifications = serializers.SerializerMethodField()
    pending_schedule_date = serializers.SerializerMethodField()

    class Meta(BeneficiarySerializer.Meta):
        fields = BeneficiarySerializer.Meta.fields + [
            'total_received',
            'total_pickup_notifications',
            'pending_schedule_date',
        ]

    def get_total_received(self, obj):
        # كم مرة استلم المساعدة فعلياً حسب سجل التسليم
        return AidHistory.objects.filter(
            aid_Schedule__beneficiary=obj,
        ).count()

    def get_total_pickup_notifications(self, obj):
        # كل موعد مساعدة جديد يرسل للمستفيد إشعار استلام تلقائياً مرة واحدة
        return Notification.objects.filter(
            recipient=obj.user,
            notification_type='aid_pickup',
        ).count()

    def get_pending_schedule_date(self, obj):
        # أقرب موعد استلام معلق، ويرجع null إذا لم يوجد موعد pending
        schedule = AidSchedule.objects.filter(
            beneficiary=obj,
            status='pending',
            schedule_date__gt=timezone.now(),
        ).order_by('schedule_date').first()

        if schedule:
            return schedule.schedule_date
        return None


class BeneficiaryUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model=CustomUser
        fields=['username','first_name','last_name','email','phone','address','national_id']

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('this email has sign up before')
        return value

    def validate_national_id(self,value):
        if CustomUser.objects.filter(national_id=value).exists():
            raise serializers.ValidationError('this national id is allready exists')
        return value


class BeneficiaryCreateSerializer(serializers.ModelSerializer):
    user = BeneficiaryUserCreateSerializer()
    photo = serializers.ImageField(
        write_only=True,
        required=True,
        allow_null=False,
    )

    class Meta:
        model = Beneficiary
        fields = [
            'user',
            'photo',
            'date_of_birth',
            'gender',
            'height',
            'weight',
        ]

    def validate_date_of_birth(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError(
                'the birthdate cant be in the future'
            )
        return value

    def validate(self, data):
        height = data.get('height')
        weight = data.get('weight')

        if height and weight:
            height_m = float(height) / 100
            bmi = float(weight) / (height_m ** 2)

            if bmi >= 17:
                raise serializers.ValidationError('you have no ill')

        try:
            data['face_encoding'] = extract_encoding(data.get('photo'))
        except FaceProcessingError as error:
            raise serializers.ValidationError({
                'photo': {
                    'code': error.code,
                    'message': error.message,
                }
            }) from error

        return data

    @staticmethod
    def _delete_saved_photo(beneficiary):
        """Delete an uploaded photo if the database transaction fails."""
        if beneficiary is None:
            return

        photo_file = beneficiary.photo

        if (
            not photo_file
            or not photo_file.name
            or not getattr(photo_file, '_committed', False)
        ):
            return

        try:
            storage = photo_file.storage
            photo_name = photo_file.name

            if storage.exists(photo_name):
                storage.delete(photo_name)
        except Exception:
            pass

    def create(self, validated_data):
        user_data = validated_data.pop('user')
            #هون بشيل قيمه اليوزر فقط وبحطها بال يوزر داتا

        photo = validated_data.pop('photo')
        face_encoding = validated_data.pop('face_encoding')

        try:
            compressed_photo = compress_photo(photo)
        except FaceProcessingError as error:
            raise serializers.ValidationError({
                'photo': {
                    'code': error.code,
                    'message': error.message,
                }
            }) from error

        password = secrets.token_urlsafe(12)
            #هون بولد كلمه سر من 12 بايت
            #هلا هون بدنا نولد شي اسمه ترانزاكشن اتوميك يعني بينشئ يوزر وبينيفساري يا اما التنين بينجحوا او التنين بيفشلوا

        beneficiary = None

        try:
            with transaction.atomic():
                user = CustomUser.objects.create_user(
                    #هون كرييت يوزر وليس كرييت لانها تعمل على تشفير كلمه السر تلقائيا
                    username=user_data['username'],
                    email=user_data['email'],
                    password=password,
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    phone=user_data['phone'],
                    national_id=user_data['national_id'],
                    address=user_data['address'],
                    role='beneficiary',
                )

                beneficiary = Beneficiary(
                    user=user,
                    photo=compressed_photo,
                    face_encoding=face_encoding,
                    **validated_data,
                )
                beneficiary.save()
                #هون بيربط البينيفساري مع اليوزر التنين بيزبطوا او التنين بيفشلوا

        except DjangoValidationError as error:
            self._delete_saved_photo(beneficiary)
            raise DRFValidationError({'detail': error.messages}) from error
        except Exception:
            self._delete_saved_photo(beneficiary)
            raise

        # send password to user email (best-effort)
        send_mail(
            subject='Your account at the Health Nutritional Support Center',
            message=(
                f'Hello {user.first_name},\n\n'
                f'You have been registered at the Health Nutritional Support Center.\n\n'
                f'Username: {user.username}\n'
                f'Password: {password}\n\n'
                f'Please use these credentials to log in to your account.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,# يعني في حال ما انرسل الايميل اطهر الخطا واعمل اكسيبشن
        )

        return beneficiary

    def to_representation(self, instance):
        """Return the complete beneficiary representation after creation."""
        return BeneficiarySerializer(
            instance,
            context=self.context,
        ).data


class BeneficiaryBriefSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()
    total_scheduled = serializers.SerializerMethodField()
    total_received = serializers.SerializerMethodField()
    last_received_date = serializers.SerializerMethodField()
    # عنده موعد معلق حالياً؟ (يعني بعتله إشعار وما إجا استلم)
    has_pending_schedule = serializers.SerializerMethodField()
    # تاريخ الموعد المعلق
    pending_schedule_date = serializers.SerializerMethodField()

    class Meta:
        model = Beneficiary
        fields = [
            'id',
            'user_id',
            'username',
            'full_name',
            'nutrition_status',
            'total_scheduled',
            'total_received',
            'last_received_date',
            'has_pending_schedule',
            'pending_schedule_date',
        ]
        read_only_fields = [
            'id',
            'nutrition_status',
        ]

    def get_full_name(self, obj):
        first = obj.user.first_name or ''
        last = obj.user.last_name or ''
        full = f"{first} {last}".strip()
        return full if full else obj.user.username

    def get_total_scheduled(self, obj):
        # كم مرة انجدوله موعد (بأي حالة)
        return AidSchedule.objects.filter(
            beneficiary=obj,
        ).count()

    def get_total_received(self, obj):
        # كم مرة فعلاً استلم
        return AidHistory.objects.filter(
            aid_Schedule__beneficiary=obj,
        ).count()

    def get_last_received_date(self, obj):
        # آخر تاريخ استلام فعلي
        last = AidHistory.objects.filter(
            aid_Schedule__beneficiary=obj,
        ).order_by('-delivery_date').first()

        if last:
            return last.delivery_date
        return None

    def get_has_pending_schedule(self, obj):
        # عنده موعد معلق = بعتله إشعار وما إجا استلم بعد
        return AidSchedule.objects.filter(
            beneficiary=obj,
            status='pending',
            schedule_date__gt=timezone.now(),
        ).exists()

    def get_pending_schedule_date(self, obj):
        # تاريخ أقرب موعد معلق
        schedule = AidSchedule.objects.filter(
            beneficiary=obj,
            status='pending',
            schedule_date__gt=timezone.now(),
        ).order_by('schedule_date').first()

        if schedule:
            return schedule.schedule_date
        return None