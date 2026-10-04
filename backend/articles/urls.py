from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet
router=DefaultRouter()#اريحلي مشان ما تعذب بكل شغله
router.register('articles',ArticleViewSet,basename='article')
urlpatterns=[path('',include(router.urls))]