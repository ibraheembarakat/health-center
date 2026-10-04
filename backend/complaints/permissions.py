from rest_framework.permissions import BasePermission
# الكلاس الذي سنبني على اساسه الصلاحيات
class IsBeneficiaryForCreate(BasePermission):
    def has_permission(self, request, view):
        return(request.user.is_authenticated and request.user.role=='beneficiary')
class IsHelpDeskForReply(BasePermission):
     def has_permission(self, request, view):
        return(request.user.is_authenticated and request.user.role=='helpdesk')
class IsOwnerOrStaff(BasePermission):
    #كل مستفيد بشوف شكواه الخاصه
    def has_permission(self,request,view):
        return request.user.is_authenticated