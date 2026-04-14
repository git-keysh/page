// layout.js

(function(){
  "use strict";

  const selectionScreen = document.getElementById('selectionScreen');
  const layoutContainer = document.getElementById('layoutContainer');
  const changeBtn = document.getElementById('changeLayoutBtn');
  const cartCountSpan = document.getElementById('cartCount');
  const cartToast = document.getElementById('cartToast');
  const toastMessage = document.getElementById('toastMessage');
  const viewCartToastBtn = document.getElementById('viewCartToastBtn');
  const cartButton = document.getElementById('cartButton');

  let currentLayoutNumber = null;
  let cartItems = []; // simple array of product names

  function updateCartUI() {
    const count = cartItems.length;
    cartCountSpan.textContent = count;
  }

  function addToCart(productName) {
    cartItems.push(productName);
    updateCartUI();
    toastMessage.textContent = `✨ "${productName}" added to cart`;
    cartToast.classList.add('show');
    setTimeout(() => {
      cartToast.classList.remove('show');
    }, 3000);
  }

  function showCartSummary() {
    if (cartItems.length === 0) {
      alert('🛒 Your cart is empty. Add some fresh prints!');
      return;
    }
    const itemList = cartItems.map((item, i) => `${i+1}. ${item}`).join('\n');
    alert(`🛍️ Your cart (${cartItems.length} items):\n${itemList}\n\n💳 Total: $${(cartItems.length * 34.99).toFixed(2)}\n( Demo checkout — thanks for browsing! )`);
  }

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

      // Lazy load images
      layoutContainer.querySelectorAll('img').forEach(img => {
        img.loading = 'lazy';
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.4s ease';
        img.onload = () => { img.style.opacity = '1'; };
        if (img.complete) img.style.opacity = '1';
      });

      // Attach order now listeners
      setTimeout(() => {
        attachOrderListeners();
      }, 30);
    } catch (error) {
      console.warn(error);
      alert('Could not load layout. Please try again.');
    }
  }

  function attachOrderListeners() {
    const container = layoutContainer;
    if (!container) return;
    container.querySelectorAll('.order-now-btn, .quick-order-btn').forEach(btn => {
      btn.removeEventListener('click', handleOrderClick);
      btn.addEventListener('click', handleOrderClick);
    });
    // Also handle any "add to cart" inside cards
    container.querySelectorAll('.urban-card button, .clean-card button, .masonry-item button').forEach(btn => {
      if (!btn.classList.contains('order-bound')) {
        btn.classList.add('order-bound');
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = btn.closest('.urban-card, .clean-card, .masonry-item');
          const title = card?.querySelector('h4')?.innerText || 'Custom Tee';
          addToCart(title);
        });
      }
    });
  }

  function handleOrderClick(e) {
    const btn = e.currentTarget;
    const productCard = btn.closest('.product-card, .urban-card, .clean-card, .masonry-item, .hero-action');
    let productName = 'Mateo Print';
    if (productCard) {
      const nameEl = productCard.querySelector('h4, h3, .product-title');
      if (nameEl) productName = nameEl.innerText;
    } else {
      productName = 'Limited Edition Tee';
    }
    addToCart(productName);
  }

  // Delegate events for layout selection
  document.querySelectorAll('.layout-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const layout = card.dataset.layout;
      if (layout) loadLayout(layout);
    });
  });

  changeBtn.addEventListener('click', showSelection);

  cartButton.addEventListener('click', showCartSummary);
  viewCartToastBtn.addEventListener('click', showCartSummary);

  // If cart toast view button clicked, also close toast
  viewCartToastBtn.addEventListener('click', () => {
    cartToast.classList.remove('show');
  });

  // If hash selection
  if (window.location.hash === '#selection') showSelection();

  // Expose for potential global use
  window.MateoDemo = {
    addToCart,
    showCartSummary
  };
})();