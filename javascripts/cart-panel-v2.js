// javascripts/cart-panel-v2.js

// 🛑 FULLY REBUILT AND ROBUST CART LOGIC (Self-Contained IIFE) 🛑
(function() {
  
  // ---- Cart State ----
  let cart = [];

  // Load cart from localStorage
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
  
  // --- Dependency Utility Functions ---
  // Ensure the global functions required by renderCartItems are defined safely.
  const getSymbol = () => (typeof currency !== 'undefined' && currency.symbol) ? currency.symbol : '$';
  const convertPrice = (p) => (typeof window.convertPrice === 'function') ? window.convertPrice(p) : Number(p).toFixed(2);


  // ---- Global Functions (Exposed to window) ----
  
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

  window.updateCartBadge = function() {
    const badge = document.getElementById('cart-badge');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (badge) {
      badge.textContent = count > 0 ? count : ''; 
      if (count === 0) {
        badge.classList.remove('active');
      } else {
        badge.classList.add('active');
      }
    }
  };

  // 🛑 GLOBAL: Function to render the cart HTML (called by currency.js, checkout.js, etc.)
  window.renderCartItems = function() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total-price');
    const cartEmptyEl = document.getElementById('cart-empty');
    
    if (!cartItemsContainer || !cartTotalEl || !cartEmptyEl) return;

    if (cart.length === 0) {
      cartItemsContainer.style.display = 'none';
      cartEmptyEl.style.display = 'block';
      cartTotalEl.textContent = `${getSymbol()}0.00`;
      window.updateCartBadge();
      return;
    }

    cartItemsContainer.style.display = 'block';
    cartEmptyEl.style.display = 'none';

    let total = 0;
    
    const html = cart.map((item, index) => {
      const itemPrice = Number(item.price);
      const itemTotal = itemPrice * item.quantity;
      total += itemTotal;
      
      const displayedPrice = getSymbol() + convertPrice(itemPrice);
      
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
    cartTotalEl.textContent = getSymbol() + convertPrice(total);

    window.updateCartBadge();
  };

  // 🛑 GLOBAL: Function to add a product (called by modal.js and product-cards.js)
  window.addProductToCart = function({ img, name, price }) { 
    const existingItem = cart.find(item => item.name === name && item.img === img);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ img, name, price, quantity: 1 });
    }

    window.renderCartItems();
    saveCartToLocalStorage();

    // Show feedback on product cards
    document.querySelectorAll('.product-card').forEach(card => {
      const cardName = card.querySelector('.scrolling-text')?.textContent;
      const cardImg = card.querySelector('.product-img-wrapper img')?.src;
      
      if (cardName === name && cardImg === img) {
        const cartBtn = card.querySelector('.product-cart-btn');
        if (cartBtn) {
          cartBtn.classList.add('added');
          setTimeout(() => { cartBtn.classList.remove('added'); }, 1200);
        }
      }
    });
  };

  // ---- DOMContentLoaded Wrapper for all listeners and initial calls ----
  document.addEventListener("DOMContentLoaded", function() {

    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartHeaderBtn = document.getElementById('cart-header-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    // Attach Open/Close Listeners
    if (cartOverlay) cartOverlay.addEventListener('click', window.closeCartPanel);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', window.closeCartPanel);
    if (cartHeaderBtn) cartHeaderBtn.addEventListener('click', window.openCartPanel);

    // --- Handle quantity changes and removal ---
    if (cartItemsContainer) {
      cartItemsContainer.addEventListener('click', function (e) {
        const itemEl = e.target.closest('.cart-item');
        if (!itemEl) return;

        const index = Number(itemEl.dataset.index);
        if (isNaN(index) || index >= cart.length) return;

        let cartChanged = false;

        if (e.target.classList.contains('cart-qty-minus')) {
          cart[index].quantity--;
          if (cart[index].quantity <= 0) cart.splice(index, 1);
          cartChanged = true;
        } else if (e.target.classList.contains('cart-qty-plus')) {
          cart[index].quantity++;
          cartChanged = true;
        } else if (
          e.target.classList.contains('cart-remove-btn') ||
          e.target.closest('.cart-remove-btn')
        ) {
          cart.splice(index, 1);
          cartChanged = true;
        } 
        
        // 🛑 FIX: Guaranteed re-render and save after any change
        if (cartChanged) {
          window.renderCartItems(); 
          saveCartToLocalStorage();
        }
      });
    }

    // --- Handle checkout button click ---
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function () {
        if (cart.length > 0) {
          // 🛑 FIX: Skip closeCartPanel() to guarantee redirect
          window.location.href = 'checkout.html';
        } else {
          alert("Your cart is empty!");
        }
      });
    }
    
    // Initial calls
    window.updateCartBadge();
    window.renderCartItems(); 
  });
})();