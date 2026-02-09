"""Утилиты для работы с местами"""
from django.http import JsonResponse


def build_place_feature(place, request):
    """Создает GeoJSON feature для места"""
    images = []
    for image in place.images.all().order_by('order'):
        if image.image:
            try:
                image_url = request.build_absolute_uri(image.image.url)
                images.append(image_url)
            except Exception:
                try:
                    images.append(image.image.url)
                except:
                    pass
    
    return {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [place.lng, place.lat]
        },
        'properties': {
            'title': place.title,
            'placeId': place.id,
            'detailsUrl': f'/place/{place.slug}/',
            'description_short': place.description_short or '',
            'description_long': place.description_long or '',
            'images': images
        }
    }


def build_geojson_response(features):
    """Создает GeoJSON ответ"""
    geojson_data = {
        'type': 'FeatureCollection',
        'features': features
    }
    return JsonResponse(geojson_data, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 2})

