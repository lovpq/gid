/** Модуль для работы с картой */
let map;
let markers = [];

// Центр района Хорошёво-Мнёвники
const DEFAULT_CENTER = [55.776, 37.456];
const DEFAULT_ZOOM = 13;

// Иконка маркера в красном стиле
const redIcon = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Альтернативная иконка
const defaultIcon = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function initMap() {
    map = L.map('map', {
        attributionControl: false,
        zoomControl: false
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 19
    }).addTo(map);

    loadPlaces();
}

async function loadPlaces() {
    try {
        const response = await fetch('/places/');

        if (!response.ok) {
            console.error('Ошибка HTTP:', response.status);
            return;
        }

        const geojsonData = await response.json();

        if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
            console.log('Нет данных о местах. Добавьте места через админку.');
            return;
        }

        geojsonData.features.forEach(feature => {
            const { geometry, properties } = feature;
            const [lng, lat] = geometry.coordinates;

            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.warn('Некорректные координаты для места:', properties.title, lat, lng);
                return;
            }

            const marker = L.marker([lat, lng], { icon: redIcon })
                .addTo(map)
                .bindTooltip(
                    properties.title,
                    {
                        permanent: false,
                        direction: 'top',
                        offset: [0, -45],
                        className: 'custom-tooltip'
                    }
                );

            marker.on('add', function () {
                const iconImg = this._icon;
                if (iconImg) {
                    iconImg.onerror = function () {
                        marker.setIcon(defaultIcon);
                    };
                }
            });

            marker.on('click', () => {
                if (typeof showPlaceCard === 'function') {
                    // Inject coordinates into properties to allow adding to favorites
                    showPlaceCard({ ...properties, lat, lng });
                }
            });

            markers.push(marker);
        });

        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        } else {
            console.log('Маркеры не были добавлены на карту');
        }
    } catch (error) {
        console.error('Ошибка загрузки мест:', error);
    }
}

function invalidateMapSize() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }
}

