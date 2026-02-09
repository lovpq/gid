/** Главный файл - инициализация приложения */
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initSearch();
    initNavigation();

    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', hidePlaceCard);
    }

    document.addEventListener('click', (e) => {
        const card = document.getElementById('place-card');
        const mapContainer = document.getElementById('map');
        const searchResults = document.getElementById('search-results');
        
        if (!card.classList.contains('hidden') && 
            mapContainer && 
            mapContainer.contains(e.target) &&
            !e.target.closest('.leaflet-popup') &&
            !e.target.closest('.leaflet-marker-icon')) {
            hidePlaceCard();
        }

        // Закрыть результаты поиска при клике вне
        if (searchResults && !e.target.closest('.search-container')) {
            searchResults.classList.add('hidden');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hidePlaceCard();
            const searchResults = document.getElementById('search-results');
            if (searchResults) {
                searchResults.classList.add('hidden');
            }
        }
    });
});

// Модуль поиска
let placesData = [];

async function initSearch() {
    try {
        const response = await fetch('/places/');
        if (response.ok) {
            const geojsonData = await response.json();
            placesData = geojsonData.features || [];
        }
    } catch (error) {
        console.error('Ошибка загрузки данных для поиска:', error);
    }

    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    // Поиск при вводе
    searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        
        if (query.length === 0) {
            searchResults.classList.add('hidden');
            searchClear.style.display = 'none';
            return;
        }
        
        searchClear.style.display = 'block';
        performSearch(query);
    }, 300));

    // Очистка поиска
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchResults.classList.add('hidden');
        searchClear.style.display = 'none';
    });

    // Фокус на поле поиска
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            performSearch(searchInput.value.trim());
        }
    });
}

function performSearch(query) {
    const searchResults = document.getElementById('search-results');
    
    if (!searchResults) return;

    const lowerQuery = query.toLowerCase();
    const filtered = placesData.filter(feature => {
        const { properties } = feature;
        const title = (properties.title || '').toLowerCase();
        const shortDesc = (properties.description_short || '').toLowerCase();
        return title.includes(lowerQuery) || shortDesc.includes(lowerQuery);
    });

    if (filtered.length === 0) {
        searchResults.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
    } else {
        searchResults.innerHTML = filtered.map(feature => {
            const { properties, geometry } = feature;
            const title = properties.title || '';
            const shortDesc = properties.description_short || '';
            const [lng, lat] = geometry.coordinates;
            
            return `
                <div class="search-result-item" data-lat="${lat}" data-lng="${lng}">
                    <div class="search-result-title">${escapeHtml(title)}</div>
                    <div class="search-result-desc">${escapeHtml(shortDesc)}</div>
                </div>
            `;
        }).join('');

        // Обработчики кликов на результаты
        searchResults.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lng = parseFloat(item.dataset.lng);
                const place = placesData.find(f => {
                    const [pLng, pLat] = f.geometry.coordinates;
                    return pLat === lat && pLng === lng;
                });
                
                if (place) {
                    // Переместить карту к месту
                    if (typeof map !== 'undefined' && map) {
                        map.flyTo([lat, lng], 16, {
                            duration: 1
                        });
                    }
                    
                    // Открыть карточку
                    if (typeof showPlaceCard === 'function') {
                        showPlaceCard(place.properties);
                    }
                }
                
                searchResults.classList.add('hidden');
            });
        });
    }

    searchResults.classList.remove('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Debounce функция для оптимизации поиска
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
