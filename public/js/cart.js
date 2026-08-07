// Cart Module for managing persistent shopping cart state and drawer UI

function getCart() {
  const cartJson = localStorage.getItem('auracraft_cart');
  return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
  localStorage.setItem('auracraft_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
  window.dispatchEvent(new Event('cartUpdated'));
}

function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = totalItems;
    b.style.display = totalItems > 0 ? 'inline-block' : 'none';
  });
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === product.id);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity
    });
  }

  saveCart(cart);
  showToast(`Added "${product.title}" to cart!`, 'success');
  openCartDrawer();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  showToast('Item removed from cart', 'info');
}

function updateQuantity(productId, newQty) {
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity = newQty;
    saveCart(cart);
  }
}

function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function openCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (overlay && drawer) {
    overlay.classList.add('active');
    drawer.classList.add('active');
  }
}

function closeCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
  }
}

function renderCartDrawer() {
  const cartBody = document.getElementById('cartDrawerBody');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');

  if (!cartBody) return;

  const cart = getCart();
  const subtotal = getCartSubtotal();

  if (cartSubtotalEl) {
    cartSubtotalEl.textContent = typeof formatPrice === 'function' ? formatPrice(subtotal) : `$${subtotal.toFixed(2)}`;
  }

  if (cartCheckoutBtn) {
    cartCheckoutBtn.disabled = cart.length === 0;
  }

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
        <p style="font-size: 1.1rem; font-weight: 500;">Your cart is empty</p>
        <p style="font-size: 0.85rem; margin-top: 0.4rem;">Discover our products and add your favorites!</p>
      </div>
    `;
    return;
  }

  cartBody.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">${typeof formatPrice === 'function' ? formatPrice(item.price * item.quantity) : `$${(item.price * item.quantity).toFixed(2)}`}</div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn btn-minus" data-id="${item.id}">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn btn-plus" data-id="${item.id}">+</button>
          </div>
          <button class="remove-item-btn" data-id="${item.id}">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  // Attach item event listeners
  cartBody.querySelectorAll('.btn-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const item = cart.find(i => i.id === id);
      if (item) updateQuantity(id, item.quantity - 1);
    });
  });

  cartBody.querySelectorAll('.btn-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const item = cart.find(i => i.id === id);
      if (item) updateQuantity(id, item.quantity + 1);
    });
  });

  cartBody.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      removeFromCart(id);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCartDrawer();

  const cartNavBtn = document.getElementById('cartNavBtn');
  if (cartNavBtn) {
    cartNavBtn.addEventListener('click', openCartDrawer);
  }

  const closeCartBtn = document.getElementById('closeCartDrawerBtn');
  const overlay = document.getElementById('cartDrawerOverlay');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (overlay) overlay.addEventListener('click', closeCartDrawer);

  window.addEventListener('currencyChanged', renderCartDrawer);
});
