from rest_framework.permissions import BasePermission ,SAFE_METHODS 
#البيز بيرمشن انه فقط موظف التوعيه مسمحله يضيف ويحذف
#السيف ميثودر هو الغيت والهيد والاوبشنز التي لا تعدل بياانات
class IsAwarenessOrManager(BasePermission):
    #صلاحيه ترث البيز بيرمشن
        def has_permission(self, request, view):
                #داله للمناداه قبل تنفيذ الفيو
                if request.method in SAFE_METHODS :
                    return True#اي زائر فيه يشوف المقالات
                return(request.user.is_authenticated #يعني المستخدم مسجل دخوله
                       and request.user.role in ['awareness','manager'])#هون بيسمحله بكل شي
        def has_object_permission(self, request, view, obj):
                #داله للمناداه قبل تنفيذ الفيو
                if request.method in SAFE_METHODS :
                    return True#اي زائر فيه يشوف المقالات
                if request.user.role=='manager':
                      return True#المسؤول يقدر يعدل ويحذف كل المقالات
                if request.method=='DELETE':
                      return True
                if request.method=='PATCH':
                      return (request.user.role=='awareness' and obj.author.id==request.user.id)
                return False