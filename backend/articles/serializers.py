from rest_framework import serializers
#استيراد مكتبات السيرياليزر من دي ار اف 
from .models import Article
#استيراد جداول الارتكل من نفس المجلد
class ArticleSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)  # انص العربي للفئه
    author_name = serializers.SerializerMethodField()  # حقل لعرض اسم المؤلف
    class Meta:
        model = Article
        fields = ['id', 'title', 'content','category','category_display', 'author_name', 'published_at']
        read_only_fields=fields
    def get_author_name(self, obj):
        """Return the full name of the article's author."""
        if obj.author:
            full_name = obj.author.get_full_name()
            return full_name if full_name.strip() else obj.author.username
        return "غير معروف"
class ArticleCreateSerializer(serializers.ModelSerializer):#هاد لانشاء المقالات
    class Meta:
        model=Article
        fields=['title','content','category']
        #هي هيي الحقول يللي مسمحله يبعتها ال اي بي اي اثناء الانشاء الباقي كله عامله الي
    def validate_title(self,value):
        if len(value.strip())<5:
            raise serializers.ValidationError("the title must be at least 5 words")
        if len(value.strip())>200:
            raise serializers.ValidationError("the title must not be more than 200 words")
        return value
    def validate_content(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError('the content must be 20 words at least')
        return value