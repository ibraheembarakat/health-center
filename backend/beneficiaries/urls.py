from rest_framework.routers import DefaultRouter
#هي اداة تولد روابط api من viewset
from .views import BeneficiaryViewSet
router = DefaultRouter()
#هون بولد روابط تلقائيا
router.register('beneficiaries', BeneficiaryViewSet, basename='beneficiary')
#هون مشان تخزين الفيو سيت بالراوتر 
urlpatterns = router.urls
#أخذت الروابط التي ولّدها الراوتر ووضعتها داخل urlpatterns حتى Django يقرأها

