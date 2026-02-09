"""Inline формы для админки"""
from django.contrib import admin
from django.utils.html import format_html
from adminsortable2.admin import SortableInlineAdminMixin
from .models import Image


class ImageInline(SortableInlineAdminMixin, admin.TabularInline):
    """Inline форма для изображений места"""
    model = Image
    extra = 1
    readonly_fields = ['preview']
    fields = ['image', 'preview', 'order']

    def preview(self, obj):
        """Превью изображения"""
        if obj and obj.pk and obj.image:
            return format_html(
                '<img src="{}" style="max-height: 200px; max-width: 200px; border: 1px solid #ddd; border-radius: 4px;" />',
                obj.image.url
            )
        return 'Загрузите изображение для превью'
    preview.short_description = 'Превью'

