async function getProducts() {
  const response = await fetch('products.json');
  return response.json();
}

function getCart() {
  return JSON.parse(localStorage.getItem('a6Cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('a6Cart', JSON.stringify(cart));
}

function renderEmpty(container) {
  container.innerHTML = '<p class="muted">Your A6 cart is empty.</p>';
}

function buildWhatsAppMessage(items, total, customerName, contactNumber, pickupBranch) {
  const lines = [
    'Hello A6 Audio, I would like to place this order:',
    `Full Name: ${customerName}`,
    `Contact Number: ${contactNumber}`,
    `Pickup Branch: ${pickupBranch}`,
    '',
    ...items.map(item => `- ${item.name} x${item.qty} (TT$ ${(item.price * item.qty).toLocaleString()})`),
    `Total: TT$ ${total.toLocaleString()}`
  ];

  return `https://wa.me/18687168237?text=${encodeURIComponent(lines.join('\n'))}`;
}

async function renderCart() {
  const container = document.getElementById('cart-content');
  const checkout = document.getElementById('checkout-wa');
  const customerNameInput = document.getElementById('a6-customer-name');
  const contactNumberInput = document.getElementById('a6-contact-number');
  const pickupBranch = document.getElementById('a6-pickup-branch');
  if (!container || !checkout) return;

  const cart = getCart();
  if (!cart.length) {
    renderEmpty(container);
    checkout.href = 'https://wa.me/18687168237?text=Hello%20A6%20Audio';
    return;
  }

  const products = await getProducts();
  const items = cart.map(entry => {
    const product = products.find(item => item.id === entry.id);
    return product ? { ...product, qty: entry.qty } : null;
  }).filter(Boolean);

  if (!items.length) {
    renderEmpty(container);
    return;
  }

  const rows = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>TT$ ${(item.price * item.qty).toLocaleString()}</td>
    </tr>
  `).join('');

  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  container.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:1rem;font-weight:700;">Grand Total: TT$ ${total.toLocaleString()}</p>
  `;

  const customerName = customerNameInput ? customerNameInput.value.trim() : '';
  const contactNumber = contactNumberInput ? contactNumberInput.value.trim() : '';
  const selectedBranch = pickupBranch ? pickupBranch.value : '';

  if (!customerName || !contactNumber || !selectedBranch) {
    checkout.href = '#';
    checkout.setAttribute('data-needs-details', 'true');
  } else {
    checkout.removeAttribute('data-needs-details');
    checkout.href = buildWhatsAppMessage(items, total, customerName, contactNumber, selectedBranch);
  }
}

function clearCart() {
  localStorage.removeItem('a6Cart');
  renderCart();
}

document.addEventListener('DOMContentLoaded', () => {
  const clearButton = document.getElementById('clear-cart');
  const checkout = document.getElementById('checkout-wa');
  const customerNameInput = document.getElementById('a6-customer-name');
  const contactNumberInput = document.getElementById('a6-contact-number');
  const pickupBranch = document.getElementById('a6-pickup-branch');

  if (clearButton) {
    clearButton.addEventListener('click', clearCart);
  }

  if (customerNameInput) {
    customerNameInput.addEventListener('input', renderCart);
  }

  if (contactNumberInput) {
    contactNumberInput.addEventListener('input', renderCart);
  }

  if (pickupBranch) {
    pickupBranch.addEventListener('change', renderCart);
  }

  if (checkout) {
    checkout.addEventListener('click', (event) => {
      if (checkout.getAttribute('data-needs-details') === 'true') {
        event.preventDefault();
        window.alert('Please enter full name, contact number, and pickup branch before checkout.');
        if (customerNameInput && !customerNameInput.value.trim()) {
          customerNameInput.focus();
          return;
        }
        if (contactNumberInput && !contactNumberInput.value.trim()) {
          contactNumberInput.focus();
          return;
        }
        if (pickupBranch) {
          pickupBranch.focus();
        }
      }
    });
  }

  renderCart();
});
