const currencyOptions = [
  { code: 'USD', label: 'USD', symbol: '$', flag: '🇺🇸', icon: 'assets/icons/american-flag.svg', rate: 1 },
  { code: 'CAD', label: 'CAD', symbol: '$', flag: '🇨🇦', icon: 'assets/icons/canada-flag.svg', rate: 1.32 },
  { code: 'EUR', label: 'EUR', symbol: '€', flag: '🇪🇺', icon: 'assets/icons/europe-flag.svg', rate: 0.92 },
  { code: 'HTG', label: 'HTG', symbol: 'G', flag: '🇭🇹', icon: 'assets/icons/haitian-flag.svg', rate: 132.45 },
  { code: 'DOP', label: 'DOP', symbol: 'RD$', flag: '🇩🇴', icon: 'assets/icons/dominican-flag.svg', rate: 59.0 }
];

// --- Currency Switcher State ---

// NOTE: You need to define 'currencyOptions' globally or import it here.
// Assuming 'currencyOptions' structure is [{ code: 'USD', rate: 1, symbol: '$', flag: '🇺🇸', icon: 'assets/icons/american-flag.svg', label: 'USD' }, ...]
// If currencyOptions is not defined, this script will fail.

let currency = currencyOptions[0]; // Default USD

// Load saved currency from localStorage
const savedCurrencyCode = localStorage.getItem('currency');
if (savedCurrencyCode) {
    const found = currencyOptions.find(opt => opt.code === savedCurrencyCode);
    if (found) currency = found;
}
updateCurrencyIcon(); // Initialize icon based on loaded or default currency

// Render currency panel
function renderCurrencyPanel() {
    const list = document.getElementById('currency-list');
    if (!list) return; // Added check for safety
    
    list.innerHTML = '';
    currencyOptions.forEach(opt => {
        const li = document.createElement('li');
        li.className = opt.code === currency.code ? 'selected' : '';
        // Use a button for better accessibility/semantic meaning, though li is fine.
        li.innerHTML = `<span class="flag">${opt.flag}</span> ${opt.label} <span style="margin-left:auto">${opt.symbol}</span>`;
        li.addEventListener('click', function() {
            selectCurrency(opt.code);
        });
        list.appendChild(li);
    });
}

// Show/hide dropdown
const currencyBtn = document.getElementById('currency-btn');
const currencyPanel = document.getElementById('currency-panel');

if (currencyBtn && currencyPanel) { // Safety check
    currencyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currencyPanel.classList.toggle('open');
        renderCurrencyPanel(); // Render when opening to ensure state is fresh
    });
    // Close panel when clicking anywhere else
    document.addEventListener('click', function() {
        currencyPanel.classList.remove('open');
    });
}

// Select currency and update
function selectCurrency(code) {
    const found = currencyOptions.find(opt => opt.code === code);
    if (found) {
        currency = found;
        localStorage.setItem('currency', currency.code);
        
        renderCurrencyPanel();
        updateAllPrices();
        updateCurrencyIcon();
        currencyPanel.classList.remove('open');

        // ✅ THE ESSENTIAL CORRECTION: Dispatch a custom event
        document.dispatchEvent(new Event('currencyChange')); 
    }
}

// --- Update All Prices Sitewide ---
function convertPrice(priceInUSD) {
    // Accepts a string or number
    let price = typeof priceInUSD === "string" ? parseFloat(priceInUSD) : priceInUSD;
    // Check for NaN or invalid price before multiplication
    if (isNaN(price)) return '0.00'; 
    return (price * currency.rate).toFixed(2);
}

// NOTE: This function relies on 'renderCartItems()' being defined in 'cart-panel.js' or globally.
function updateAllPrices() {
    // Product cards
    document.querySelectorAll('.product-card').forEach(card => {
        const priceEl = card.querySelector('.product-price');
        const oldPriceEl = card.querySelector('.product-old-price');
        
        if (priceEl && priceEl.dataset.usd) {
            priceEl.textContent = currency.symbol + convertPrice(priceEl.dataset.usd);
        }
        // Added safety check for old price element's existence
        if (oldPriceEl && oldPriceEl.dataset.usd) { 
            oldPriceEl.textContent = currency.symbol + convertPrice(oldPriceEl.dataset.usd);
        } else if (oldPriceEl) {
            // Clear old price if no USD data exists
            oldPriceEl.textContent = ''; 
        }
    });
    
    // Cart panel - assumes global or accessible definition
    if (typeof renderCartItems === 'function') {
      renderCartItems(); 
    } else {
      console.warn("renderCartItems() function is not available.");
    }
}

// --- Ensure prices have data-usd on load (do this after rendering product cards!) ---
function annotateProductPrices() {
    document.querySelectorAll('.product-card').forEach(card => {
        const priceEl = card.querySelector('.product-price');
        const oldPriceEl = card.querySelector('.product-old-price');
        
        if (priceEl && !priceEl.dataset.usd) {
            // Remove symbol if present, save number
            priceEl.dataset.usd = priceEl.textContent.replace(/[^0-9.]/g, '');
        }
        if (oldPriceEl && !oldPriceEl.dataset.usd) {
            oldPriceEl.dataset.usd = oldPriceEl.textContent.replace(/[^0-9.]/g, '');
        }
    });
}

function updateCurrencyIcon() {
    const iconEl = document.getElementById('currency-icon');
    // Ensure both elements and the icon property exist
    if (iconEl && currency.icon) { 
        iconEl.src = currency.icon;
        iconEl.alt = currency.label + ' flag';
    }
}