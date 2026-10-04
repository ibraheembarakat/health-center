"""
Optimized queries for the Django Admin dashboard.

This module:
- Lets the manager see all authorized Admin sections.
- Uses ModelAdmin querysets to preserve the existing Admin behavior.
- Uses count(), aggregate(), annotate(), select_related(), and only().
- Displays beneficiary profile photos without loading face encodings.
- Does not modify database records.
- Does not execute database queries inside templates.
"""

from urllib.parse import urlencode

from django.db.models import Count, Q
from django.urls import reverse

from aid.models import AidHistory, AidSchedule
from articles.models import Article
from backups.models import Backup
from beneficiaries.models import Beneficiary
from complaints.models import Complaint
from notifications.models import Notification
from reports.models import Report
from users.models import CustomUser


def _get_model_admin(admin_site, model):
    """Return the registered ModelAdmin for a model."""
    return admin_site._registry.get(model)


def _can_view_model(request, admin_site, model):
    """
    Check whether the current Admin user can view or change a model.

    The manager is a superuser in this project, so all registered
    sections remain visible to the manager.
    """
    model_admin = _get_model_admin(
        admin_site,
        model,
    )

    if model_admin is None:
        return False

    return model_admin.has_view_or_change_permission(request)


def _get_model_queryset(request, admin_site, model):
    """
    Return the existing ModelAdmin queryset without changing its logic.
    """
    model_admin = _get_model_admin(
        admin_site,
        model,
    )

    if (
        model_admin is None
        or not model_admin.has_view_or_change_permission(request)
    ):
        return None

    return model_admin.get_queryset(request)


def _admin_url(
    admin_site,
    model,
    action='changelist',
    args=None,
):
    """Build a URL using the current AdminSite namespace."""
    options = model._meta

    url_name = (
        f'{admin_site.name}:'
        f'{options.app_label}_'
        f'{options.model_name}_'
        f'{action}'
    )

    return reverse(
        url_name,
        args=args,
    )


def _filtered_url(base_url, parameters):
    """Add safe filter parameters to an Admin changelist URL."""
    return f'{base_url}?{urlencode(parameters)}'


def _display_name(user):
    """Return the full name or fall back to the username."""
    full_name = (
        f'{user.first_name} {user.last_name}'
    ).strip()

    return full_name or user.username


def _user_initials(user):
    """Create short initials for the photo fallback."""
    first_name = (user.first_name or '').strip()
    last_name = (user.last_name or '').strip()

    initials = (
        f'{first_name[:1]}{last_name[:1]}'
    ).upper()

    if initials:
        return initials

    return (user.username or 'U')[:2].upper()


def _photo_url(photo):
    """
    Return a local or Cloudinary photo URL safely.

    An empty value is returned when the beneficiary has no photo.
    """
    if not photo:
        return ''

    try:
        return photo.url
    except (ValueError, OSError):
        return ''


def _get_grouped_counts(queryset, field_name):
    """Count records grouped by one field using a single query."""
    rows = (
        queryset
        .order_by()
        .values(field_name)
        .annotate(total=Count('pk'))
    )

    return {
        row[field_name]: row['total']
        for row in rows
    }


def _build_distribution(
    counts,
    choices,
    tones,
):
    """
    Build a distribution that includes choices with zero records.
    """
    total = sum(counts.values())
    distribution = []
    known_values = set()

    for index, (value, label) in enumerate(choices):
        known_values.add(value)
        count = counts.get(value, 0)

        percentage = (
            round((count / total) * 100)
            if total
            else 0
        )

        distribution.append({
            'key': value,
            'label': label,
            'value': count,
            'percent': percentage,
            'tone': tones[index % len(tones)],
        })

    unknown_values = [
        value
        for value in counts
        if value not in known_values
    ]

    for index, value in enumerate(unknown_values):
        count = counts[value]

        percentage = (
            round((count / total) * 100)
            if total
            else 0
        )

        distribution.append({
            'key': value,
            'label': str(value).replace('_', ' ').title(),
            'value': count,
            'percent': percentage,
            'tone': tones[
                (len(distribution) + index) % len(tones)
            ],
        })

    return distribution


