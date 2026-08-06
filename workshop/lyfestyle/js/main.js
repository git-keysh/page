// --- 1. INITIALIZATION ---
// We keep the cart and search logic because they exist in the Nav on the Home Page
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const PAGE_TRANSITION_MS = 180;
const CROSS_SITE_TRANSITION_MS = 760;
const CROSS_BRAND_WELCOME_KEY = 'cross-brand-welcome';
const SHARED_THEME_KEY = 'site-theme';
const ARRIVAL_WELCOME_MS = 2200;
let isArrivalWelcomeActive = false;

document.addEventListener('DOMContentLoaded', () => {
    bindCrossBrandHeaderTransitions();
    initPageTransitions();
    showArrivalWelcomeIfNeeded();
    initDarkMode();
    updateCartDisplay();
    setupNavHUD();
    initMovables(); // initialize both floating cart and draggable WhatsApp button
    initSimplicityMotion();
});

function initSimplicityMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const revealSelector = [
        '.hero .hero-content > *',
        '.history-row',
        '.history-text > *',
        '.history-image',
        '.product-card',
        '.related-product-card',
        '.spec-item',
        '.info-card',
        '.thumb',
        '.product-item',
        '.location-card',
        '.work-item',
        '.cart-item',
        '.cart-item-info',
        '.cart-summary > *',
        '.qty-controls > *',
        '.action-area > *',
        '.checkout-section > *',
        'main > section > *',
        'section .container > *'
    ].join(',');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('sc-visible');
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    const applyReveal = (root = document) => {
        const elements = root.querySelectorAll(revealSelector);
        let index = 0;
        elements.forEach((element) => {
            if (element.dataset.scRevealBound === 'true') return;
            if (element.closest('nav')) return;

            element.dataset.scRevealBound = 'true';
            element.classList.add('sc-reveal');
            element.style.transitionDelay = `${Math.min(index * 35, 360)}ms`;
            revealObserver.observe(element);
            index += 1;
        });
    };

    const bindInteractions = (root = document) => {
        root.querySelectorAll('.btn, button, .add-to-cart-btn, .view-product-btn').forEach((button) => {
            if (button.dataset.scMagneticBound === 'true') return;
            button.dataset.scMagneticBound = 'true';

            button.addEventListener('mousemove', (event) => {
                const rect = button.getBoundingClientRect();
                const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
                const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
                button.style.transform = `translate(${x * 6}px, ${y * 5}px) scale(1.03)`;
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });

        root.querySelectorAll('.product-card, .related-product-card, .history-row, .location-card, .work-item, .info-card, .cart-summary').forEach((panel) => {
            if (panel.dataset.scTiltBound === 'true') return;
            panel.dataset.scTiltBound = 'true';

            panel.addEventListener('mousemove', (event) => {
                const rect = panel.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                const rotateY = (x - 0.5) * 8;
                const rotateX = (0.5 - y) * 6;
                panel.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            panel.addEventListener('mouseleave', () => {
                panel.style.transform = '';
            });
        });
    };

    applyReveal(document);
    bindInteractions(document);

    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof HTMLElement)) return;
                applyReveal(node);
                bindInteractions(node);
            });
        });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function bindCrossBrandHeaderTransitions() {
    const links = document.querySelectorAll('nav a[href="a6/index.html"], .nav-dropdown a[href="a6/index.html"]');
    if (!links.length) return;

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            if (event.defaultPrevented) return;
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            sessionStorage.setItem(CROSS_BRAND_WELCOME_KEY, 'A6 AUDIO');

            window.setTimeout(() => {
                window.location.href = link.href;
            }, 40);
        }, true);
    });
}

function isSimplicityHomePage() {
    const path = window.location.pathname.toLowerCase();
    return path.endsWith('/index.html') || path.endsWith('/simplicity creations/') || path === '/';
}

function showArrivalWelcomeIfNeeded() {
    const pendingWelcome = sessionStorage.getItem(CROSS_BRAND_WELCOME_KEY);
    if (!pendingWelcome) return;
    if (!isSimplicityHomePage() || pendingWelcome !== 'SIMPLICITY CREATIONS') {
        if (pendingWelcome === 'SIMPLICITY CREATIONS') {
            sessionStorage.removeItem(CROSS_BRAND_WELCOME_KEY);
        }
        return;
    }

    const overlay = ensurePageTransitionOverlay();
    const heading = overlay ? overlay.querySelector('.page-transition-copy h2') : null;

    if (heading) {
        heading.textContent = 'SIMPLICITY CREATIONS';
    }

    if (overlay) {
        overlay.classList.remove('show-copy');
        overlay.classList.remove('active');
        overlay.classList.remove('arrival-mode');
        overlay.classList.add('active');
        overlay.classList.add('arrival-mode');
        overlay.classList.add('show-copy');
    }
    isArrivalWelcomeActive = true;

    window.setTimeout(() => {
        if (overlay) {
            overlay.classList.remove('show-copy');
            overlay.classList.remove('active');
            overlay.classList.remove('arrival-mode');
        }
        isArrivalWelcomeActive = false;
        sessionStorage.removeItem(CROSS_BRAND_WELCOME_KEY);
    }, ARRIVAL_WELCOME_MS);
}

