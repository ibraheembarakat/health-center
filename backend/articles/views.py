

# Create your views here.
from rest_framework.viewsets import ModelViewSet
#المودل فيو سيت بيقبل حذف غيت وبوست وديليت
#  استيراد لعرض لستة من المقالات    
from rest_framework.permissions import AllowAny,IsAuthenticated
# استيراد لعرض المقالات للجميع بدون تسجيل دخول  
from rest_framework.response import Response
#من اجل ارجاع الرد للفرونت يللي هو عباره عن مقال بعد مضضيف المقال
from rest_framework import status
#يعطي اسماء واضحه لعنوان http
#مشان استخدمن ضمن الكود
from django_filters.rest_framework import DjangoFilterBackend
#فلتره حسب حقل معين
from rest_framework.filters import SearchFilter, OrderingFilter
#هدول التلاته يللي حطيتهن بالسيتينجز هدول عباره عن فلترز 
from .models import Article
# استيراد جداول المقالات من نفس المجلد
from .serializers import ArticleSerializer , ArticleCreateSerializer
# استيراد السيرياليزر لعرض المقالات بشكل منسق
from .permissions import IsAwarenessOrManager
class ArticleViewSet(ModelViewSet):# هون ليست لعرض المقالات
    queryset=Article.objects.select_related('author')
    http_method_names=['patch','get','post','delete','head','options']
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    #هون انا فعلت الفلتره عهي ال api
    filterset_fields = ['category','author']
    search_fields = ['title', 'content']
    ordering_fields = ['published_at', 'title']
    #اول شي المستخدم بيطلب ريكويست بتجي عهالفيو بعدين بتشوف الو اني بعدين بتروع عالكويري سيت بعدين لعرض كل مقال بتروح عالسيرياليزر 
    def get_serializer_class(self):
        if self.action in ['create','partial_update']:
            return ArticleCreateSerializer
        return ArticleSerializer
    def get_permissions(self):
        if self.action in ['list','retrieve']:
            return[AllowAny()]
        if self.action in ['create','destroy','partial_update']:
            return [IsAuthenticated(),IsAwarenessOrManager()]
        return [IsAuthenticated()]#هي ضفتها لعبي فراغ لان ما الها ستين لزمه بس خلص مشان في حال صار اي اكشن تانيه
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)#هون بينحفظ اليوزر يللي كتب الكرييت بدون ما هو يللي يعملها
    def create(self, request, *args, **kwargs):# بعد الكرييت بدي ياه يرجع كل شي للفرونت 
        create_serializer = self.get_serializer(data=request.data)#البيانات يللي ارسلها الفرونت بالبودي
        create_serializer.is_valid(raise_exception=True)#بيرجع عالسيرياليزر بيتحقق من المحتوى 
        self.perform_create(create_serializer)#يحفظ المقال بالداتا بيز وبيستدعي داله من شوي كتبتا 
        read_serializer = ArticleSerializer(create_serializer.instance,context=self.get_serializer_context())#مناخد هالمقال ومنمرره الارتيكل سيرياليزر مشان ينرد للفرونت
        return Response(read_serializer.data,status=status.HTTP_201_CREATED)#هون بتنرد البيانات للفرونت
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        article=self.get_object()
        update_serializer=self.get_serializer(article,data=request.data,partial=partial)
        update_serializer.is_valid(raise_exception=True)
        self.perform_update(update_serializer)
        read_serializer = ArticleSerializer(article, context=self.get_serializer_context())
        return Response(read_serializer.data,status=status.HTTP_200_OK)
    