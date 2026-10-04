from django.db import models
from users.models import CustomUser

class Article(models.Model):
    CATEGORY_CHOICES = [
        ('nutrition', 'Nutrition'),
        ('health', 'Public health'),
        ('children', 'Child nutrition'),
        ('pregnancy', 'Pregnancy nutrition'),
        ('chronic_diseases', 'Chronic diseases'),
        ('awareness', 'Awareness'),
    ]
    title= models.CharField(max_length=200, verbose_name='Article title')
    content = models.TextField(verbose_name='Article content')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='Article category')
    author=models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name='Author',related_name='articles')
    published_at = models.DateTimeField(
    auto_now_add=True,
    verbose_name='Published at',
    editable=False
)
    class Meta:
        verbose_name = 'Article'
        verbose_name_plural = 'Articles'
        ordering = ['-published_at']
    def __str__(self):
        return self.title
# Create your models here.