from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal

from users.models import CustomUser
from beneficiaries.models import Beneficiary
from articles.models import Article
from complaints.models import Complaint
from aid.models import AidSchedule, AidHistory
from reports.models import Report
from backups.models import Backup


class Command(BaseCommand):
    # الوصف اللي يظهر لما تكتب: python manage.py help seed_data
    help = 'إضافة بيانات تجريبية للنظام'

    def handle(self, *args, **kwargs):
        self.stdout.write('بدء إضافة البيانات التجريبية...\n')

        # ===== 1. جلب المدير الموجود =====
        manager = CustomUser.objects.get(role='manager')
        self.stdout.write(f'المدير: {manager.username}')

        # ===== 2. إنشاء الموظفين (6 موظفين) =====
        employees_data = [
            # 3 موظفين تسجيل
            {
                'username': 'reg1', 'first_name': 'محمد', 'last_name': 'العلي',
                'email': 'reg1@example.com', 'phone': '0912345601',
                'national_id': '10000000001', 'address': 'دمشق - المزة',
                'role': 'registration',
            },
            {
                'username': 'reg2', 'first_name': 'خالد', 'last_name': 'الحسن',
                'email': 'reg2@example.com', 'phone': '0912345602',
                'national_id': '10000000002', 'address': 'حلب - الشهباء',
                'role': 'registration',
            },
            {
                'username': 'reg3', 'first_name': 'فاطمة', 'last_name': 'الأحمد',
                'email': 'reg3@example.com', 'phone': '0912345603',
                'national_id': '10000000003', 'address': 'حمص - الخالدية',
                'role': 'registration',
            },
            # 2 موظفين توعية
            {
                'username': 'aware1', 'first_name': 'ليلى', 'last_name': 'السعيد',
                'email': 'aware1@example.com', 'phone': '0912345604',
                'national_id': '10000000004', 'address': 'دمشق - المهاجرين',
                'role': 'awareness',
            },
            {
                'username': 'aware2', 'first_name': 'سامر', 'last_name': 'الشامي',
                'email': 'aware2@example.com', 'phone': '0912345605',
                'national_id': '10000000005', 'address': 'اللاذقية',
                'role': 'awareness',
            },
            # 1 موظف مكتب مساعدة
            {
                'username': 'help1', 'first_name': 'نور', 'last_name': 'الدين',
                'email': 'help1@example.com', 'phone': '0912345606',
                'national_id': '10000000006', 'address': 'طرطوس',
                'role': 'helpdesk',
            },
        ]

        employees = {}
        for emp in employees_data:
            user = CustomUser.objects.create_user(
                username=emp['username'],
                password='Test@1234',
                email=emp['email'],
                phone=emp['phone'],
                national_id=emp['national_id'],
                address=emp['address'],
                first_name=emp['first_name'],
                last_name=emp['last_name'],
                role=emp['role'],
            )
            employees[emp['username']] = user
            self.stdout.write(f'  ✓ {emp["role"]}: {emp["username"]}')

        self.stdout.write(self.style.SUCCESS('✅ تم إنشاء 6 موظفين\n'))
        # ===== 3. إنشاء المستفيدين (15 مستفيد) =====
        # BMI < 16 = سوء تغذية شديد
        # 16 <= BMI < 17 = سوء تغذية متوسط
        beneficiaries_data = [
            # --- سوء تغذية شديد (8 حالات) ---
            {'username': 'ben01', 'first_name': 'أحمد', 'last_name': 'الخالد',
             'phone': '0912345611', 'national_id': '20000000001',
             'gender': 'M', 'dob': date(2024, 3, 15),
             'height': Decimal('65.00'), 'weight': Decimal('5.80')},
            {'username': 'ben02', 'first_name': 'سارة', 'last_name': 'الموسى',
             'phone': '0912345612', 'national_id': '20000000002',
             'gender': 'F', 'dob': date(2024, 6, 20),
             'height': Decimal('62.00'), 'weight': Decimal('5.50')},
            {'username': 'ben03', 'first_name': 'عمر', 'last_name': 'الحسين',
             'phone': '0912345613', 'national_id': '20000000003',
             'gender': 'M', 'dob': date(2024, 1, 10),
             'height': Decimal('70.00'), 'weight': Decimal('6.50')},
            {'username': 'ben04', 'first_name': 'ريم', 'last_name': 'العبد',
             'phone': '0912345614', 'national_id': '20000000004',
             'gender': 'F', 'dob': date(2025, 1, 5),
             'height': Decimal('58.00'), 'weight': Decimal('4.80')},
            {'username': 'ben05', 'first_name': 'يوسف', 'last_name': 'الصالح',
             'phone': '0912345615', 'national_id': '20000000005',
             'gender': 'M', 'dob': date(2024, 8, 12),
             'height': Decimal('68.00'), 'weight': Decimal('6.20')},
            {'username': 'ben06', 'first_name': 'آمنة', 'last_name': 'الحمد',
             'phone': '0912345616', 'national_id': '20000000006',
             'gender': 'F', 'dob': date(1998, 5, 20),
             'height': Decimal('160.00'), 'weight': Decimal('38.50')},
            {'username': 'ben07', 'first_name': 'زينب', 'last_name': 'الكردي',
             'phone': '0912345617', 'national_id': '20000000007',
             'gender': 'F', 'dob': date(2000, 9, 14),
             'height': Decimal('155.00'), 'weight': Decimal('37.00')},
            {'username': 'ben08', 'first_name': 'علي', 'last_name': 'الجاسم',
             'phone': '0912345618', 'national_id': '20000000008',
             'gender': 'M', 'dob': date(2024, 11, 3),
             'height': Decimal('60.00'), 'weight': Decimal('5.20')},

            # --- سوء تغذية متوسط (7 حالات) ---
            {'username': 'ben09', 'first_name': 'مريم', 'last_name': 'النجار',
             'phone': '0912345619', 'national_id': '20000000009',
             'gender': 'F', 'dob': date(2024, 4, 25),
             'height': Decimal('64.00'), 'weight': Decimal('6.60')},
            {'username': 'ben10', 'first_name': 'حسن', 'last_name': 'البكور',
             'phone': '0912345620', 'national_id': '20000000010',
             'gender': 'M', 'dob': date(2024, 7, 8),
             'height': Decimal('66.00'), 'weight': Decimal('7.00')},
            {'username': 'ben11', 'first_name': 'هدى', 'last_name': 'العمر',
             'phone': '0912345621', 'national_id': '20000000011',
             'gender': 'F', 'dob': date(1999, 3, 30),
             'height': Decimal('158.00'), 'weight': Decimal('40.50')},
            {'username': 'ben12', 'first_name': 'خديجة', 'last_name': 'الرشيد',
             'phone': '0912345622', 'national_id': '20000000012',
             'gender': 'F', 'dob': date(2001, 12, 1),
             'height': Decimal('162.00'), 'weight': Decimal('42.00')},
            {'username': 'ben13', 'first_name': 'محمود', 'last_name': 'الزعبي',
             'phone': '0912345623', 'national_id': '20000000013',
             'gender': 'M', 'dob': date(2025, 2, 18),
             'height': Decimal('56.00'), 'weight': Decimal('5.10')},
            {'username': 'ben14', 'first_name': 'رنا', 'last_name': 'السلوم',
             'phone': '0912345624', 'national_id': '20000000014',
             'gender': 'F', 'dob': date(1997, 7, 22),
             'height': Decimal('165.00'), 'weight': Decimal('44.50')},
            {'username': 'ben15', 'first_name': 'عبدالله', 'last_name': 'الحلبي',
             'phone': '0912345625', 'national_id': '20000000015',
             'gender': 'M', 'dob': date(2024, 10, 9),
             'height': Decimal('63.00'), 'weight': Decimal('6.40')},
        ]

        beneficiary_objects = []
        for b in beneficiaries_data:
            # أولاً: ننشئ حساب المستفيد
            user = CustomUser.objects.create_user(
                username=b['username'],
                password='Test@1234',
                email=f'{b["username"]}@example.com',
                phone=b['phone'],
                national_id=b['national_id'],
                address='سوريا',
                first_name=b['first_name'],
                last_name=b['last_name'],
                role='beneficiary',
            )
            # ثانياً: ننشئ ملف المستفيد (BMI و nutrition_status يتحسبوا تلقائياً)
            ben = Beneficiary.objects.create(
                user=user,
                date_of_birth=b['dob'],
                gender=b['gender'],
                height=b['height'],
                weight=b['weight'],
            )
            beneficiary_objects.append(ben)
            self.stdout.write(f'  ✓ {b["first_name"]} {b["last_name"]} - BMI: {ben.BMI} - {ben.nutrition_status}')

        self.stdout.write(self.style.SUCCESS('✅ تم إنشاء 15 مستفيد\n'))
        # ===== 4. إنشاء المقالات (10 مقالات) =====
        articles_data = [
            {'title': 'أهمية الرضاعة الطبيعية', 'category': 'children',
             'content': 'الرضاعة الطبيعية هي أفضل مصدر للتغذية...'},
            {'title': 'التغذية السليمة أثناء الحمل', 'category': 'pregnancy',
             'content': 'تحتاج المرأة الحامل إلى عناصر غذائية متنوعة...'},
            {'title': 'علامات سوء التغذية عند الأطفال', 'category': 'children',
             'content': 'من أهم العلامات: فقدان الوزن، تأخر النمو...'},
            {'title': 'فوائد الفيتامينات للأطفال', 'category': 'nutrition',
             'content': 'الفيتامينات ضرورية لنمو الأطفال السليم...'},
            {'title': 'الوقاية من فقر الدم', 'category': 'health',
             'content': 'فقر الدم من أكثر المشاكل الصحية شيوعاً...'},
            {'title': 'التغذية والأمراض المزمنة', 'category': 'chronic_diseases',
             'content': 'النظام الغذائي يلعب دوراً أساسياً في إدارة الأمراض...'},
            {'title': 'أهمية شرب الماء', 'category': 'awareness',
             'content': 'يحتاج الجسم إلى كمية كافية من الماء يومياً...'},
            {'title': 'نصائح لتغذية الطفل بعد الفطام', 'category': 'children',
             'content': 'بعد عمر 6 أشهر يبدأ إدخال الأطعمة التكميلية...'},
            {'title': 'البروتين في النظام الغذائي', 'category': 'nutrition',
             'content': 'البروتين عنصر أساسي لبناء الأنسجة والعضلات...'},
            {'title': 'الصحة النفسية وعلاقتها بالتغذية', 'category': 'health',
             'content': 'أثبتت الدراسات وجود ارتباط بين التغذية والصحة النفسية...'},
        ]

        # نوزّع المقالات بين موظفي التوعية
        awareness_users = [employees['aware1'], employees['aware2']]
        for i, art in enumerate(articles_data):
            Article.objects.create(
                title=art['title'],
                content=art['content'],
                category=art['category'],
                author=awareness_users[i % 2],  # بالتناوب بين aware1 و aware2
            )

        self.stdout.write(self.style.SUCCESS('✅ تم إنشاء 10 مقالات\n'))
        # ===== 5. إنشاء الشكاوى (8 شكاوى) =====
        helpdesk_user = employees['help1']

        # أولاً: 5 شكاوى بدون رد (pending)
        pending_complaints = [
            {'title': 'تأخر في استلام المساعدة', 'desc': 'لم أستلم المساعدة في الموعد المحدد.'},
            {'title': 'خطأ في البيانات الشخصية', 'desc': 'اسمي مكتوب بشكل خاطئ في النظام.'},
            {'title': 'استفسار عن موعد التوزيع', 'desc': 'متى سيكون موعد التوزيع القادم؟'},
            {'title': 'مشكلة في الوصول للمركز', 'desc': 'المركز بعيد عن منطقتي.'},
            {'title': 'طلب تغيير نوع المساعدة', 'desc': 'أريد تغيير نوع المساعدة المقدمة.'},
        ]

        for i, comp in enumerate(pending_complaints):
            Complaint.objects.create(
                user=beneficiary_objects[i].user,
                title=comp['title'],
                description=comp['desc'],
                # status='pending' بالافتراضي
                # بدون reply → ما تتولّد إشعارات
            )

        # ثانياً: 3 شكاوى مع رد (resolved) → تتولّد إشعارات تلقائياً
        replied_complaints = [
            {'title': 'سؤال عن البرنامج الغذائي', 'desc': 'ما هي الأغذية المشمولة؟',
             'reply': 'البرنامج يشمل السلال الغذائية الأساسية.'},
            {'title': 'شكوى على المعاملة', 'desc': 'لم يتم التعامل معي بشكل جيد.',
             'reply': 'نعتذر عن أي إزعاج وسنحرص على تحسين الخدمة.'},
            {'title': 'طلب معلومات إضافية', 'desc': 'أريد معرفة المزيد عن حالتي.',
             'reply': 'يمكنك مراجعة المركز للاطلاع على ملفك الصحي.'},
        ]

        for i, comp in enumerate(replied_complaints):
            Complaint.objects.create(
                user=beneficiary_objects[i + 5].user,
                title=comp['title'],
                description=comp['desc'],
                reply=comp['reply'],
                replied_by=helpdesk_user,
                # save() سيعمل تلقائياً:
                # status → 'resolved'
                # replies_at → timezone.now()
                # + إنشاء Notification من نوع complaint_reply
            )

        self.stdout.write(self.style.SUCCESS('✅ تم إنشاء 8 شكاوى (3 منها مع رد + إشعارات)\n'))
        # ===== 6. إنشاء جداول المساعدة (5 مواعيد) =====
        reg_user = employees['reg1']
        now = timezone.now()

        schedules = []
        for i in range(5):
            schedule = AidSchedule.objects.create(
                beneficiary=beneficiary_objects[i],
                schedule_date=now + timedelta(days=i + 1),
                created_by=reg_user,
                # status='pending' بالافتراضي
                # save() بينشئ إشعار aid_pickup تلقائياً
            )
            schedules.append(schedule)

        # تحديث حالة بعض المواعيد (بدون استدعاء save)
        AidSchedule.objects.filter(pk=schedules[0].pk).update(status='received')
        AidSchedule.objects.filter(pk=schedules[1].pk).update(status='received')
        AidSchedule.objects.filter(pk=schedules[2].pk).update(status='missed')
        # schedules[3] و schedules[4] يبقوا pending

        self.stdout.write(self.style.SUCCESS('✅ تم إنشاء 5 مواعيد مساعدة + إشعارات\n'))
        # ===== 7. إنشاء سجلات التسليم (3 سجلات) =====
        # نربطهم بالمواعيد اللي حالتها received + الموعد اللي missed
        AidHistory.objects.create(
            aid_Schedule=schedules[0],
            delivered_by=reg_user,
            confirmed_by_beneficiary=True,
        )
        AidHistory.objects.create(
            aid_Schedule=schedules[1],
            delivered_by=reg_user,
            confirmed_by_beneficiary=True,
        )
        AidHistory.objects.create(
            aid_Schedule=schedules[2],
            delivered_by=employees['reg2'],
            confirmed_by_beneficiary=False,
        )

        self.stdout.write(self.style.SUCCESS('✅ تم إنشاء 3 سجلات تسليم\n'))
        # ===== 8. إنشاء تقارير =====
        Report.objects.create(
            title='تقرير شهر يناير 2026',
            report_type='monthly',
            content={
                'total_beneficiaries': 15,
                'severe_cases': 8,
                'moderate_cases': 7,
                'aid_distributed': 3,
            },
            period_start=date(2026, 1, 1),
            period_end=date(2026, 1, 31),
            created_by=manager,
        )
        Report.objects.create(
            title='تقرير سنوي 2025',
            report_type='yearly',
            content={
                'total_cases': 280,
                'monthly_average': 23,
            },
            period_start=date(2025, 1, 1),
            period_end=date(2025, 12, 31),
            created_by=manager,
        )

        self.stdout.write(self.style.SUCCESS('✅ تم إنشاء 2 تقرير\n'))

        # ===== 9. إنشاء نسخ احتياطية =====
        Backup.objects.create(
            file_path='/backups/backup_2026_01_15.sql',
            file_size=5242880,  # 5 MB
            created_by=manager,
        )
        Backup.objects.create(
            file_path='/backups/backup_2026_02_01.sql',
            file_size=6291456,  # 6 MB
            created_by=manager,
        )

        self.stdout.write(self.style.SUCCESS('✅ تم إنشاء 2 نسخة احتياطية\n'))

        # ===== ملخص نهائي =====
        self.stdout.write('\n' + '=' * 40)
        self.stdout.write(self.style.SUCCESS('تمت إضافة جميع البيانات التجريبية بنجاح!'))
        self.stdout.write(f'  الموظفون: 6')
        self.stdout.write(f'  المستفيدون: 15')
        self.stdout.write(f'  المقالات: 10')
        self.stdout.write(f'  الشكاوى: 8')
        self.stdout.write(f'  جداول المساعدة: 5')
        self.stdout.write(f'  سجلات التسليم: 3')
        self.stdout.write(f'  التقارير: 2')
        self.stdout.write(f'  النسخ الاحتياطية: 2')
        self.stdout.write(f'  الإشعارات التلقائية: (تحقق من العدد في /admin/)')
        self.stdout.write('=' * 40)