def _build_stat_cards(
    counts,
    permissions,
    admin_site,
):
    """Build the dashboard statistic cards."""
    cards = []

    if permissions['users']:
        users_url = _admin_url(
            admin_site,
            CustomUser,
        )

        cards.extend([
            {
                'group': 'overview',
                'label': 'Total users',
                'value': counts.get('total_users', 0),
                'icon': 'users',
                'tone': 'primary',
                'url': users_url,
            },
            {
                'group': 'people',
                'label': 'Registration employees',
                'value': counts.get(
                    'registration_employees',
                    0,
                ),
                'icon': 'staff',
                'tone': 'neutral',
                'url': _filtered_url(
                    users_url,
                    {
                        'role__exact': 'registration',
                    },
                ),
            },
            {
                'group': 'people',
                'label': 'Awareness employees',
                'value': counts.get(
                    'awareness_employees',
                    0,
                ),
                'icon': 'staff',
                'tone': 'neutral',
                'url': _filtered_url(
                    users_url,
                    {
                        'role__exact': 'awareness',
                    },
                ),
            },
            {
                'group': 'people',
                'label': 'Help desk employees',
                'value': counts.get(
                    'helpdesk_employees',
                    0,
                ),
                'icon': 'staff',
                'tone': 'neutral',
                'url': _filtered_url(
                    users_url,
                    {
                        'role__exact': 'helpdesk',
                    },
                ),
            },
        ])

    if permissions['beneficiaries']:
        cards.append({
            'group': 'overview',
            'label': 'Total beneficiaries',
            'value': counts.get(
                'total_beneficiaries',
                0,
            ),
            'icon': 'beneficiaries',
            'tone': 'primary',
            'url': _admin_url(
                admin_site,
                Beneficiary,
            ),
        })

    if permissions['aid_schedules']:
        schedules_url = _admin_url(
            admin_site,
            AidSchedule,
        )

        cards.extend([
            {
                'group': 'overview',
                'label': 'Pending aid schedules',
                'value': counts.get(
                    'pending_aid_schedules',
                    0,
                ),
                'icon': 'clock',
                'tone': 'warning',
                'url': _filtered_url(
                    schedules_url,
                    {
                        'status__exact': 'pending',
                    },
                ),
            },
            {
                'group': 'aid',
                'label': 'Missed aid schedules',
                'value': counts.get(
                    'missed_aid_schedules',
                    0,
                ),
                'icon': 'alert',
                'tone': 'danger',
                'url': _filtered_url(
                    schedules_url,
                    {
                        'status__exact': 'missed',
                    },
                ),
            },
        ])

    if permissions['aid_history']:
        cards.append({
            'group': 'aid',
            'label': 'Completed aid deliveries',
            'value': counts.get(
                'completed_aid_deliveries',
                0,
            ),
            'icon': 'check',
            'tone': 'success',
            'url': _admin_url(
                admin_site,
                AidHistory,
            ),
        })

    if permissions['complaints']:
        complaints_url = _admin_url(
            admin_site,
            Complaint,
        )

        cards.extend([
            {
                'group': 'overview',
                'label': 'Pending complaints',
                'value': counts.get(
                    'pending_complaints',
                    0,
                ),
                'icon': 'clock',
                'tone': 'warning',
                'url': _filtered_url(
                    complaints_url,
                    {
                        'status__exact': 'pending',
                    },
                ),
            },
            {
                'group': 'engagement',
                'label': 'Resolved complaints',
                'value': counts.get(
                    'resolved_complaints',
                    0,
                ),
                'icon': 'check',
                'tone': 'success',
                'url': _filtered_url(
                    complaints_url,
                    {
                        'status__exact': 'resolved',
                    },
                ),
            },
        ])

    if permissions['articles']:
        cards.append({
            'group': 'engagement',
            'label': 'Published articles',
            'value': counts.get(
                'published_articles',
                0,
            ),
            'icon': 'article',
            'tone': 'neutral',
            'url': _admin_url(
                admin_site,
                Article,
            ),
        })

    if permissions['notifications']:
        cards.append({
            'group': 'engagement',
            'label': 'Notifications',
            'value': counts.get(
                'total_notifications',
                0,
            ),
            'icon': 'bell',
            'tone': 'neutral',
            'url': _admin_url(
                admin_site,
                Notification,
            ),
        })

    return cards


def _get_recent_beneficiaries(
    queryset,
    admin_site,
    limit=5,
):
    """
    Return recent beneficiaries with their profile photos.

    The query loads the photo field but does not load face_encoding.
    """
    queryset = (
        queryset
        .select_related('user')
        .only(
            'id',
            'user_id',
            'photo',
            'registration_date',
            'nutrition_status',
            'user__id',
            'user__username',
            'user__first_name',
            'user__last_name',
        )
        .order_by(
            '-registration_date',
            '-id',
        )[:limit]
    )

    beneficiaries = []

    for beneficiary in queryset:
        name = _display_name(
            beneficiary.user,
        )

        beneficiaries.append({
            'title': name,
            'subtitle': (
                beneficiary
                .get_nutrition_status_display()
            ),
            'date': beneficiary.registration_date,
            'photo_url': _photo_url(
                beneficiary.photo,
            ),
            'photo_alt': f'{name} profile photo',
            'initials': _user_initials(
                beneficiary.user,
            ),
            'url': _admin_url(
                admin_site,
                Beneficiary,
                action='change',
                args=[beneficiary.pk],
            ),
        })

    return beneficiaries


