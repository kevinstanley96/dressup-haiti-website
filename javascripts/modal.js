// javascripts/modal.js

// 🛑 CRITICAL FIX: Properly wrapped in an IIFE to prevent global scope pollution.
(function() {

  const productModal = document.getElementById('product-modal');
  const modalAddCartBtn = document.querySelector('.modal-add-cart');
  const modalCloseBtns = document.querySelectorAll('.circle-close-btn');
  const modalActions = document.querySelector('.modal-actions');
  
  // NOTE: Elements inside the modal (like modal-product-img) are accessed on open.


  // ---- Modal Open/Close Functions ----

  // Expose globally so other files (product-cards.js) can use them.
  window.openModal = function() {
    if (!productModal) return;
    productModal.style.display = 'flex';
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  };

  function closeModal() {
    if (!productModal) return;
    productModal.style.display = 'none';
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
  }

  // ---- Modal Data Filling Logic (Called on Product Card Click) ----
  
  // 🛑 FIX 1: Attach to DOMContentLoaded to ensure elements like modal-product-name exist.
  document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Product Card Click Listener (Opens Modal) ---
    document.addEventListener('click', function(e) {
      const card = e.target.closest('.product-card');
      
      // Check if click originated from a product card, but not one of the controls
      if (
        card && (
          e.target.closest('.product-img-wrapper') ||
          e.target === card
        ) && !e.target.closest('.product-controls-wrapper') // 🛑 FIX 2: Ignore clicks on new controls
      ) {
        // Data extraction is now safer with optional chaining
        const img = card.querySelector('img')?.src;
        const name = card.querySelector('.scrolling-text')?.textContent;
        const priceEl = card.querySelector('.product-price');
        const priceUsd = priceEl?.dataset.usd;
        const price = priceEl?.textContent;
        const oldPrice = card.querySelector('.product-old-price')?.textContent;
        const features = Array.from(card.querySelectorAll('.product-feature')).map(f => f.textContent);

        // Fill modal
        document.getElementById('modal-product-img').src = img;
        document.getElementById('modal-product-img').alt = name;
        document.getElementById('modal-product-name').textContent = name;
        
        // 🛑 CRITICAL FIX: Store product name on the actions div for the control listeners
        if (modalActions) modalActions.dataset.productName = name; 

        const modalPriceEl = document.getElementById('modal-product-price');
        if (modalPriceEl) {
            modalPriceEl.textContent = price;
            if (priceUsd) modalPriceEl.dataset.usd = priceUsd;
        }

        document.getElementById('modal-product-old-price').textContent = oldPrice;

        const featuresHtml = features.map(tag =>
          `<span class="product-feature">${tag}</span>`
        ).join("");
        document.getElementById('modal-product-features').innerHTML = featuresHtml;

        // Call openModal and sync controls
        if (typeof window.openModal === 'function' && typeof window.updateProductControls === 'function') {
            window.openModal();
            window.updateProductControls(name); // Sync modal controls on open
        }
      }
    });

    // --- 2. Close Modal Listeners ---
    
    // Close Modal on any close button
    modalCloseBtns.forEach(btn => btn.addEventListener('click', closeModal));

    // Also close modal if clicking on the overlay (outside modal-content)
    if (productModal) {
      productModal.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
      });
    }

    // --- 3. Modal Buttons Listeners ---
    
    // 🛑 FIX 3: Add to Cart button logic (Static button)
    if (modalAddCartBtn) {
        modalAddCartBtn.addEventListener('click', function() {
          const name = modalActions?.dataset.productName;
          const img = document.getElementById('modal-product-img')?.src;
          const price = document.getElementById('modal-product-price')?.dataset.usd;

          if (img && name && price && typeof window.addProductToCart === 'function') {
              window.addProductToCart({ img, name, price });
              // Close modal for immediate feedback
              closeModal(); 
          }
        });
    }

    // 🛑 FIX 4: Modal Quantity Controls Listener (New Feature)
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            const qtyBtn = e.target.closest('.modal-qty-controls .cart-qty-btn');
            if (!qtyBtn) return;
            
            if (typeof window.modifyCartQuantity === 'function') {
                const name = modalActions?.dataset.productName;
                const action = qtyBtn.classList.contains('cart-qty-plus') ? 'plus' : 'minus';

                if (name) window.modifyCartQuantity(name, action);
                // Sync happens inside modifyCartQuantity
            }
        });
    }
    
    // 🛑 FIX 5: Buy Now button listener (Optional logic)
    const modalBuyNowBtn = document.querySelector('.modal-buy-now');
    if (modalBuyNowBtn) {
        modalBuyNowBtn.addEventListener('click', function() {
            // For simplicity, let's make Buy Now behave like Add to Cart + Open Checkout
            const name = modalActions?.dataset.productName;
            const img = document.getElementById('modal-product-img')?.src;
            const price = document.getElementById('modal-product-price')?.dataset.usd;

            if (img && name && price && typeof window.addProductToCart === 'function') {
                window.addProductToCart({ img, name, price });
                window.location.href = 'checkout.html';
            }
        });
    }
  });
})();