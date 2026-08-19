// Checkout page logic

let appliedDiscountPercent = 0;
let appliedPromoCode = '';

function renderCheckoutItems() {
  const container = document.getElementById('checkoutItemsContainer');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const discountEl = document.getElementById('checkoutDiscount');
  const shippingEl = document.getElementById('checkoutShipping');
  const taxEl = document.getElementById('checkoutTax');
  const totalEl = document.getElementById('checkoutTotal');

  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted);">Your cart is empty. <a href="index.html" style="color: var(--primary);">Go back shopping</a></p>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid var(--border-color);">
      <div style="display: flex; align-items: center; gap: 0.8rem;">
        <img src="${item.image}" alt="${item.title}" style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-sm);" />
        <div>
          <div style="font-weight: 600; font-size: 0.9rem; max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Qty: ${item.quantity} × ${typeof formatPrice === 'function' ? formatPrice(item.price) : `$${item.price.toFixed(2)}`}</div>
        </div>
      </div>
      <div style="font-weight: 700; color: var(--text-primary);">${typeof formatPrice === 'function' ? formatPrice(item.price * item.quantity) : `$${(item.price * item.quantity).toFixed(2)}`}</div>
    </div>
  `).join('');

  const subtotal = getCartSubtotal();
  const discountAmount = subtotal * (appliedDiscountPercent / 100);
  const shipping = subtotal > 150 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const finalTotal = Math.max(0, subtotal - discountAmount + shipping + tax);

  if (subtotalEl) subtotalEl.textContent = typeof formatPrice === 'function' ? formatPrice(subtotal) : `$${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = typeof formatPrice === 'function' ? `-${formatPrice(discountAmount)}` : `-$${discountAmount.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : (typeof formatPrice === 'function' ? formatPrice(shipping) : `$${shipping.toFixed(2)}`);
  if (taxEl) taxEl.textContent = typeof formatPrice === 'function' ? formatPrice(tax) : `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = typeof formatPrice === 'function' ? formatPrice(finalTotal) : `$${finalTotal.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutItems();

  const user = getAuthUser();
  if (user) {
    if (document.getElementById('fullName')) document.getElementById('fullName').value = user.name || 'Ramesh K';
    if (document.getElementById('email')) document.getElementById('email').value = user.email || 'ramesh.k@codealpha.tech';
  }

  // Promo Code Handler
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const promoInput = document.getElementById('promoCodeInput');
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'CODEALPHA10') {
        appliedDiscountPercent = 10;
        appliedPromoCode = code;
        showToast('10% Promo Discount Applied!', 'success');
      } else if (code === 'WELCOME20') {
        appliedDiscountPercent = 20;
        appliedPromoCode = code;
        showToast('20% Welcome Discount Applied!', 'success');
      } else {
        showToast('Invalid promo code. Try "CODEALPHA10" or "WELCOME20"', 'error');
      }
      renderCheckoutItems();
    });
  }

  // Checkout Form Submission
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const user = getAuthUser();
      if (!user) {
        showToast('Please login or register to complete your order.', 'error');
        openAuthModal('login');
        return;
      }

      const cart = getCart();
      if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
      }

      const shippingAddress = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        addressLine: document.getElementById('addressLine').value,
        city: document.getElementById('city').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value
      };

      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Credit Card';

      try {
        const orderData = {
          items: cart,
          shippingAddress,
          paymentMethod,
          promoCode: appliedPromoCode
        };

        const res = await apiRequest('/orders', 'POST', orderData);

        if (res.success) {
          // Clear cart
          localStorage.removeItem('auracraft_cart');
          updateCartBadge();

          // Store last confirmed order details in localStorage for index.html / orders pages
          localStorage.setItem('auracraft_last_order', JSON.stringify({
            orderNumber: res.order.order_number,
            totalAmount: res.order.total_amount,
            itemsCount: res.order.items_count || (cart ? cart.length : 1),
            date: new Date().toISOString(),
            shippingName: shippingAddress.fullName || '',
            city: shippingAddress.city || ''
          }));

          // Show confirmation screen modal
          const modal = document.getElementById('orderSuccessModal');
          if (modal) {
            document.getElementById('confOrderNum').textContent = res.order.order_number;
            document.getElementById('confTotal').textContent = typeof formatPrice === 'function' ? formatPrice(res.order.total_amount) : `$${res.order.total_amount.toFixed(2)}`;
            modal.classList.add('active');
          } else {
            showToast('Order placed successfully!', 'success');
            window.location.href = `index.html?orderSuccess=true&orderNum=${encodeURIComponent(res.order.order_number)}`;
          }
        }
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }

  window.addEventListener('currencyChanged', renderCheckoutItems);
});
