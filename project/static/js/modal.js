/** Модуль для модального окна просмотра изображений */
function openImageModal(imageUrl, title, currentIndex, totalImages) {
    const existingModal = document.getElementById('image-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-overlay"></div>
        <div class="image-modal-content">
            <button class="image-modal-close">&times;</button>
            <div class="image-modal-header">
                <h3>${title}</h3>
                <span class="image-counter">${currentIndex} / ${totalImages}</span>
            </div>
            <div class="image-modal-body">
                <img src="${imageUrl}" alt="${title}" class="image-modal-img">
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('show');

    const closeBtn = modal.querySelector('.image-modal-close');
    const overlay = modal.querySelector('.image-modal-overlay');
    
    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

