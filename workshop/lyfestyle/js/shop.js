// 1. DATA - Load from products.json
let inventory = [];

let currentBrand = null;
let currentCategory = null;
let currentType = null;
let currentPrice = 100000;
let currentSearch = '';

// Load products from JSON on page load
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const products = await response.json();
        
        // Transform products.json format to shop format (img instead of images[0])
        inventory = products.map(p => ({
            id: p.id,
            brand: p.brand,
            name: p.name,
            price: parseFloat(p.price),
            category: p.category,
            type: p.type,
            img: p.images[0],
            images: p.images,
            description: p.description,
            specs: p.specs,
            extra_info: p.extra_info
        }));
        
        // Now load filter state and apply filters
        loadFilterState();
        applyFilters();
        handleSearch();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('product-grid').innerHTML = '<div class="no-results">Error loading products. Please refresh the page.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// LOAD SAVED FILTER STATE
function loadFilterState() {
    const saved = localStorage.getItem('shopFilters');
    if (saved) {
        const state = JSON.parse(saved);
        currentBrand = state.brand || null;
        currentCategory = state.category || null;
        currentType = state.type || null;
        currentPrice = state.price || 100000;
    }
}

// SAVE FILTER STATE
function saveFilterState() {
    const state = {
        brand: currentBrand,
        category: currentCategory,
        type: currentType,
        price: currentPrice
    };
    localStorage.setItem('shopFilters', JSON.stringify(state));
}

// HANDLE SEARCH FROM URL
function handleSearch() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
        currentSearch = search;
        document.getElementById('brandSearch').value = search;
    }
}

// 2. RENDER PRODUCTS
function renderProducts(productsToShow) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = "";

    if (productsToShow.length === 0) {
        grid.innerHTML = `<div class="no-results">NO PRODUCTS FOUND.</div>`;
        return;
    }

    grid.innerHTML = productsToShow.map(item => `
        <div class="product-card">
            <div class="image-box">
                ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
                <img src="${item.img}" alt="${item.name}">
            </div>
            <div class="p-details">
                <span class="p-brand-tag">${item.brand}</span>
                <h3 class="p-name">${item.name}</h3>
                <div class="p-bottom">
                        <span class="p-price">${
                            typeof item.price === 'number' && !isNaN(item.price)
                                ? `$${item.price.toLocaleString()}`
                                : 'Available Upon Request'
                        }</span>
                    <div class="action-buttons">
                        <button class="add-btn" onclick='shopAddToCart(${JSON.stringify(item.id)})' title="Add to Cart">
                            <i class="fas fa-shopping-bag"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// SHOP ADD TO CART (from shop page)
function shopAddToCart(productId) {
    const normalizedId = String(productId);
    const product = inventory.find(p => String(p.id) === normalizedId);
    
    if (!product) {
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const cartItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        brand: product.brand,
        image: product.img,
        qty: 1
    };
    
    const existing = cart.find(item => String(item.id) === normalizedId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification('Added to cart: ' + product.name);
    
    // Redirect to cart after a short delay
    setTimeout(() => {
        window.location.href = "cart.html";
    }, 500);
}

// NOTIFICATION
function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

// 3. TOGGLE MENU
function toggleMenu(id) {
    const el = document.getElementById(id);
    const isVisible = el.style.display === "block";

    if (window.event) window.event.stopPropagation();

    el.style.display = isVisible ? "none" : "block";
    
    const icon = el.previousElementSibling.querySelector('.fa-chevron-right');
    if(icon) icon.style.transform = isVisible ? "rotate(0deg)" : "rotate(90deg)";
}

// 4. APPLY ALL FILTERS
function applyFilters() {
    let filtered = inventory;

    // Search filter
    if (currentSearch) {
        filtered = filtered.filter(item =>
            item.name.toUpperCase().includes(currentSearch.toUpperCase()) ||
            item.brand.toUpperCase().includes(currentSearch.toUpperCase())
        );
    }

    // Brand filter
    if (currentBrand) {
        filtered = filtered.filter(item => item.brand === currentBrand);
    }

    // Category filter
    if (currentCategory) {
        filtered = filtered.filter(item => item.category === currentCategory);
    }

    // Type filter
    if (currentType) {
        filtered = filtered.filter(item => item.type === currentType);
    }

    // Price filter
    filtered = filtered.filter(item => item.price <= currentPrice);

    renderProducts(filtered);
    saveFilterState();
}

// 5. FILTER FUNCTIONS
function filterBy(brand, category, type) {
    currentBrand = brand;
    currentCategory = category;
    currentType = type;
    applyFilters();
    
    if(window.innerWidth <= 768) {
        document.body.classList.add('filters-hidden');
    }
}

function filterSearch() {
    let input = document.getElementById('brandSearch').value;
    currentSearch = input;
    applyFilters();
}

function updatePrice(val) {
    currentPrice = val;
    document.getElementById('p-out').innerText = '$' + Number(val).toLocaleString();
    applyFilters();
}

function showAll() {
    currentBrand = null;
    currentCategory = null;
    currentType = null;
    currentSearch = '';
    currentPrice = 100000;
    document.getElementById('brandSearch').value = '';
    localStorage.removeItem('shopFilters');
    renderProducts(inventory);
}