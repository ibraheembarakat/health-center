from rest_framework.permissions import BasePermission


class IsRecipient(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated )
    

class CanSendNotifications(BasePermission):
    def has_permission(self,request,view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['awareness','manager'])
    
    
