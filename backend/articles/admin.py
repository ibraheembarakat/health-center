from django.contrib import admin
from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'author',
        'category',
        'published_at',
    )

    list_filter = (
        'category',
        'published_at',
    )

    search_fields = (
        'title',
        'content',
        'author__username',
        'author__first_name',
        'author__last_name',
        'author__email',
    )

    readonly_fields = (
        'published_at',
    )

    fieldsets = (
        ('Article content', {
            'fields': (
                'title',
                'category',
                'content',
            ),
        }),
        ('Publishing information', {
            'fields': (
                'author',
                'published_at',
            ),
        }),
    )