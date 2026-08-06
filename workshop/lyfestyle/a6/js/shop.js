let a6Inventory = [];
const PRICE_MIN = 0;
const PRICE_MAX = 100000;
const PRICE_STEP = 100;
const TABLET_BREAKPOINT = 1024;

const filters = {
  query: '',
  category: 'ALL',
  maxPrice: PRICE_MAX
};

function clampPrice(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return filters.maxPrice;
  const stepped = Math.round(numeric / PRICE_STEP) * PRICE_STEP;
  return Math.min(PRICE_MAX, Math.max(PRICE_MIN, stepped));
}

function updatePriceUI(value) {
  const priceInput = document.getElementById('a6-price');
  const priceNumberInput = document.getElementById('a6-price-input');
  const priceOutput = document.getElementById('a6-price-output');

  if (priceInput) priceInput.value = String(value);
  if (priceNumberInput) priceNumberInput.value = String(value);
  if (priceOutput) priceOutput.textContent = `TT$ ${value.toLocaleString()}`;
}

function setFiltersOpen(isOpen) {
  const layout = document.getElementById('a6-shop-layout');
  const toggleButton = document.getElementById('a6-filter-toggle');
  if (!layout || !toggleButton) return;

  layout.classList.toggle('filters-collapsed', !isOpen);
  toggleButton.textContent = isOpen ? 'Hide Filters' : 'Show Filters';
  toggleButton.setAttribute('aria-expanded', String(isOpen));

  const isTabletOrMobile = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT}px)`).matches;
  document.body.style.overflow = (isOpen && isTabletOrMobile) ? 'hidden' : '';
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  const resultCount = document.getElementById('a6-result-count');
  if (!grid) return;

  if (resultCount) {
    const countLabel = products.length === 1 ? 'product' : 'products';
    resultCount.textContent = `${products.length} ${countLabel}`;
  }

  if (!products.length) {
    grid.innerHTML = '<p class="muted">No products match the selected filters.</p>';
    return;
  }

  grid.innerHTML = products.map((product) => `
    <article class="card is-visible">
      <img src="${product.image}" alt="${product.name}">
      <div class="card-content">
        <p class="muted">${product.category}</p>
        <h3 class="card-title">${product.name}</h3>
        <p class="price">TT$ ${product.price.toLocaleString()}</p>
        <div style="display:flex;gap:0.6rem;flex-wrap:wrap;">
          <a class="btn" href="product.html?id=${product.id}">View Product</a>
          <button class="btn" onclick="addToCart('${product.id}')">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.card').forEach((card) => {
    card.classList.add('is-visible');
  });
}

function applyFilters() {
  const filtered = a6Inventory.filter((product) => {
    const queryText = `${product.name} ${product.category} ${product.brand}`.toLowerCase();
    const queryMatch = !filters.query || queryText.includes(filters.query);
    const categoryMatch = filters.category === 'ALL' || product.category === filters.category;
    const priceMatch = Number(product.price) <= filters.maxPrice;
    return queryMatch && categoryMatch && priceMatch;
  });

  renderProducts(filtered);
}

function setupFilters() {
  const layout = document.getElementById('a6-shop-layout');
  const toggleButton = document.getElementById('a6-filter-toggle');
  const closeButton = document.getElementById('a6-filter-close');
  const backdrop = document.getElementById('a6-filter-backdrop');
  const searchInput = document.getElementById('a6-search');
  const categorySelect = document.getElementById('a6-category');
  const priceInput = document.getElementById('a6-price');
  const priceNumberInput = document.getElementById('a6-price-input');
  const resetButton = document.getElementById('a6-reset-filters');

  if (window.matchMedia(`(max-width: ${TABLET_BREAKPOINT}px)`).matches) {
    setFiltersOpen(false);
  } else {
    setFiltersOpen(true);
  }

  window.addEventListener('resize', () => {
    const isTabletOrMobile = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT}px)`).matches;
    if (!isTabletOrMobile) {
      setFiltersOpen(true);
    } else {
      setFiltersOpen(false);
    }
  });

  if (toggleButton && layout) {
    toggleButton.addEventListener('click', () => {
      const isCollapsed = layout.classList.contains('filters-collapsed');
      setFiltersOpen(isCollapsed);
    });
  }

  if (closeButton) {
    closeButton.addEventListener('click', () => setFiltersOpen(false));
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => setFiltersOpen(false));
  }

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      filters.query = event.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', (event) => {
      filters.category = event.target.value;
      applyFilters();
    });
  }

  if (priceInput) {
    priceInput.addEventListener('input', (event) => {
      filters.maxPrice = clampPrice(event.target.value);
      updatePriceUI(filters.maxPrice);
      applyFilters();
    });
  }

  if (priceNumberInput) {
    priceNumberInput.addEventListener('input', (event) => {
      if (!event.target.value.trim()) return;
      filters.maxPrice = clampPrice(event.target.value);
      updatePriceUI(filters.maxPrice);
      applyFilters();
    });

    priceNumberInput.addEventListener('blur', () => {
      updatePriceUI(filters.maxPrice);
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      filters.query = '';
      filters.category = 'ALL';
      filters.maxPrice = PRICE_MAX;

      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = 'ALL';
      updatePriceUI(filters.maxPrice);

      applyFilters();
    });
  }

  updatePriceUI(filters.maxPrice);
}

function populateCategoryFilter(products) {
  const categorySelect = document.getElementById('a6-category');
  if (!categorySelect) return;

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort();
  categorySelect.innerHTML = '<option value="ALL">All Categories</option>' +
    categories.map((category) => `<option value="${category}">${category}</option>`).join('');
}

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  setupFilters();

  try {
    const response = await fetch('products.json');
    a6Inventory = await response.json();
    populateCategoryFilter(a6Inventory);
    applyFilters();
  } catch (error) {
    grid.innerHTML = '<p class="muted">Unable to load A6 products right now.</p>';
  }
}

function addToCart(productId) {
  const cart = JSON.parse(localStorage.getItem('a6Cart')) || [];
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  localStorage.setItem('a6Cart', JSON.stringify(cart));
  window.alert('Added to A6 cart');
}

document.addEventListener('DOMContentLoaded', loadProducts);
