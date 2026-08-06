// --- OUR WORK PAGE INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initWorkLightbox();
});

function initWorkLightbox() {
    const images = Array.from(document.querySelectorAll('.gallery-item .gallery-image'));
    const modal = document.getElementById('work-lightbox');
    const modalImage = document.getElementById('work-lightbox-image');
    const closeButton = document.getElementById('work-lightbox-close');
    const prevButton = document.getElementById('work-lightbox-prev');
    const nextButton = document.getElementById('work-lightbox-next');

    if (!images.length || !modal || !modalImage || !closeButton || !prevButton || !nextButton) {
        return;
    }

    let currentIndex = 0;

    const renderImage = () => {
        const current = images[currentIndex];
        if (!current) return;
        modalImage.src = current.src;
        modalImage.alt = current.alt || `Work image ${currentIndex + 1}`;
    };

    const openModal = (index) => {
        currentIndex = index;
        renderImage();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const showPrevious = () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        renderImage();
    };

    const showNext = () => {
        currentIndex = (currentIndex + 1) % images.length;
        renderImage();
    };

    images.forEach((image, index) => {
        const card = image.closest('.gallery-item') || image;
        card.addEventListener('click', () => openModal(index));
    });

    closeButton.addEventListener('click', closeModal);
    prevButton.addEventListener('click', showPrevious);
    nextButton.addEventListener('click', showNext);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!modal.classList.contains('active')) return;
        if (event.key === 'Escape') closeModal();
        if (event.key === 'ArrowLeft') showPrevious();
        if (event.key === 'ArrowRight') showNext();
    });
}

// --- MOBILE MENU ---
function toggleMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const dropdown = document.querySelector('.nav-dropdown');
    
    if (hamburgerBtn && dropdown) {
        hamburgerBtn.classList.toggle('active');
        dropdown.classList.toggle('active');
    }
}
