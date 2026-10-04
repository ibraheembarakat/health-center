from rest_framework.permissions import BasePermission


class IsAwarenessForSchedule(BasePermission):
    """صلاحية إنشاء موعد مساعدة (UC-16): موظف توعية فقط."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'awareness'
        )


class IsAwarenessForConfirm(BasePermission):
    """صلاحية تأكيد استلام المساعدة (UC-18): موظف توعية فقط."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'awareness'
        )


class CanViewSchedules(BasePermission):
    """صلاحية عرض المواعيد: أي مستخدم مسجّل دخول. التفريق في get_queryset."""
#عرضص موعد المساعده لاي مستفيد
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)