// cart-panel.js

// 🛑 CRITICAL FIX: The entire script is correctly wrapped in an IIFE.
(function() {
  
  // ---- Cart State ----
  let cart = [];

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
  const getSymbol = () => (typeof currency !== 'undefined' && currency.symbol) ? currency.symbol : '$';
  const convertPrice = (p) => (typeof window.convertPrice === 'function') ? window.convertPrice(p) : Number(p).toFixed(2);


  // ---- New Feature Logic: State Synchronization ----
  
  function updateProductControls(productName) {
      const cartItem = cart.find(item => item.name === productName);
      const qty = cartItem ? cartItem.quantity : 0;
      
      // --- Update All Product Cards ---
      document.querySelectorAll('.product-card').forEach(card => {
          const cardName = card.querySelector('.scrolling-text')?.textContent;
          if (cardName === productName) {
              const cardQtyWrapper = card.querySelector('.product-qty-controls');
              const cardAddBtn = card.querySelector('.product-cart-btn');
              const cardQtyDisplay = card.querySelector('[data-qty-display]');

              if (qty > 0) {
                  if (cardQtyDisplay) cardQtyDisplay.textContent = qty;
                  if (cardQtyWrapper) cardQtyWrapper.classList.remove('hidden');
                  if (cardAddBtn) cardAddBtn.classList.add('hidden');
              } else {
                  if (cardQtyWrapper) cardQtyWrapper.classList.add('hidden');
                  if (cardAddBtn) cardAddBtn.classList.remove('hidden');
              }
          }
      });
      
      // --- Update Modal Controls (if visible) ---
      const modalNameEl = document.getElementById('modal-product-name');
      if (modalNameEl && modalNameEl.textContent === productName) {
          const modalQtyWrapper = document.getElementById('modal-qty-controls');
          const modalAddBtn = document.querySelector('.modal-add-cart');
          
          if (qty > 0) {
              if (modalQtyWrapper) modalQtyWrapper.classList.remove('hidden');
              if (modalAddBtn) modalAddBtn.classList.add('hidden');
              if (modalQtyWrapper) modalQtyWrapper.querySelector('[data-modal-qty-display]').textContent = qty;
          } else {
              if (modalQtyWrapper) modalQtyWrapper.classList.add('hidden');
              if (modalAddBtn) modalAddBtn.classList.remove('hidden');
          }
      }
  }

  // 🛑 NEW FUNCTION: Called on page load/product load to sync all items
  window.syncAllProductControls = function() {
      const names = new Set();
      document.querySelectorAll('.product-card').forEach(card => {
          const name = card.querySelector('.scrolling-text')?.textContent;
          if (name) names.add(name);
      });
      names.forEach(name => updateProductControls(name));
  };
  
  // 🛑 NEW FUNCTION: Handles + and - clicks from product cards/modal
  window.modifyCartQuantity = function(productName, action) {
      const existingItem = cart.find(item => item.name === productName);
      if (!existingItem) return;

      if (action === 'plus') {
          existingItem.quantity++;
      } else if (action === 'minus') {
          existingItem.quantity--;
      }

      if (existingItem.quantity <= 0) {
          const index = cart.indexOf(existingItem);
          cart.splice(index, 1);
      }
      
      window.renderCartItems();
      saveCartToLocalStorage();
      updateProductControls(productName); // Sync external controls
  };


  // ---- Global Expositions & Functions ----
  
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

  window.addProductToCart = function({ img, name, price }) { 
    const product = { img, name, price };
    
    const existingItem = cart.find(item => item.name === name && item.img === img);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ img, name, price, quantity: 1 });
    }
    
    window.renderCartItems();
    saveCartToLocalStorage();
    
    updateProductControls(name); 
  };


  // ---- DOMContentLoaded Wrapper for all listeners and initial calls ----
  // 🛑 FIX: This is the primary DOMContentLoaded wrapper. No nesting!
  document.addEventListener("DOMContentLoaded", function() {

    // --- DOM ELEMENT SETUP ---
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartHeaderBtn = document.getElementById('cart-header-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    // --- Attach Open/Close Listeners ---
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartPanel);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartPanel);
    if (cartHeaderBtn) cartHeaderBtn.addEventListener('click', openCartPanel);

    // --- Handle quantity changes and removal ---
    if (cartItemsContainer) {
      cartItemsContainer.addEventListener('click', function (e) {
        const itemEl = e.target.closest('.cart-item');
        if (!itemEl) return;

        const index = Number(itemEl.dataset.index);
        if (isNaN(index) || index >= cart.length) return;

        let cartChanged = false;
        const productName = cart[index].name;

        if (e.target.classList.contains('cart-qty-minus')) {
          cart[index].quantity--;
          if (cart[index].quantity <= 0) cart.splice(index, 1);
          cartChanged = true;
        } else if (e.target.classList.contains('cart-qty-plus')) {
          cart[index].quantity++;
          cartChanged = true;
        } else if (e.target.closest('.cart-remove-btn')) {
          cart.splice(index, 1);
          cartChanged = true;
        } 
        
        if (cartChanged) {
          window.renderCartItems();
          saveCartToLocalStorage();
          updateProductControls(productName); 
        }
      });
    }

    // --- Checkout Button ---
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function () {
        if (cart.length > 0) {
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
// 🛑 CRITICAL FIX: The closing IIFE syntax.
})();