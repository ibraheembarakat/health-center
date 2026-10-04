from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAuthenticated


class IsRegistrationEmployee(BasePermission):
    message = 'this work is only for registrration'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'registration'


class IsBeneficiaryOwner(BasePermission):
    message = "this page is only for beneficiaries"

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'beneficiary'
        )


class IsAwarenessEmployee(BasePermission):
    message = "this list is only for awareness employees"

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'awareness'
        )