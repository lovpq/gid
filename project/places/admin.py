"""Админка для приложения places"""
from django.contrib import admin
from adminsortable2.admin import SortableAdminMixin
from .models import Place
from .admin_forms import PlaceAdminForm
from .admin_inlines import ImageInline


@admin.register(Place)
class PlaceAdmin(SortableAdminMixin, admin.ModelAdmin):
    """Админка для управления местами"""
    form = PlaceAdminForm
    list_display = ['title', 'description_short', 'lat', 'lng']
    search_fields = ['title', 'description_short']
    inlines = [ImageInline]

    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description_short', 'description_long'),
            'description': 'Краткое описание видно в попапе на карте. Полное описание отображается в карточке места. ВАЖНО: Фотографии добавляются отдельно в разделе "Изображения" ниже, а не в тексте описания!'
        }),
        ('Координаты', {
            'fields': ('lat', 'lng'),
            'description': 'Широта (lat) и долгота (lng) места. Например: lat=55.776, lng=37.456'
        }),
        ('Служебные', {
            'fields': ('slug', 'order'),
            'classes': ('collapse',)
        }),
    )

