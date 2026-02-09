"""
URL configuration for khoroshevo_mnevniki project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from places import views

# Настройки админки
admin.site.site_header = 'Администрирование путеводителя'
admin.site.site_title = 'Хорошёво-Мнёвники'
admin.site.index_title = 'Панель управления'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tinymce/', include('tinymce.urls')),
    path('', views.index, name='index'),
    path('places/', views.get_places_geojson, name='places_geojson'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

