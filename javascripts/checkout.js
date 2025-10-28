// --- Updated checkout.js ---

document.addEventListener("DOMContentLoaded", function () {
  const summaryDiv = document.getElementById("checkoutCartSummary");
  if (!summaryDiv) return;

  // The 'currency' object dependency is assumed to be globally available from currency.js.

  function renderCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    let total = 0;

    if (cart.length === 0) {
      // Use the summaryDiv directly for empty message
      summaryDiv.innerHTML = '<p>Your cart is empty.</p>'; 
      const btn = document.querySelector('.checkout-btn');
      if (btn) btn.disabled = true;
      return;
    }

    summaryDiv.innerHTML = cart.map(item => {
      // Ensure item.price is treated as a string, not a number, for currency conversion accuracy
      const itemPrice = Number(item.price); 
      const itemTotal = itemPrice * item.quantity;
      total += itemTotal;
      return `
        <div class="checkout-item">
          <img src="${item.img}" alt="${item.name}" class="checkout-item-img"> 
          <div class="checkout-item-info">
            <strong>${item.name}</strong><br>
            Quantity: ${item.quantity} &mdash;
            <span class="checkout-price" data-usd="${item.price}">
              ${currency.symbol}${itemPrice.toFixed(2)}
            </span>
          </div>
        </div>
      `;
    }).join('') + `
      <div class="checkout-total">
        <b>Total:
          <span class="checkout-price" data-usd="${total}">
            ${currency.symbol}${total.toFixed(2)}
          </span>
        </b>
      </div>
    `;

    // 🔄 Apply currency conversion immediately
    if (typeof updateAllPrices === "function") {
      updateAllPrices();
    }
  }

  // 🔁 Initial render
  renderCheckoutSummary();

  // 🔁 BEST PRACTICE: Re-render when currency changes via a Custom Event
  // NOTE: You must dispatch 'currencyChange' from currency.js for this to work.
  document.addEventListener('currencyChange', renderCheckoutSummary);

  // You can remove the fragile setTimeout block entirely:
  /*
  const currencyList = document.getElementById("currency-list");
  if (currencyList) {
    currencyList.addEventListener("click", () => {
      // Removed: setTimeout(renderCheckoutSummary, 100);
    });
  }
  */

  // ✅ Handle payment method dropdown (rest of checkout.js is fine)
  const paymentSelect = document.getElementById("payment-method");
  const branchSection = document.getElementById("branch-selection");

  if (paymentSelect && branchSection) {
    paymentSelect.addEventListener("change", () => {
      branchSection.style.display = paymentSelect.value === "pickup" ? "block" : "none";
    });
  }

  // ✅ Final form submission handler (rest of checkout.js is fine)
  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // ... (submission logic remains unchanged) ...
      const formData = new FormData(this);
      const payment = formData.get("payment");
      const name = formData.get("name");

      if (payment === "paypal") {
        window.location.href = "https://www.paypal.com/checkoutnow?token=EXAMPLE_TOKEN";
        return;
      }

      if (payment === "card") {
        alert("Redirecting to secure credit card form...");
        return;
      }

      if (payment === "moncash") {
        alert("Opening MonCash payment window...");
        return;
      }

      if (payment === "pickup") {
        const branch = formData.get("branch");
        if (!branch) {
          alert("Please select a pickup branch.");
          return;
        }
        alert(`Thank you ${name}, your order will be ready for pickup at ${branch.replace("-", " ")}.`);
      } else {
        alert(`Thank you ${name}, your delivery is on its way!`);
      }

      localStorage.removeItem("cart");
      window.location.href = "index.html";
    });
  }
});