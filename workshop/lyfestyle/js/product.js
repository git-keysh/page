// Ensure all image switching works for all images on the page
let currentProduct = null;

function changeImage(src, el, idx) {
    const mainImg = document.getElementById('main-img');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    if (typeof idx === 'number' && idx >= 0) {
        window.galleryIndex = idx;
    }
}

function renderProduct() {
    if (!currentProduct) return;
    // Generate thumbsHtml with inline onclick handler
    const thumbsHtml = (currentProduct.images || []).map((img, idx) => `
        <div class="thumb ${idx === 0 ? 'active' : ''}" onclick="changeImage('${img}', this, ${idx});">
            <img src="${img}" alt="thumb" onerror="if(this.src.indexOf('placeholder.png')===-1){this.src='images/placeholder.png';this.onerror=null;}">
        </div>
    `).join('');

    // Example: specsHtml, you may need to adjust this if you have a different specs structure
    let specsHtml = '';
    if (currentProduct.specs) {
        for (const [key, value] of Object.entries(currentProduct.specs)) {
            specsHtml += `<div class="spec-item"><span class="spec-label">${key}</span><span class="spec-value">${value}</span></div>`;
        }
    }

    document.getElementById('dynamic-content').innerHTML = `
        <main class="container">
            <section class="gallery-container">
                <div class="product-image-section">
                    <img src="${(currentProduct.images && currentProduct.images[0]) || ''}" id="main-img" onerror="if(this.src.indexOf('placeholder.png')===-1){this.src='images/placeholder.png';this.onerror=null;}"/>
                </div>
                <div class="thumb-row">${thumbsHtml}</div>
            </section>

            <section class="product-info-section">
                <a href="shop.html?brand=${encodeURIComponent(currentProduct.brand ? currentProduct.brand.toUpperCase() : '')}" style="text-decoration: none; display: inline-block;">
                    <span class="brand-tag" style="cursor: pointer;">${currentProduct.brand || ''}</span>
                </a>
                
                                <h1 class="product-title">${currentProduct.name || ''}</h1>
                                <p class="price">${
                                    currentProduct.price === undefined || currentProduct.price === null || currentProduct.price === ''
                                        ? 'Available Upon Request'
                                        : (typeof currentProduct.price === 'number'
                                                ? `$${Number(currentProduct.price).toLocaleString()}`
                                                : currentProduct.price)
                                }</p>
                <div class="specs-grid">${specsHtml}</div>
                
                <div class="action-area">
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQty(-1)"><i class="fas fa-minus"></i></button>
                        <input type="number" id="buy-qty" class="qty-input" value="1" readonly>
                        <button class="qty-btn" onclick="updateQty(1)"><i class="fas fa-plus"></i></button>
                    </div>
                    <button class="add-btn" onclick="addToCart()">Add to Shopping Bag</button>
                </div>
            </section>
        </main>
        `;
}

// Product loader: fetch product data, set currentProduct, and render
async function loadProduct() {
    try {
        // Get product ID from URL (e.g., ?id=123)
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const response = await fetch('products.json');
        const products = await response.json();
        // Find product by id, fallback to first product
        currentProduct = products.find(p => String(p.id) === String(productId)) || products[0];
        renderProduct();
    } catch (err) {
        document.getElementById('dynamic-content').innerHTML = '<p style="color:red">Failed to load product data.</p>';
        console.error(err);
    }
}

// Run loader on page load
window.addEventListener('DOMContentLoaded', loadProduct);