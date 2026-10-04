"""
URL configuration for health_center project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin # استورد لوحه الاداره الجاهزه admin from django
from django.urls import path #يستورد path المسؤول عن ربط رابط url بصفحه معينه
from django.urls import include
#انكلود بتدخل لملف روابط ثاني وبتجبلي الروابط منه
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [#قاءمه كل الروابط بالموقع
    path('api/',include('users.urls')),
    path('admin/', admin.site.urls), #اذا المستخدم دخل عال ادمن استورد  لوحه الادارة الجاهزه 
    path('api/',include('articles.urls')),
    path('api/', include('beneficiaries.urls')),
    path('api/', include('complaints.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('aid.urls')),
]
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
