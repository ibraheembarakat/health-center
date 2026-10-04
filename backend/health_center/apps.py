"""
Custom AdminConfig for Health Nutritional Support Center.

It replaces the default Django AdminSite with
HealthCenterAdminSite while preserving all existing
@admin.register(...) registrations.
"""

from django.contrib.admin.apps import AdminConfig


class HealthCenterAdminConfig(AdminConfig):
    default_site = (
        'health_center.admin_site.'
        'HealthCenterAdminSite'
    )