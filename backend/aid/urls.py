from rest_framework.routers import DefaultRouter
from .views import AidScheduleViewSet, AidHistoryViewSet

router = DefaultRouter()
router.register('aid-schedules', AidScheduleViewSet, basename='aid-schedule')
router.register('aid-history', AidHistoryViewSet, basename='aid-history')

urlpatterns = router.urls