function initPageTransitions() {
    const body = document.body;
    if (!body) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLikelyLowPowerDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    if (prefersReducedMotion || isLikelyLowPowerDevice) {
        body.classList.add('page-ready');
        return;
    }

    requestAnimationFrame(() => {
        body.classList.add('page-ready');
    });

    const overlay = ensurePageTransitionOverlay();

    const shouldInterceptLink = (link, event) => {
        if (!link || event.defaultPrevented) return false;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
        if (link.target && link.target.toLowerCase() === '_blank') return false;
        if (link.hasAttribute('download')) return false;

        const href = link.getAttribute('href');
        if (!href) return false;
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;

        let destination;
        try {
            destination = new URL(link.href, window.location.href);
        } catch {
            return false;
        }

        if (destination.origin !== window.location.origin) return false;

        const sameDocumentNavigation =
            destination.pathname === window.location.pathname &&
            destination.search === window.location.search &&
            destination.hash;
        if (sameDocumentNavigation) return false;

        const hrefValue = (link.getAttribute('href') || '').replace(/\\/g, '/').toLowerCase();
        const isA6SwitchLink =
            hrefValue === 'a6/index.html' ||
            hrefValue === './a6/index.html' ||
            destination.pathname.toLowerCase().endsWith('/a6/index.html');

        if (isA6SwitchLink) return false;

        return true;
    };

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!shouldInterceptLink(link, event)) return;

        event.preventDefault();
        navigateWithTransition(link.href, overlay);
    }, true);

    window.addEventListener('pageshow', () => {
        body.classList.remove('page-leaving');
        body.classList.add('page-ready');
        if (overlay && !isArrivalWelcomeActive) {
            overlay.classList.remove('active');
            overlay.classList.remove('show-copy');
            overlay.classList.remove('arrival-mode');
        }
        window.__pageTransitioning = false;
    });
}

function ensurePageTransitionOverlay() {
    let overlay = document.getElementById('page-transition-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.innerHTML = '<div class="page-transition-screen"></div><div class="page-transition-copy"><p>WELCOME TO</p><h2></h2></div>';
    document.body.appendChild(overlay);
    return overlay;
}

function navigateWithTransition(url, overlay) {
    if (window.__pageTransitioning) return;
    window.__pageTransitioning = true;

    let destination;
    try {
        destination = new URL(url, window.location.href);
    } catch {
        destination = null;
    }

    const transitionDelay = PAGE_TRANSITION_MS;

    document.body.classList.add('page-leaving');

    window.setTimeout(() => {
        window.location.href = url;
    }, transitionDelay);
}

// --- 1.5 DARK MODE TOGGLE ---
function initDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    const sharedTheme = localStorage.getItem(SHARED_THEME_KEY);
    const isDarkMode = sharedTheme
        ? sharedTheme === 'dark'
        : (savedMode ? JSON.parse(savedMode) : false);
    
    if (!isDarkMode) {
        document.body.classList.add('light-mode');
    }

    localStorage.setItem(SHARED_THEME_KEY, isDarkMode ? 'dark' : 'light');
    
    // Use small delay to ensure elements are available
    setTimeout(() => {
        setupDarkModeButtons();
        updateToggleIcon();
    }, 0);
}

function setupDarkModeButtons() {
    const toggleDarkMode = () => {
        document.body.classList.add('theme-animating');
        document.body.classList.toggle('light-mode');
        const isLightMode = document.body.classList.contains('light-mode');
        const isDarkMode = !isLightMode;
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        localStorage.setItem(SHARED_THEME_KEY, isDarkMode ? 'dark' : 'light');
        updateToggleIcon();
        window.setTimeout(() => {
            document.body.classList.remove('theme-animating');
        }, 760);
    };
    
    // Desktop button
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
        // Remove any previous listeners
        modeToggle.replaceWith(modeToggle.cloneNode(true));
        const newToggle = document.getElementById('mode-toggle');
        if (newToggle) {
            newToggle.addEventListener('click', toggleDarkMode);
        }
    }
    
    // Mobile button
    const mobileToggle = document.getElementById('mode-toggle-mobile');
    if (mobileToggle) {
        // Remove any previous listeners
        mobileToggle.replaceWith(mobileToggle.cloneNode(true));
        const newMobileToggle = document.getElementById('mode-toggle-mobile');
        if (newMobileToggle) {
            newMobileToggle.addEventListener('click', toggleDarkMode);
        }
    }
}

