"""Представления для приложения places"""
from django.shortcuts import render
from .models import Place
from .utils import build_place_feature, build_geojson_response


def index(request):
    """Главная страница с картой"""
    return render(request, 'index.html')


def get_places_geojson(request):
    """API endpoint для получения мест в формате GeoJSON"""
    places = Place.objects.prefetch_related('images').all()
    features = [build_place_feature(place, request) for place in places]
    return build_geojson_response(features)

