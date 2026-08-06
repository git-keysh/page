async function loadFeaturedProducts() {
  const featuredGrid = document.getElementById('featured-products');
  if (!featuredGrid) return;

  try {
    const response = await fetch('products.json');
    const products = await response.json();

    const featured = products.slice(0, 3);

    featuredGrid.innerHTML = featured.map((product) => `
      <article class="card">
        <img src="${product.image}" alt="${product.name}">
        <div class="card-content">
          <span class="chip">${product.category}</span>
          <h3 class="card-title">${product.name}</h3>
          <p class="muted">${product.description}</p>
          <p class="price">TT$ ${product.price.toLocaleString()}</p>
          <div style="display:flex;gap:0.6rem;flex-wrap:wrap;">
            <a class="btn" href="product.html?id=${product.id}">View Product</a>
            <a class="btn" href="shop.html">Shop Category</a>
          </div>
        </div>
      </article>
    `).join('');
  } catch (error) {
    featuredGrid.innerHTML = '<p class="muted">Featured products are temporarily unavailable.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
