// Open Modal: Attach to images and product card bodies
document.addEventListener('click', function(e) {
  const card = e.target.closest('.product-card');
  if (
    card && (
      e.target.classList.contains('product-img-wrapper') ||
      e.target.closest('.product-img-wrapper') ||
      e.target === card
    )
  ) {
    // Get product info from card (adapt as needed)
    const img = card.querySelector('img').src;
    const name = card.querySelector('.scrolling-text').textContent;
    const priceEl = card.querySelector('.product-price');
    const price = priceEl.textContent;
    const priceUsd = priceEl.dataset.usd;
    const oldPrice = card.querySelector('.product-old-price').textContent;
    const features = Array.from(card.querySelectorAll('.product-feature')).map(f => f.textContent);

    // Fill modal
    document.getElementById('modal-product-img').src = img;
    document.getElementById('modal-product-img').alt = name;
    document.getElementById('modal-product-name').textContent = name;

    const modalPriceEl = document.getElementById('modal-product-price');
    modalPriceEl.textContent = price;
    if (priceUsd) modalPriceEl.dataset.usd = priceUsd; // Ensure base price is carried to modal

    document.getElementById('modal-product-old-price').textContent = oldPrice;

    const featuresHtml = features.map(f => `<span class="product-feature">${f}</span>`).join('');
    document.getElementById('modal-product-features').innerHTML = featuresHtml;

    // NOW CALL openModal
    openModal();
  }
});

// Define openModal OUTSIDE the event listener
function openModal() {
  document.getElementById('product-modal').style.display = 'flex';
  document.body.classList.add('modal-open');
  document.documentElement.classList.add('modal-open');
}

// Close Modal on any .circle-close-btn (in case of multiple modals/close buttons)
document.addEventListener('click', function(e) {
  if (e.target.closest('.circle-close-btn')) {
    closeModal();
  }
});

// Also close modal if clicking on the overlay (outside modal-content)
document.getElementById('product-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

function closeModal() {
  document.getElementById('product-modal').style.display = 'none';
  document.body.classList.remove('modal-open');
  document.documentElement.classList.remove('modal-open');
}

// Modal Buttons
document.querySelector('.modal-add-cart').addEventListener('click', function() {
  // Get product info from modal
  const img = document.getElementById('modal-product-img').src;
  const name = document.getElementById('modal-product-name').textContent;
  const price = document.getElementById('modal-product-price').dataset.usd || document.getElementById('modal-product-price').textContent.replace('$','');

  // Reuse the existing add-to-cart logic from cart-panel.js
  addProductToCart({ img, name, price });
  closeModal();
});