def _get_recent_aid_schedules(
    queryset,
    admin_site,
    limit=5,
):
    """Return recent aid schedules with beneficiary photos."""
    queryset = (
        queryset
        .select_related(
            'beneficiary__user',
        )
        .only(
            'id',
            'beneficiary_id',
            'schedule_date',
            'status',
            'created_at',
            'beneficiary__id',
            'beneficiary__user_id',
            'beneficiary__photo',
            'beneficiary__user__id',
            'beneficiary__user__username',
            'beneficiary__user__first_name',
            'beneficiary__user__last_name',
        )
        .order_by(
            '-created_at',
            '-id',
        )[:limit]
    )

    schedules = []

    for schedule in queryset:
        user = schedule.beneficiary.user
        name = _display_name(user)

        schedules.append({
            'title': name,
            'subtitle': schedule.get_status_display(),
            'date': schedule.schedule_date,
            'status': schedule.status,
            'photo_url': _photo_url(
                schedule.beneficiary.photo,
            ),
            'photo_alt': f'{name} profile photo',
            'initials': _user_initials(user),
            'url': _admin_url(
                admin_site,
                AidSchedule,
                action='change',
                args=[schedule.pk],
            ),
        })

    return schedules


def _get_recent_complaints(
    queryset,
    admin_site,
    limit=5,
):
    """
    Return recent complaints without loading descriptions or replies.
    """
    queryset = (
        queryset
        .select_related('user')
        .only(
            'id',
            'user_id',
            'title',
            'status',
            'created_at',
            'user__id',
            'user__username',
            'user__first_name',
            'user__last_name',
        )
        .order_by(
            '-created_at',
            '-id',
        )[:limit]
    )

    return [
        {
            'title': complaint.title,
            'subtitle': _display_name(
                complaint.user,
            ),
            'date': complaint.created_at,
            'status': complaint.status,
            'initials': _user_initials(
                complaint.user,
            ),
            'url': _admin_url(
                admin_site,
                Complaint,
                action='change',
                args=[complaint.pk],
            ),
        }
        for complaint in queryset
    ]


def _get_quick_links(
    permissions,
    admin_site,
):
    """Build the dashboard quick-link sections."""
    sections = []

    people_links = []

    if permissions['users']:
        people_links.append({
            'label': 'Users',
            'url': _admin_url(
                admin_site,
                CustomUser,
            ),
        })

    if permissions['beneficiaries']:
        people_links.append({
            'label': 'Beneficiaries',
            'url': _admin_url(
                admin_site,
                Beneficiary,
            ),
        })

    if people_links:
        sections.append({
            'section': 'People & access',
            'links': people_links,
        })

    aid_links = []

    if permissions['aid_schedules']:
        aid_links.append({
            'label': 'Aid schedules',
            'url': _admin_url(
                admin_site,
                AidSchedule,
            ),
        })

    if permissions['aid_history']:
        aid_links.append({
            'label': 'Aid delivery history',
            'url': _admin_url(
                admin_site,
                AidHistory,
            ),
        })

    if aid_links:
        sections.append({
            'section': 'Aid operations',
            'links': aid_links,
        })

    support_links = []

    if permissions['complaints']:
        support_links.append({
            'label': 'Complaints',
            'url': _admin_url(
                admin_site,
                Complaint,
            ),
        })

    if permissions['articles']:
        support_links.append({
            'label': 'Articles',
            'url': _admin_url(
                admin_site,
                Article,
            ),
        })

    if permissions['notifications']:
        support_links.append({
            'label': 'Notifications',
            'url': _admin_url(
                admin_site,
                Notification,
            ),
        })

    if support_links:
        sections.append({
            'section': 'Support & content',
            'links': support_links,
        })

    system_links = []

    if permissions['reports']:
        system_links.append({
            'label': 'Reports',
            'url': _admin_url(
                admin_site,
                Report,
            ),
        })

    if permissions['backups']:
        system_links.append({
            'label': 'Backups',
            'url': _admin_url(
                admin_site,
                Backup,
            ),
        })

    if system_links:
        sections.append({
            'section': 'System',
            'links': system_links,
        })

    return sections


