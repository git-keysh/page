const WHATSAPP_NUMBER = "1234567890"; // Replace with your business number

function updateQty(btn, delta) {
    const input = btn.parentElement.querySelector('input');
    let val = parseInt(input.value) + delta;
    if (val >= 1) {
        input.value = val;
        calculateTotal();
    }
}

function calculateTotal() {
    // This function would usually sum up the values in your cart array
    // For now, it updates the visual state
}

function sendToWhatsApp() {
    let message = "🚀 *NEW ORDER - SIMPLICITY CREATIONS*%0A%0A";
    const items = document.querySelectorAll('.cart-item');
    let total = 0;

    items.forEach(item => {
        const name = item.querySelector('.item-name').innerText;
        const brand = item.querySelector('.item-brand').innerText;
        const price = item.querySelector('.price-display').innerText.replace('$', '');
        const qty = item.querySelector('input').value;
        const subtotal = parseFloat(price) * parseInt(qty);
        
        total += subtotal;
        message += `• *${name}* (${brand})%0A   Qty: ${qty} - $${subtotal.toFixed(2)}%0A%0A`;
    });

    message += `──────────────────%0A*GRAND TOTAL: $${total.toFixed(2)}*`;
    
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappURL, '_blank');
}