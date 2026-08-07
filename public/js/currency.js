// AuraCraft Currency Conversion Module (USD $ <-> INR ₹)

const USD_TO_INR_RATE = 83.50; // 1 USD = 83.50 INR

function getSelectedCurrency() {
  return localStorage.getItem('auracraft_currency') || 'USD';
}

function setSelectedCurrency(currency) {
  localStorage.setItem('auracraft_currency', currency);
  window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency } }));
}

function formatPrice(priceInUSD) {
  const currency = getSelectedCurrency();
  const num = Number(priceInUSD) || 0;

  if (currency === 'INR') {
    const inrValue = num * USD_TO_INR_RATE;
    return `₹${inrValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `$${num.toFixed(2)}`;
}

function initCurrencySwitcher() {
  const selects = document.querySelectorAll('.currency-select');
  const currentCurrency = getSelectedCurrency();

  selects.forEach(select => {
    select.value = currentCurrency;
    select.addEventListener('change', (e) => {
      setSelectedCurrency(e.target.value);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCurrencySwitcher();
});
