"""
Custom AdminSite for Health Nutritional Support Center.

All models registered through @admin.register(...) continue to use
their existing ModelAdmin configuration through AdminConfig.default_site.
"""

from django.contrib.admin import AdminSite

from .dashboard_queries import build_dashboard_context


class HealthCenterAdminSite(AdminSite):
    site_header = 'Health Nutritional Support Center'
    site_title = 'Health Nutritional Support Center Admin'
    index_title = 'Dashboard'

    def index(self, request, extra_context=None):
        dashboard_context = build_dashboard_context(
            request,
            self,
        )

        if extra_context:
            dashboard_context.update(extra_context)

        return super().index(
            request,
            extra_context=dashboard_context,
        )