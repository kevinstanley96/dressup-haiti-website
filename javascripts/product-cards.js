// product-cards.js

// Card generator
function createProductCard(product) {
  // Ensure price values are numbers before toFixed
  const price = `$${parseFloat(product.price).toFixed(2)}`;
  const oldPrice = `$${parseFloat(product.oldPrice).toFixed(2)}`;

  const featuresHtml = product.tags.map(tag =>
    `<span class="product-feature">${tag}</span>`
  ).join("");

  // 🛑 NEW HTML STRUCTURE: Added controls wrapper with Add button and Qty buttons
  return `
  <div class="product-card" data-product-name="${product.name}">
    <div class="product-img-wrapper">
      <img src="${product.img}" alt="${product.name}">
    </div>
    <div class="product-features-row">
      ${featuresHtml}
    </div>
    <div class="product-info-row">
      <div class="info-main">
        <div class="product-name-scroll">
          <span class="scrolling-text">${product.name}</span>
        </div>
        <div class="product-price-row">
          <span class="product-price" data-usd="${product.price}">${price}</span>
          <span class="product-old-price">${oldPrice}</span>
        </div>
      </div>
      
      <div class="product-controls-wrapper">
        <button class="product-cart-btn state-add" aria-label="Add ${product.name} to cart">
          <img src="assets/icons/cart-128.svg" alt="Add to cart">
        </button>

        <div class="product-qty-controls state-qty hidden">
          <button class="cart-qty-btn cart-qty-minus">-</button>
          <span class="cart-item-qty" data-qty-display>0</span>
          <button class="cart-qty-btn cart-qty-plus">+</button>
        </div>
      </div>
      
    </div>
  </div>
`;
}

// 🛑 NEW FUNCTION: Attaches the click listener for both Add and +/- actions
function attachProductCardListeners(container) {
  if (!container) return;

  container.addEventListener('click', function(e) {
    const cartBtn = e.target.closest('.product-cart-btn');
    const qtyBtn = e.target.closest('.product-qty-controls .cart-qty-btn');
    const card = e.target.closest('.product-card');

    if (!card) return;
    const productName = card.querySelector('.scrolling-text')?.textContent;

    // --- 1. Handle "Add to Cart" Button Click ---
    if (cartBtn) {
      const img = card.querySelector('.product-img-wrapper img')?.src;
      const price = card.querySelector('.product-price')?.dataset.usd;

      if (img && productName && price && typeof addProductToCart === 'function') {
        // Add product and update controls (now done inside addProductToCart)
        addProductToCart({ img, name: productName, price });
      }
    } 
    
    // --- 2. Handle +/- Button Click ---
    else if (qtyBtn) {
      if (typeof modifyCartQuantity === 'function') {
        const action = qtyBtn.classList.contains('cart-qty-plus') ? 'plus' : 'minus';
        
        // Find the specific item in the cart using its name and modify quantity
        modifyCartQuantity(productName, action);
      }
    }
  });
}

// Load products from JSON and insert + trigger scrolling effect
function loadProducts(jsonUrl, containerId) {
  const dataPath = jsonUrl; 

  fetch(dataPath)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch JSON file: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(products => {
      const container = document.getElementById(containerId);
      if (!container) return; 

      const html = products.map(createProductCard).join("");
      container.innerHTML = html;

      if (typeof initProductNameScroll === 'function') {
        initProductNameScroll();
      }

      if (typeof annotateProductPrices === 'function') {
        annotateProductPrices();
      }
      if (typeof updateAllPrices === 'function') {
        updateAllPrices();
      }
      
      // 🛑 CRITICAL FIX 1: Attach the click listener for ALL products
      attachProductCardListeners(container);
      
      // 🛑 CRITICAL FIX 2: Sync controls with current cart state immediately
      if (typeof syncAllProductControls === 'function') {
          syncAllProductControls();
      }
    })
    .catch((err) => {
      console.error('Error loading products:', err);
      const container = document.getElementById(containerId);
      if (container) {
          container.innerHTML = 
            "<p style='padding:1em;color:#c44;'>Could not load products. Please check the JSON path.</p>";
      }
    });
}

// Auto-scroll for product names (function definition omitted for brevity, assume it is present)
function initProductNameScroll() {
    // ... existing initProductNameScroll code ...
}