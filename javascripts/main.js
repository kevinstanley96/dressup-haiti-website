// javascripts/main.js

// Define global currencyOptions here (CRITICAL FIX: Needed by currency.js)
const currencyOptions = [
  { code: 'USD', label: 'USD', symbol: '$', flag: '🇺🇸', icon: 'assets/icons/american-flag.svg', rate: 1 },
  { code: 'CAD', label: 'CAD', symbol: '$', flag: '🇨🇦', icon: 'assets/icons/canada-flag.svg', rate: 1.32 },
  { code: 'EUR', label: 'EUR', symbol: '€', flag: '🇪🇺', icon: 'assets/icons/europe-flag.svg', rate: 0.92 },
  { code: 'HTG', label: 'HTG', symbol: 'G', flag: '🇭🇹', icon: 'assets/icons/haitian-flag.svg', rate: 132.45 },
  { code: 'DOP', label: 'DOP', symbol: 'RD$', flag: '🇩🇴', icon: 'assets/icons/dominican-flag.svg', rate: 58.75 }
];

document.addEventListener("DOMContentLoaded", function () {
  // Menu logic previously here has been removed (moved to menu-panel.js)
  
  // Add any future global initialization code here
});