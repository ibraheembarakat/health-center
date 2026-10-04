#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os # متغيرات النظام
import sys # معلومات عن الامر يللي شغلته

#هون تابع بحط القيمه اذا عرفها
def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_center.settings')
    try:#يستورد الداله يللي فيها اوامري
        from django.core.management import execute_from_command_line
    except ImportError as exc:#اذا فشل الاستيراد
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