def build_dashboard_context(
    request,
    admin_site,
):
    """
    Build all dashboard data for the current Admin user.

    Empty tables safely produce zero counts and empty recent lists.
    """
    models = {
        'users': CustomUser,
        'beneficiaries': Beneficiary,
        'aid_schedules': AidSchedule,
        'aid_history': AidHistory,
        'complaints': Complaint,
        'articles': Article,
        'notifications': Notification,
        'reports': Report,
        'backups': Backup,
    }

    permissions = {
        key: _can_view_model(
            request,
            admin_site,
            model,
        )
        for key, model in models.items()
    }

    querysets = {
        key: (
            _get_model_queryset(
                request,
                admin_site,
                model,
            )
            if permissions[key]
            else None
        )
        for key, model in models.items()
    }

    counts = {}

    role_distribution = []
    aid_status_distribution = []

    recent_beneficiaries = []
    recent_aid_schedules = []
    recent_complaints = []

    if querysets['users'] is not None:
        role_counts = _get_grouped_counts(
            querysets['users'],
            'role',
        )

        counts.update({
            'total_users': sum(
                role_counts.values()
            ),
            'registration_employees': (
                role_counts.get(
                    'registration',
                    0,
                )
            ),
            'awareness_employees': (
                role_counts.get(
                    'awareness',
                    0,
                )
            ),
            'helpdesk_employees': (
                role_counts.get(
                    'helpdesk',
                    0,
                )
            ),
        })

        role_distribution = _build_distribution(
            counts=role_counts,
            choices=CustomUser.ROLE_CHOICES,
            tones=[
                'primary',
                'teal',
                'sky',
                'violet',
                'warning',
            ],
        )

    if querysets['beneficiaries'] is not None:
        counts['total_beneficiaries'] = (
            querysets['beneficiaries'].count()
        )

        recent_beneficiaries = (
            _get_recent_beneficiaries(
                querysets['beneficiaries'],
                admin_site,
            )
        )

    if querysets['aid_schedules'] is not None:
        aid_status_counts = _get_grouped_counts(
            querysets['aid_schedules'],
            'status',
        )

        counts.update({
            'pending_aid_schedules': (
                aid_status_counts.get(
                    'pending',
                    0,
                )
            ),
            'missed_aid_schedules': (
                aid_status_counts.get(
                    'missed',
                    0,
                )
            ),
        })

        aid_status_distribution = (
            _build_distribution(
                counts=aid_status_counts,
                choices=AidSchedule.STATUS_CHOICES,
                tones=[
                    'warning',
                    'danger',
                    'success',
                ],
            )
        )

        recent_aid_schedules = (
            _get_recent_aid_schedules(
                querysets['aid_schedules'],
                admin_site,
            )
        )

    if querysets['aid_history'] is not None:
        counts['completed_aid_deliveries'] = (
            querysets['aid_history'].count()
        )

    if querysets['complaints'] is not None:
        complaint_counts = (
            querysets['complaints']
            .order_by()
            .aggregate(
                pending=Count(
                    'pk',
                    filter=Q(
                        status='pending',
                    ),
                ),
                resolved=Count(
                    'pk',
                    filter=Q(
                        status='resolved',
                    ),
                ),
            )
        )

        counts.update({
            'pending_complaints': (
                complaint_counts['pending']
            ),
            'resolved_complaints': (
                complaint_counts['resolved']
            ),
        })

        recent_complaints = (
            _get_recent_complaints(
                querysets['complaints'],
                admin_site,
            )
        )

    if querysets['articles'] is not None:
        counts['published_articles'] = (
            querysets['articles'].count()
        )

    if querysets['notifications'] is not None:
        counts['total_notifications'] = (
            querysets['notifications'].count()
        )

    stat_cards = _build_stat_cards(
        counts,
        permissions,
        admin_site,
    )

    quick_links = _get_quick_links(
        permissions,
        admin_site,
    )

    return {
        'dashboard_stat_cards': stat_cards,
        'dashboard_role_distribution': (
            role_distribution
        ),
        'dashboard_aid_status_distribution': (
            aid_status_distribution
        ),
        'dashboard_recent_beneficiaries': (
            recent_beneficiaries
        ),
        'dashboard_recent_aid_schedules': (
            recent_aid_schedules
        ),
        'dashboard_recent_complaints': (
            recent_complaints
        ),
        'dashboard_quick_links': quick_links,
        'dashboard_permissions': permissions,
        'dashboard_has_content': bool(
            stat_cards
            or quick_links
        ),
    }