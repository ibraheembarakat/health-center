"""
ASGI config for health_center project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""
#هون اسرع من wsgi لان هون يعني كل شي لحظري متل الواتس مثلا
import os#يستورد مكتبه التعامل مع النظام 

from django.core.asgi import get_asgi_application #يستورد دالخ التطبيقات اللحظيه لجانغو

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_center.settings')#مشان يلاقي ملف الاعدادات

application = get_asgi_application()
#داله جاهزه تجمع كل اعدادات المشروع وتحولها لشكل يفهمه السيرفر