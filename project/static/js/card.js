/** Модуль для работы с карточкой места */
let currentPlaceCard = null;
let currentPlaceCoords = null;

function showPlaceCard(properties) {
    const card = document.getElementById('place-card');
    const title = document.getElementById('place-title');
    const descriptionShort = document.getElementById('place-description-short');
    const descriptionLong = document.getElementById('place-description-long');
    const carousel = document.getElementById('place-carousel');
    const mapContainer = document.getElementById('map');
    const favoriteToggle = document.getElementById('favorite-toggle');

    title.textContent = properties.title;
    descriptionShort.textContent = properties.description_short || '';

    // Сохранить координаты для избранного
    if (properties.lat && properties.lng) {
        currentPlaceCoords = { lat: properties.lat, lng: properties.lng };
    }

    // Обновить кнопку избранного
    if (favoriteToggle) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isFavorite = favorites.some(f => f.title === properties.title);
        favoriteToggle.classList.toggle('active', isFavorite);
        favoriteToggle.textContent = isFavorite ? '★' : '☆';

        // Обработчик клика на избранное
        // Обработчик клика на избранное
        favoriteToggle.onclick = (e) => {
            e.stopPropagation(); // Prevent bubbling issues
            e.preventDefault();

            console.log('Favorite toggled for:', properties.title);

            // Re-check favorite status from storage to be sure
            const currentFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const currentlyFavorite = currentFavorites.some(f => f.title === properties.title);

            if (currentlyFavorite) {
                if (typeof removeFromFavorites === 'function') {
                    removeFromFavorites(properties.title);
                } else {
                    console.error('removeFromFavorites function not found!');
                }
                favoriteToggle.textContent = '☆';
                favoriteToggle.classList.remove('active');
            } else {
                if (typeof addToFavorites === 'function') {
                    if (currentPlaceCoords) {
                        addToFavorites(properties, currentPlaceCoords.lat, currentPlaceCoords.lng);
                        favoriteToggle.textContent = '★';
                        favoriteToggle.classList.add('active');
                    } else {
                        console.error('No coordinates for this place, cannot add to favorites.');
                        alert('Ошибка: нет координат для добавления в избранное.');
                    }
                } else {
                    console.error('addToFavorites function not found!');
                }
            }
        };
    }

    let descriptionText = properties.description_long || '';
    if (descriptionText) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = descriptionText;
        descriptionText = tempDiv.textContent || tempDiv.innerText || '';
        descriptionText = descriptionText.replace(/\n/g, '<br>');
    }
    descriptionLong.innerHTML = descriptionText;

    carousel.innerHTML = '';

    console.log('Загрузка изображений для:', properties.title, 'Количество:', properties.images ? properties.images.length : 0);

    if (properties.images && properties.images.length > 0) {
        const carouselTitle = document.createElement('div');
        carouselTitle.style.cssText = 'font-size: 16px; font-weight: 600; color: var(--primary-red); margin-bottom: 15px;';
        carouselTitle.textContent = `Фотографии (${properties.images.length})`;
        carousel.appendChild(carouselTitle);

        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-container';

        properties.images.forEach((imageUrl, index) => {
            console.log('Добавление изображения:', imageUrl);
            const item = document.createElement('div');
            item.className = 'carousel-item';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `${properties.title} - фото ${index + 1}`;
            img.loading = 'eager';
            img.style.cursor = 'pointer';

            img.onerror = function () {
                console.error('Ошибка загрузки изображения:', imageUrl);
                this.style.display = 'none';
            };

            img.onload = function () {
                console.log('Изображение загружено:', imageUrl);
            };

            img.addEventListener('click', () => {
                if (typeof openImageModal === 'function') {
                    openImageModal(imageUrl, properties.title, index + 1, properties.images.length);
                }
            });

            item.appendChild(img);
            carouselContainer.appendChild(item);
        });

        carousel.appendChild(carouselContainer);

        if (properties.images.length > 1) {
            const hint = document.createElement('p');
            hint.style.cssText = 'text-align: center; color: var(--gray-dark); font-size: 14px; margin-top: 10px; font-style: italic;';
            hint.textContent = '← Прокрутите влево/вправо, чтобы посмотреть все фотографии →';
            carousel.appendChild(hint);
        }
    } else {
        carousel.innerHTML = '<div style="text-align: center; color: var(--gray-dark); font-style: italic; padding: 20px; background-color: var(--gray-light); border-radius: 8px;">Фотографии не добавлены.</div>';
    }

    card.classList.remove('hidden');
    document.body.classList.add('card-open');
    if (mapContainer && typeof invalidateMapSize === 'function') {
        invalidateMapSize();
    }
    currentPlaceCard = properties;
}

function hidePlaceCard() {
    const card = document.getElementById('place-card');
    const mapContainer = document.getElementById('map');

    card.classList.add('hidden');
    document.body.classList.remove('card-open');

    if (mapContainer && typeof invalidateMapSize === 'function') {
        invalidateMapSize();
    }

    currentPlaceCard = null;
}
