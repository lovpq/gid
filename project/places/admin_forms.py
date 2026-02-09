"""Формы для админки"""
from django import forms
from .models import Place


class PlaceAdminForm(forms.ModelForm):
    """Форма для редактирования места в админке"""
    class Meta:
        model = Place
        fields = '__all__'
        widgets = {
            'description_short': forms.Textarea(attrs={'rows': 3, 'cols': 80}),
            'description_long': forms.Textarea(attrs={'rows': 15, 'cols': 80, 'style': 'width: 100%;'}),
        }

