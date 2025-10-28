let allProducts = [];
let categories = [];
let currentFilter = "All";
let recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");

// --- DOM References ---
const searchPanel = document.getElementById('search-panel');
const searchOverlay = document.getElementById('search-panel-overlay');
const searchInput = document.getElementById('search-input');
const searchCloseBtn = document.getElementById('search-close-btn');
const searchClearBtn = document.getElementById('search-clear-btn');
const searchSuggestions = document.getElementById('search-suggestions');
const searchFilters = document.getElementById('search-filters');
const searchRecent = document.getElementById('search-recent');
const searchBtn = document.getElementById('search-btn');

// --- Utility: Build a search string from all main fields ---
function getProductSearchString(prod) {
  return [
    prod.length || "",
    prod.lace_type || "",
    prod.hair_type || "",
    prod.category || "",
    prod.tags ? prod.tags.join(" ") : ""
  ].join(" ").toLowerCase();
}

// --- Utility: Display product "name" as all fields joined ---
function getProductDisplayName(prod) {
  return [prod.length, prod.lace_type, prod.hair_type].filter(Boolean).join(" ");
}

// --- Load Products for Search ---
fetch('assets/json/all_products.json')
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    categories = ["All", ...new Set(allProducts.map(p => p.category).filter(Boolean))];
    renderFilters();
  });

// --- Open/Close Search ---
if (searchBtn)   searchBtn.addEventListener('click', openSearchPanel);
if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearchPanel);
if (searchOverlay)  searchOverlay.addEventListener('click', closeSearchPanel);

document.addEventListener('keydown', (e) => { 
  if (e.key === 'Escape') closeSearchPanel(); 
});

function openSearchPanel() {
  if (searchPanel) searchPanel.classList.add('active');
  if (searchOverlay) searchOverlay.classList.add('active');
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
    renderRecentSearches();
    renderSuggestions();
  }
}
function closeSearchPanel() {
  if (searchPanel) searchPanel.classList.remove('active');
  if (searchOverlay) searchOverlay.classList.remove('active');
  if (searchInput) searchInput.value = '';
  if (searchSuggestions) searchSuggestions.innerHTML = '';
}

// --- Live Suggestions ---
if (searchInput) {
  searchInput.addEventListener('input', renderSuggestions);
  searchInput.addEventListener('keydown', function(e) {
    let items = Array.from((searchSuggestions || document).querySelectorAll('.suggestion-item'));
    if (!items.length) return;
    let sel = items.findIndex(el => el.classList.contains('selected'));
    if (e.key === "ArrowDown") {
      if (sel >= 0) items[sel].classList.remove('selected');
      sel = (sel + 1) % items.length;
      items[sel].classList.add('selected');
      e.preventDefault();
    }
    if (e.key === "ArrowUp") {
      if (sel >= 0) items[sel].classList.remove('selected');
      sel = (sel - 1 + items.length) % items.length;
      items[sel].classList.add('selected');
      e.preventDefault();
    }
    if (e.key === "Enter" && sel >= 0) {
      items[sel].click();
      e.preventDefault();
    }
  });
}

if (searchClearBtn) {
  searchClearBtn.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      renderSuggestions();
      searchInput.focus();
    }
  });
}

// --- Category Filter Chips ---
function renderFilters() {
  if (!searchFilters) return;
  searchFilters.innerHTML = '';
  categories.forEach(cat => {
    let chip = document.createElement('button');
    chip.className = 'filter-chip' + (cat === currentFilter ? ' selected' : '');
    chip.textContent = cat;
    chip.addEventListener('click', () => {
      currentFilter = cat;
      renderFilters();
      renderSuggestions();
    });
    searchFilters.appendChild(chip);
  });
}

// --- Render Live Suggestions ---
function renderSuggestions() {
  if (!searchInput || !searchSuggestions) return;
  let val = searchInput.value.trim().toLowerCase();
  let matches = allProducts.filter(prod => {
    let matchCat = currentFilter === "All" || prod.category === currentFilter;
    return matchCat && getProductSearchString(prod).includes(val);
  });
  searchSuggestions.innerHTML = '';
  if (!val) return;
  if (matches.length === 0) {
    searchSuggestions.innerHTML = `<div class="suggestion-item">No results found.</div>`;
    return;
  }
  matches.slice(0, 8).forEach(prod => {
    let item = document.createElement('div');
    item.className = 'suggestion-item';
    item.innerHTML = `<img src="${prod.img}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;"> 
      ${highlightText(getProductDisplayName(prod), val)}`;
    item.addEventListener('click', () => {
      saveRecentSearch(val);
      // Optional: take user to product page
      closeSearchPanel();
    });
    searchSuggestions.appendChild(item);
  });
}

// --- Highlight Keyword in Result ---
function highlightText(text, keyword) {
  if (!text || !keyword) return text || '';
  return text.replace(new RegExp(`(${keyword})`, 'gi'), `<span class="suggestion-highlight">$1</span>`);
}

// --- Recent Searches ---
function renderRecentSearches() {
  if (!searchRecent) return;
  if (recentSearches.length === 0) {
    searchRecent.innerHTML = "";
    return;
  }
  searchRecent.innerHTML = `<div class="search-recent-title">Recent:</div>` +
    recentSearches.map(rs => `<span class="filter-chip" tabindex="0">${rs}</span>`).join(' ');
  Array.from(searchRecent.querySelectorAll('.filter-chip')).forEach((chip, i) => {
    chip.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = recentSearches[i];
        renderSuggestions();
        searchInput.focus();
      }
    });
  });
}

function saveRecentSearch(q) {
  q = q.trim();
  if (!q) return;
  recentSearches = recentSearches.filter(rs => rs !== q);
  recentSearches.unshift(q);
  if (recentSearches.length > 5) recentSearches.pop();
  localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
}
