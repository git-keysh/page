async function loadProduct() {
  const container = document.getElementById('product-detail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  try {
    const response = await fetch('products.json');
    const products = await response.json();
    const product = products.find((item) => item.id === id) || products[0];

    container.innerHTML = `
      <div class="product-wrap">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <p class="muted">${product.brand} • ${product.category}</p>
          <h1>${product.name}</h1>
          <p class="price" style="margin-top: 0.5rem;">TT$ ${product.price.toLocaleString()}</p>
          <p class="muted">${product.description}</p>
          <ul class="list">
            ${product.features.map((feature) => `<li>${feature}</li>`).join('')}
          </ul>
          <div style="display:flex;gap:0.7rem;flex-wrap:wrap;">
            <button class="btn" onclick="addToCart('${product.id}')">Add to Cart</button>
            <a class="btn" href="contact.html">Book Installation</a>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = '<p class="muted">Unable to load product details.</p>';
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

document.addEventListener('DOMContentLoaded', loadProduct);
