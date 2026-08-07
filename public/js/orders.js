// Orders page controller

async function loadUserOrders() {
  const container = document.getElementById('ordersContainer');
  if (!container) return;

  const user = getAuthUser();
  if (!user) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
        <h2 style="color: var(--text-primary);">Authentication Required</h2>
        <p style="margin-top: 0.5rem; margin-bottom: 1.5rem;">Please log in to view your past orders and status tracking.</p>
        <button onclick="openAuthModal('login')" class="btn-primary">Log In / Sign Up</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
      <p>Loading your orders...</p>
    </div>
  `;

  try {
    const data = await apiRequest('/orders/my-orders');
    if (data.success) {
      if (data.orders.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
            <h3 style="color: var(--text-primary); font-size: 1.3rem;">No orders yet</h3>
            <p style="margin-top: 0.4rem; margin-bottom: 1.5rem;">You haven't placed any orders yet. Start exploring our shop!</p>
            <a href="index.html" class="btn-primary">Shop Now</a>
          </div>
        `;
        return;
      }

      container.innerHTML = data.orders.map(order => {
        const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const statusColor = order.status === 'Delivered' ? 'var(--success)' : order.status === 'Shipped' ? 'var(--primary)' : 'var(--warning)';

        return `
          <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.8rem; margin-bottom: 1.8rem;">
            
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.2rem; margin-bottom: 1.2rem;">
              <div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">Order Number</div>
                <div style="font-family: var(--font-heading); font-weight: 700; font-size: 1.15rem; color: var(--text-primary);">${order.order_number}</div>
              </div>

              <div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">Date Placed</div>
                <div style="font-size: 0.95rem; color: var(--text-secondary);">${orderDate}</div>
              </div>

              <div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">Total Amount</div>
                <div style="font-family: var(--font-heading); font-weight: 700; font-size: 1.15rem; color: var(--text-primary);">${typeof formatPrice === 'function' ? formatPrice(order.total_amount) : `$${order.total_amount.toFixed(2)}`}</div>
              </div>

              <div>
                <span style="background: rgba(255,255,255,0.05); border: 1px solid ${statusColor}; color: ${statusColor}; padding: 0.4rem 0.9rem; border-radius: var(--radius-full); font-weight: 600; font-size: 0.85rem;">
                  ● ${order.status}
                </span>
              </div>
            </div>

            <!-- Items -->
            <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.2rem;">
              ${order.items.map(item => `
                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border-radius: var(--radius-md); padding: 0.8rem;">
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm);" />
                    <div>
                      <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">${item.title}</div>
                      <div style="font-size: 0.85rem; color: var(--text-muted);">Qty: ${item.quantity} × ${typeof formatPrice === 'function' ? formatPrice(item.price) : `$${item.price.toFixed(2)}`}</div>
                    </div>
                  </div>
                  <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${typeof formatPrice === 'function' ? formatPrice(item.price * item.quantity) : `$${(item.price * item.quantity).toFixed(2)}`}</div>
                </div>
              `).join('')}
            </div>

            <!-- Shipping address details -->
            <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
              <div>📍 Ships to: <strong style="color: var(--text-secondary);">${order.shipping_address.fullName}</strong> (${order.shipping_address.addressLine}, ${order.shipping_address.city})</div>
              <div>💳 Payment: <strong style="color: var(--text-secondary);">${order.payment_method}</strong></div>
            </div>

          </div>
        `;
      }).join('');
    }
  } catch (error) {
    container.innerHTML = `<p style="color: var(--danger); text-align: center;">Failed to load order history.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserOrders();
  window.addEventListener('authChanged', loadUserOrders);
  window.addEventListener('currencyChanged', loadUserOrders);
});
