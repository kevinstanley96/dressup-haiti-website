// product-cards.js

// Card generator
function createProductCard(product) {
  // Ensure price values are numbers before toFixed, though parseFloat is already used
  const price = `$${parseFloat(product.price).toFixed(2)}`;
  const oldPrice = `$${parseFloat(product.oldPrice).toFixed(2)}`;

  // Features/tags as buttons
  const featuresHtml = product.tags.map(tag =>
    `<span class="product-feature">${tag}</span>`
  ).join("");

  // Product card HTML, including name scroll wrapper and an accessibility enhancement
  return `
  <div class="product-card">
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
      <button class="product-cart-btn" aria-label="Add ${product.name} to cart">
        <img src="assets/icons/cart-128.svg" alt="Add to cart">
      </button>
    </div>
  </div>
`;
}

// 🛑 NEW FUNCTION: Attaches the click listener to handle the "Add to Cart" button on the card itself.
function attachProductCardListeners(container) {
  if (!container) return;

  container.addEventListener('click', function(e) {
    const cartBtn = e.target.closest('.product-cart-btn');
    if (!cartBtn) return;
    
    // Find the parent product card
    const card = cartBtn.closest('.product-card');
    if (!card) return;

    // Extract necessary data from the card to call the global cart function
    const img = card.querySelector('.product-img-wrapper img')?.src;
    const name = card.querySelector('.scrolling-text')?.textContent;
    const price = card.querySelector('.product-price')?.dataset.usd;

    // Safety check and call the global function defined in cart-panel.js
    if (img && name && price && typeof addProductToCart === 'function') {
      addProductToCart({ img, name, price });
      // Open the cart panel for immediate feedback (optional)
      if (typeof openCartPanel === 'function') {
        openCartPanel();
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

      // Conditional execution for external dependencies
      if (typeof initProductNameScroll === 'function') {
        initProductNameScroll(); // After DOM is updated
      }

      if (typeof handleProductsFn === "function") {
        handleProductsFn(products);
      }

      if (typeof annotateProductPrices === 'function') {
        annotateProductPrices();
      }
      if (typeof updateAllPrices === 'function') {
        updateAllPrices();
      }
      
      // 🛑 CRITICAL FIX: Attach the click listener to the newly rendered products
      attachProductCardListeners(container);
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

// Auto-scroll for product names
function initProductNameScroll() {
  document.querySelectorAll('.product-name-scroll').forEach(container => {
    const text = container.querySelector('.scrolling-text');
    if (!text) return;

    // Reset scroll
    text.style.transition = '';
    text.style.transform = 'translateX(0)';
    
    // We execute immediately as the function is called after DOM update.
    const containerWidth = container.offsetWidth;
    const textWidth = text.scrollWidth;

    if (textWidth > containerWidth) {
      // Scroll only if overflow
      const scrollDistance = textWidth - containerWidth + 12;
      const duration = (scrollDistance / 30); // 30px per second

      function startScroll() {
        text.style.transition = `transform ${duration}s linear`;
        text.style.transform = `translateX(-${scrollDistance}px)`;
      }

      function resetScroll() {
        text.style.transition = '';
        text.style.transform = `translateX(0)`;
      }

      let running = false;
      function loopScroll() {
        if (running) return;
        running = true;
        setTimeout(() => {
          startScroll();
          // Use a named function for the event listener so it can be reliably removed
          function handler() {
            setTimeout(() => {
              resetScroll();
              running = false;
              setTimeout(loopScroll, 1200); // wait and repeat
            }, 1200);
            text.removeEventListener('transitionend', handler);
          }
          text.addEventListener('transitionend', handler);
        }, 5000); // Initial 5s wait
      }

      loopScroll();
    }
  });
}