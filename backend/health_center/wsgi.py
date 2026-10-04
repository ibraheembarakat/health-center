"""
WSGI config for health_center project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os #استيراد مكتبه التعامل مع نظام التشغيل 

from django.core.wsgi import get_wsgi_application #يحول المشروع لتطبيق حتى نستطيع اطلاقه عالسيرفر

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_center.settings') #هون مشان معرفه مكان اعدادات المشروع بستخدم نفس السطر الموجود بالماناج وقت يكون عالجهاز ويستخدمه نظامي وقت يكون عسيؤفؤ حقيقي

application = get_wsgi_application()
#هون بستقبل الطلب  apache /nginx طبعا خدول انواع سيرفرات
#للي بترجم بينهن هو wsgi.py
#الجانغو بجهز الصفحه 
#يعني بيستخده التطبيق الجاهز للسيرغر الحقيقي