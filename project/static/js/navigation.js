/** Модуль навигации и избранного */
let userLocation = null;
let userLocationMarker = null;
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let nearbyMarkers = [];

// Инициализация навигации
function initNavigation() {
    const btnLocate = document.getElementById('btn-locate');
    const btnFavorites = document.getElementById('btn-favorites');

    const favoritesPanel = document.getElementById('favorites-panel');
    const favoritesClose = document.getElementById('favorites-close');

    // Геолокация
    if (btnLocate) {
        btnLocate.addEventListener('click', () => {
            locateUser();
        });
    }

    // Избранное
    if (btnFavorites) {
        btnFavorites.addEventListener('click', () => {
            showFavorites();
        });
    }

    if (favoritesClose) {
        favoritesClose.addEventListener('click', () => {
            hideFavorites();
        });
    }



    // Обновить бейдж избранного
    updateFavoritesBadge();
}

// Геолокация пользователя
function locateUser() {
    if (!navigator.geolocation) {
        showNotification('Геолокация не поддерживается браузером', 'error');
        return;
    }

    showNotification('Определение местоположения...', 'info');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            userLocation = [latitude, longitude];

            // Удалить старый маркер
            if (userLocationMarker) {
                map.removeLayer(userLocationMarker);
            }

            // Создать синий маркер
            const userIcon = L.divIcon({
                className: 'user-location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            userLocationMarker = L.marker([latitude, longitude], { icon: userIcon })
                .addTo(map)
                .bindTooltip('Вы здесь', { permanent: true, direction: 'bottom', className: 'custom-tooltip' });

            // Переместить карту
            map.flyTo([latitude, longitude], 15, { duration: 1.5 });

            showNotification('Местоположение найдено!', 'success');

            // Показать ближайшие места
            setTimeout(() => findNearbyPlaces(), 1000);
        },
        (error) => {
            console.warn('Geolocation high accuracy failed, retrying with low accuracy...', error);
            // Fallback to low accuracy
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    userLocation = [latitude, longitude];

                    // Same success handler logic (can be refactored, but repeating for simplicity)
                    if (userLocationMarker) {
                        map.removeLayer(userLocationMarker);
                    }

                    const userIcon = L.divIcon({
                        className: 'user-location-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });

                    userLocationMarker = L.marker([latitude, longitude], { icon: userIcon })
                        .addTo(map)
                        .bindTooltip('Вы здесь (прибл.)', { permanent: true, direction: 'bottom', className: 'custom-tooltip' });

                    map.flyTo([latitude, longitude], 15, { duration: 1.5 });
                    showNotification('Местоположение найдено (низкая точность)', 'success');
                    setTimeout(() => findNearbyPlaces(), 1000);
                },
                (retryError) => {
                    console.warn('Geolocation low accuracy failed. Using default location.', retryError);

                    // Fallback to default center (Khoroshevo-Mnevniki)
                    const defaultLat = 55.776;
                    const defaultLng = 37.456;
                    userLocation = [defaultLat, defaultLng];

                    if (userLocationMarker) {
                        map.removeLayer(userLocationMarker);
                    }

                    const userIcon = L.divIcon({
                        className: 'user-location-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });

                    userLocationMarker = L.marker([defaultLat, defaultLng], { icon: userIcon })
                        .addTo(map);

                    // Custom tooltip behavior: show on hover, hide 2s after leave
                    userLocationMarker.bindTooltip('Центр района (геолокация недоступна)', {
                        permanent: false,
                        direction: 'bottom',
                        className: 'custom-tooltip'
                    });

                    // Remove default Leaflet hover observers to control behavior manually
                    userLocationMarker.off('mouseover');
                    userLocationMarker.off('mouseout');

                    let tooltipTimeout;
                    userLocationMarker.on('mouseover', function () {
                        if (tooltipTimeout) {
                            clearTimeout(tooltipTimeout);
                            tooltipTimeout = null;
                        }
                        this.openTooltip();
                    });

                    userLocationMarker.on('mouseout', function () {
                        tooltipTimeout = setTimeout(() => {
                            this.closeTooltip();
                        }, 2000);
                    });

                    map.flyTo([defaultLat, defaultLng], 14, { duration: 1.5 });

                    showNotification('Геолокация недоступна. Показан центр района.', 'info');
                    setTimeout(() => findNearbyPlaces(), 1000);
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
            );
        },
        { enableHighAccuracy: true, timeout: 5000 }
    );
}

// Найти ближайшие места
function findNearbyPlaces() {
    if (!userLocation) {
        showNotification('Сначала определите местоположение', 'error');
        return;
    }

    const [userLat, userLng] = userLocation;

    // Рассчитать расстояние до каждого места
    const placesWithDistance = placesData.map(feature => {
        const [lng, lat] = feature.geometry.coordinates;
        const distance = calculateDistance(userLat, userLng, lat, lng);
        return { feature, distance, lng, lat };
    }).sort((a, b) => a.distance - b.lng);

    // Показать топ-5 ближайших
    const nearby = placesWithDistance.slice(0, 5);

    // Добавить линии до ближайших мест
    nearbyMarkers.forEach(marker => map.removeLayer(marker));
    nearbyMarkers = [];

    nearby.forEach((item, index) => {
        const { feature, distance, lat, lng } = item;

        // Нарисовать линию
        const line = L.polyline([userLocation, [lat, lng]], {
            color: '#E31E24',
            weight: 2,
            dashed: true,
            opacity: 0.6
        }).addTo(map);

        nearbyMarkers.push(line);

        // Подсветить маркер
        markers.forEach(marker => {
            const markerLatLng = marker.getLatLng();
            if (Math.abs(markerLatLng.lat - lat) < 0.0001 && Math.abs(markerLatLng.lng - lng) < 0.0001) {
                marker.setStyle({ color: '#E31E24' });
            }
        });
    });

    showNotification(`Найдено ${nearby.length} ближайших мест!`, 'success');

    // Показать список в карточке или панельке
    if (nearby.length > 0) {
        const firstPlace = nearby[0].feature.properties;
        showPlaceCard(firstPlace);
    }
}

// Рассчитать расстояние (в км)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Переключить отображение ближайших мест
function toggleNearbyPlaces() {
    if (!userLocation) {
        locateUser();
        return;
    }
    findNearbyPlaces();
}

// Показать избранное
function showFavorites() {
    const panel = document.getElementById('favorites-panel');
    const list = document.getElementById('favorites-list');

    if (!panel || !list) return;

    panel.classList.remove('hidden');

    // Очистить список
    list.innerHTML = '';

    list.innerHTML = '<div class="favorites-empty">Нет избранных мест<br><small>Выберите место на карте,<br>затем нажмите ☆ в карточке</small></div>';

    // Отобразить избранные
    favorites.forEach(fav => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <div class="favorite-title">${fav.title}</div>
            <div class="favorite-desc">${fav.description_short || ''}</div>
            <button class="favorite-delete">🗑</button>
        `;

        // Клик на место
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('favorite-delete')) {
                hideFavorites();
                const place = placesData.find(p => p.properties.title === fav.title);
                if (place) {
                    map.flyTo([fav.lat, fav.lng], 15, { duration: 1 });
                    showPlaceCard(place.properties);
                }
            }
        });

        // Удалить из избранного
        item.querySelector('.favorite-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromFavorites(fav.title);
        });

        list.appendChild(item);
    });

    // Закрыть карту по клику вне панели
    setTimeout(() => {
        document.addEventListener('click', closeFavoritesHandler);
    }, 100);
}

// Скрывать избранное при клике вне
function closeFavoritesHandler(e) {
    const panel = document.getElementById('favorites-panel');
    const btnFavorites = document.getElementById('btn-favorites');

    if (!panel.contains(e.target) && !btnFavorites.contains(e.target)) {
        hideFavorites();
        document.removeEventListener('click', closeFavoritesHandler);
    }
}

// Скрыть избранное
function hideFavorites() {
    const panel = document.getElementById('favorites-panel');
    if (panel) {
        panel.classList.add('hidden');
    }
}

// Добавить в избранное
function addToFavorites(properties, lat, lng) {
    const existing = favorites.find(f => f.title === properties.title);
    if (existing) return;

    favorites.push({
        title: properties.title,
        description_short: properties.description_short,
        lat: lat,
        lng: lng
    });

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesBadge();
    showNotification(`"${properties.title}" добавлено в избранное`, 'success');
}

// Удалить из избранного
function removeFromFavorites(title) {
    favorites = favorites.filter(f => f.title !== title);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesBadge();
    showNotification('Удалено из избранного', 'info');
    showFavorites(); // Обновить список
}

// Обновить бейдж
function updateFavoritesBadge() {
    const badge = document.querySelector('.nav-btn .badge');
    if (!badge) return;

    if (favorites.length > 0) {
        badge.textContent = favorites.length;
        badge.classList.add('visible');
    } else {
        badge.classList.remove('visible');
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';

    let bgColor = 'var(--text-dark)';
    if (type === 'success') bgColor = '#E31E24';
    if (type === 'error') bgColor = '#F44336';

    notification.style.backgroundColor = bgColor;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