function updateToggleIcon() {
    const modeToggle = document.getElementById('mode-toggle');
    const mobileToggle = document.getElementById('mode-toggle-mobile');
    const isLight = document.body.classList.contains('light-mode');
    
    if (modeToggle) {
        modeToggle.textContent = isLight ? 'DARK' : 'LIGHT';
        modeToggle.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
    
    if (mobileToggle) {
        mobileToggle.textContent = isLight ? 'DARK' : 'LIGHT';
        mobileToggle.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
}

// --- 2. NAVIGATION HUD & SEARCH ---
function setupNavHUD() {
    const searchBar = document.getElementById('product-search');
    if(!searchBar) return;

    searchBar.addEventListener('keypress', (e) => {
        // If user presses Enter in the Nav search, redirect them to the shop with the query
        if (e.key === 'Enter') {
            const term = e.target.value.trim();
            if(term.length > 1) {
                window.location.href = `shop.html?search=${encodeURIComponent(term)}`;
            }
        }
    });
}

// --- 3. FLOATING MOVEABLE CART LOGIC ---
function setupFloatingCart() {
    const floatCart = document.getElementById('moveableCart');
    if (!floatCart) return;

    let isDragging = false;

    floatCart.onmousedown = function(e) {
        // Don't trigger drag if clicking the actual link/icon
        if (e.target.closest('a')) return;

        isDragging = true;
        let shiftX = e.clientX - floatCart.getBoundingClientRect().left;
        let shiftY = e.clientY - floatCart.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            floatCart.style.left = pageX - shiftX + 'px';
            floatCart.style.top = pageY - shiftY + 'px';
            floatCart.style.right = 'auto'; 
            floatCart.style.bottom = 'auto';
        }

        function onMouseMove(e) {
            if (isDragging) moveAt(e.pageX, e.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.onmouseup = function() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
        };
    };

    floatCart.ondragstart = () => false;
}

// --- 3.5 DRAGGABLE WHATSAPP BUTTON ---
function setupDraggableWhatsApp() {
    const wa = document.querySelector('.whatsapp-button');
    if (!wa) return;

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let shiftX = 0;
    let shiftY = 0;
    const dragThreshold = 10;

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function moveAt(pageX, pageY) {
        const maxLeft = window.scrollX + window.innerWidth - wa.offsetWidth - 8;
        const maxTop = window.scrollY + window.innerHeight - wa.offsetHeight - 8;
        const nextLeft = clamp(pageX - shiftX, window.scrollX + 8, maxLeft);
        const nextTop = clamp(pageY - shiftY, window.scrollY + 8, maxTop);

        wa.style.left = nextLeft + 'px';
        wa.style.top = nextTop + 'px';
        wa.style.right = 'auto';
        wa.style.bottom = 'auto';
    }

    function onMouseMove(e) {
        if (!dragging) return;
        const distance = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (!moved && distance > dragThreshold) {
            moved = true;
        }
        if (moved) {
            moveAt(e.pageX, e.pageY);
        }
    }

    wa.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        dragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        shiftX = e.clientX - wa.getBoundingClientRect().left;
        shiftY = e.clientY - wa.getBoundingClientRect().top;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', function() {
            dragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            window.setTimeout(() => {
                moved = false;
            }, 0);
        }, { once: true });
    });

    wa.addEventListener('click', function(e) {
        if (moved) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    wa.ondragstart = () => false;
}

// call both if needed
function initMovables() {
    setupFloatingCart();
    setupDraggableWhatsApp();
}

// adjust DOMContentLoaded earlier to call initMovables instead of setupFloatingCart

// --- 4. GLOBAL CART UPDATE ---
function updateCartDisplay() {
    // Re-read cart from localStorage to get latest data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Updates the badge in the Nav and the badge on the Floating Cart
    const counts = document.querySelectorAll('#cart-count, .cart-count-badge');
    counts.forEach(el => {
        if (el) el.innerText = cart.length;
    });
}

// --- 5. SEARCH FUNCTIONALITY ---
function navSearch(event) {
    const query = event.target.value.toLowerCase();
    if (event.key === 'Enter' || query.length === 0) {
        if (query.length > 0) {
            localStorage.setItem('searchQuery', query);
            window.location.href = 'shop.html?search=' + encodeURIComponent(query);
        }
    }
}