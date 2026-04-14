// layout.js
(function(){
  "use strict";

  // ----- DOM Elements -----
  const selectionScreen = document.getElementById('selectionScreen');
  const layoutContainer = document.getElementById('layoutContainer');
  const changeBtn = document.getElementById('changeLayoutBtn');
  const cartButton = document.getElementById('cartButton');
  const cartCountSpan = document.getElementById('cartCount');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const overlay = document.getElementById('overlay');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const productModal = document.getElementById('productModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalPriceValue = document.getElementById('modalPriceValue');
  const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
  const sizeButtons = document.querySelectorAll('.size-btn');

  // ----- State -----
  let currentLayoutNumber = null;
  let cart = []; // { id, name, price, image, quantity, size }
  let selectedProduct = null;
  let selectedSize = 'M';

  // ----- Helpers -----
  function generateId() { return Date.now() + '-' + Math.random().toString(36); }

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalItems;
    renderCartDrawer();
  }

  function renderCartDrawer() {
    if (!cartItemsContainer) return;
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="text-align:center; padding:40px 0; opacity:0.6;">Your cart is empty</p>';
      cartTotalPrice.textContent = '$0.00';
      return;
    }
    let html = '';
    let total = 0;
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      html += `
        <div class="cart-item" data-cart-id="${item.id}">
          <div class="cart-item-img" style="background-image: url('${item.image}');"></div>
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)} · ${item.size}</div>
            <div class="cart-item-actions">
              <button class="cart-qty-btn" data-action="decr">−</button>
              <span>${item.quantity}</span>
              <button class="cart-qty-btn" data-action="incr">+</button>
              <button class="cart-remove" data-action="remove">Remove</button>
            </div>
          </div>
        </div>
      `;
    });
    cartItemsContainer.innerHTML = html;
    cartTotalPrice.textContent = `$${total.toFixed(2)}`;

    // Attach cart item listeners
    cartItemsContainer.querySelectorAll('.cart-item').forEach(el => {
      const id = el.dataset.cartId;
      const decr = el.querySelector('[data-action="decr"]');
      const incr = el.querySelector('[data-action="incr"]');
      const remove = el.querySelector('[data-action="remove"]');
      decr?.addEventListener('click', () => updateCartItemQuantity(id, -1));
      incr?.addEventListener('click', () => updateCartItemQuantity(id, 1));
      remove?.addEventListener('click', () => removeCartItem(id));
    });
  }

  function updateCartItemQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
  }

  function removeCartItem(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
  }

  function addToCart(product, size = 'M', quantity = 1) {
    const existing = cart.find(i => i.name === product.name && i.size === size && i.price === product.price);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: generateId(),
        name: product.name,
        price: product.price,
        image: product.image,
        size: size,
        quantity: quantity
      });
    }
    updateCartUI();
    // Show brief feedback
    showToast(`✨ Added ${product.name} (${size})`);
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '100px';
    toast.style.left = '20px';
    toast.style.right = '20px';
    toast.style.background = '#1e1e2f';
    toast.style.color = 'white';
    toast.style.padding = '16px';
    toast.style.borderRadius = '60px';
    toast.style.textAlign = 'center';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '200';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    toast.style.transition = 'opacity 0.3s';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  function openCart() {
    cartDrawer.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  function openProductModal(product) {
    selectedProduct = product;
    modalImg.src = product.image;
    modalTitle.textContent = product.name;
    modalPrice.textContent = `$${product.price.toFixed(2)}`;
    modalPriceValue.textContent = product.price.toFixed(2);
    // Reset active size
    sizeButtons.forEach(btn => btn.classList.remove('active'));
    const defaultSizeBtn = Array.from(sizeButtons).find(b => b.dataset.size === 'M');
    if(defaultSizeBtn) defaultSizeBtn.classList.add('active');
    selectedSize = 'M';
    productModal.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    productModal.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    selectedProduct = null;
  }

  // ----- Layout Loading -----
  function removeInjectedStyles() {
    document.querySelectorAll('style[data-layout-style]').forEach(style => style.remove());
  }

  function showSelection() {
    if (layoutContainer) {
      layoutContainer.classList.add('hidden');
      layoutContainer.innerHTML = '';
    }
    selectionScreen.classList.remove('hidden');
    currentLayoutNumber = null;
    removeInjectedStyles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadLayout(layoutNum) {
    try {
      const url = `layouts/${layoutNum}-layout.html`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Layout not found');
      const html = await response.text();

      removeInjectedStyles();
      selectionScreen.classList.add('hidden');
      layoutContainer.innerHTML = html;
      layoutContainer.classList.remove('hidden');

      const styleBlocks = layoutContainer.querySelectorAll('style');
      styleBlocks.forEach(style => style.setAttribute('data-layout-style', 'true'));

      currentLayoutNumber = layoutNum;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Lazy load & attach product interactions
      layoutContainer.querySelectorAll('img').forEach(img => {
        img.loading = 'lazy';
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.4s';
        img.onload = () => { img.style.opacity = '1'; };
        if (img.complete) img.style.opacity = '1';
      });

      attachProductInteractions();
    } catch (error) {
      console.warn(error);
      alert('Could not load layout.');
    }
  }

  function attachProductInteractions() {
    // Attach click listeners to product cards (image/title opens modal)
    layoutContainer.querySelectorAll('.urban-card, .clean-card, .masonry-item').forEach(card => {
      const img = card.querySelector('img');
      const titleEl = card.querySelector('h4, h3');
      const priceText = card.querySelector('p')?.innerText || card.querySelector('.price')?.innerText || '$34';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 34.99;
      const name = titleEl?.innerText || 'Mateo Tee';
      const image = img?.src || '';

      const product = { name, price, image };

      // Open modal when image or title clicked (but not on button)
      const clickHandler = (e) => {
        if (e.target.closest('button')) return;
        openProductModal(product);
      };
      img?.addEventListener('click', clickHandler);
      titleEl?.addEventListener('click', clickHandler);

      // "Order now" buttons add directly
      const orderBtn = card.querySelector('button');
      if (orderBtn) {
        orderBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          addToCart(product, 'M', 1);
        });
      }
    });

    // Hero order buttons
    document.querySelectorAll('.order-now-btn, .hero-action').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart({ name: 'Limited Edition Tee', price: 39.99, image: 'https://printify.com/wp-content/uploads/2023/10/Unisex-Garment-Dyed-T-Shirt-with-design.jpg' }, 'L', 1);
      });
    });
  }

  // ----- Event Listeners -----
  document.querySelectorAll('.layout-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const layout = card.dataset.layout;
      if (layout) loadLayout(layout);
    });
  });

  changeBtn.addEventListener('click', showSelection);

  cartButton.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', () => {
    closeCart();
    closeModal();
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    alert(`🧾 Demo Checkout — Total: ${cartTotalPrice.textContent}\n( This is a demo, no real order )`);
  });

  // Modal close
  closeModalBtn.addEventListener('click', closeModal);

  // Size selection
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
    });
  });

  modalAddToCartBtn.addEventListener('click', () => {
    if (selectedProduct) {
      addToCart(selectedProduct, selectedSize, 1);
      closeModal();
    }
  });

  // Global escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeModal();
    }
  });

  // Initial selection screen
  updateCartUI();
})();