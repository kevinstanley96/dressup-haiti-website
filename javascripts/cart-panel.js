// cart-panel.js

// 🧩 Entire script wrapped in an IIFE for isolation
(function() {

  // ---- Cart State ----
  let cart = [];

  // Load from localStorage
  const cartData = localStorage.getItem('cart');
  if (cartData) {
    try {
      cart = JSON.parse(cartData) || [];
    } catch {
      cart = [];
    }
  }

  function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // ---- Cart Panel Open/Close ----
  window.openCartPanel = function() {
    document.getElementById('cart-panel').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
    document.body.classList.add('cart-open');
    document.documentElement.classList.add('cart-open');
  };

  window.closeCartPanel = function() {
    document.getElementById('cart-panel').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
    document.body.classList.remove('cart-open');
    document.documentElement.classList.remove('cart-open');
  };

  // ---- Cart Badge ----
  window.updateCartBadge = function() {
    const badge = document.getElementById('cart-badge');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (badge) {
      badge.textContent = count > 0 ? count : '';
      badge.classList.toggle('active', count > 0);
    }
  };

  // ---- Render Cart Items ----
  window.renderCartItems = function() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total-price');
    const cartEmptyEl = document.getElementById('cart-empty');

    if (!cartItemsContainer || !cartTotalEl || !cartEmptyEl) return;

    if (cart.length === 0) {
      cartItemsContainer.style.display = 'none';
      cartEmptyEl.style.display = 'block';
      cartTotalEl.textContent = '$0.00';
      window.updateCartBadge();
      return;
    }

    cartItemsContainer.style.display = 'block';
    cartEmptyEl.style.display = 'none';

    let total = 0;
    const symbol = (typeof currency !== 'undefined' && currency.symbol) ? currency.symbol : '$';
    const convert = (typeof convertPrice === 'function') ? convertPrice : (p) => Number(p).toFixed(2);

    const html = cart.map((item, index) => {
      const itemPrice = Number(item.price);
      const itemTotal = itemPrice * item.quantity;
      total += itemTotal;
      const displayedPrice = symbol + convert(itemPrice);

      return `
        <div class="cart-item" data-index="${index}">
          <img src="${item.img}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <strong class="cart-item-name">${item.name}</strong>
            <div class="cart-item-price" data-usd="${item.price}">${displayedPrice}</div>
            <div class="cart-item-qty-controls">
              <button class="cart-qty-btn cart-qty-minus">-</button>
              <span class="cart-item-qty">${item.quantity}</span>
              <button class="cart-qty-btn cart-qty-plus">+</button>
              <button class="cart-remove-btn" aria-label="Remove item">
                <img src="assets/icons/trash.svg" alt="Remove">
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    cartItemsContainer.innerHTML = html;
    cartTotalEl.textContent = symbol + convert(total);
    window.updateCartBadge();
  };

  // ---- Add Item Logic ----
  function _addItemToCart(product) {
    const existingItem = cart.find(item => item.name === product.name && item.img === product.img);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCartToLocalStorage();
    window.renderCartItems();
  }

  function _showAddedToCartFeedback(btn) {
    btn.classList.add('added');
    setTimeout(() => btn.classList.remove('added'), 1200);
  }

  // Used by product-cards.js and modal.js
  window.addProductToCart = function({ img, name, price }) {
    const product = { img, name, price };
    _addItemToCart(product);

    document.querySelectorAll('.product-card').forEach(card => {
      const cardName = card.querySelector('.scrolling-text')?.textContent;
      const cardImg = card.querySelector('.product-img-wrapper img')?.src;
      if (cardName === name && cardImg === img) {
        const cartBtn = card.querySelector('.product-cart-btn');
        if (cartBtn) _showAddedToCartFeedback(cartBtn);
      }
    });
  };

  // ---- DOMContentLoaded ----
  document.addEventListener("DOMContentLoaded", function() {
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartHeaderBtn = document.getElementById('cart-header-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    // Panel open/close
    if (cartOverlay) cartOverlay.addEventListener('click', window.closeCartPanel);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', window.closeCartPanel);
    if (cartHeaderBtn) cartHeaderBtn.addEventListener('click', window.openCartPanel);

    // ---- Cart Interaction ----
    if (cartItemsContainer) {
      cartItemsContainer.addEventListener('click', function(e) {
        const btnMinus = e.target.closest('.cart-qty-minus');
        const btnPlus = e.target.closest('.cart-qty-plus');
        const btnRemove = e.target.closest('.cart-remove-btn');
        const itemEl = e.target.closest('.cart-item');
        if (!itemEl) return;

        const index = Number(itemEl.dataset.index);
        if (isNaN(index) || index < 0 || index >= cart.length) return;

        let cartChanged = false;

        if (btnMinus) {
          cart[index].quantity--;
          if (cart[index].quantity <= 0) cart.splice(index, 1);
          cartChanged = true;
        } else if (btnPlus) {
          cart[index].quantity++;
          cartChanged = true;
        } else if (btnRemove) {
          cart.splice(index, 1);
          cartChanged = true;
        }

        if (cartChanged) {
          saveCartToLocalStorage();
          window.renderCartItems();
          window.updateCartBadge();
        }
      });
    }

    // Checkout
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        if (cart.length > 0) {
          window.location.href = 'checkout.html';
        } else {
          alert("Your cart is empty!");
        }
      });
    }

    // Initial render
    window.updateCartBadge();
    window.renderCartItems();
  });

  // Optional: sync if localStorage changes (multi-tab safety)
  window.addEventListener('storage', function() {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = stored;
    window.renderCartItems();
    window.updateCartBadge();
  });

})(); 
