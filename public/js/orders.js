// Orders page controller with instant Order Confirmation & Order Number Tracking

async function renderOrderTrackingSearch(container) {
  const trackerHtml = `
    <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
      <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.4rem;">🔍 Track Confirmed Order</div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Have an order number? Enter it below to inspect live confirmation details, items, and shipping status.</p>
      <form id="trackOrderForm" style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
        <input type="text" id="trackOrderInput" class="form-input" placeholder="Enter Order # (e.g. ORD-20260819-1234)" style="flex: 1; min-width: 220px;" required />
        <button type="submit" class="btn-primary" style="padding: 0.6rem 1.4rem;">Lookup Order</button>
      </form>
      <div id="trackResultContainer" style="margin-top: 1rem;"></div>
    </div>
  `;
  return trackerHtml;
}

async function loadUserOrders() {
  const container = document.getElementById('ordersContainer');
  if (!container) return;

  const user = getAuthUser();
  const savedOrderRaw = localStorage.getItem('auracraft_last_order');
  let lastOrder = null;
  if (savedOrderRaw) {
    try { lastOrder = JSON.parse(savedOrderRaw); } catch (e) {}
  }

  let htmlHeader = await renderOrderTrackingSearch(container);

  // Render last confirmed order banner if present
  let recentOrderCardHtml = '';
  if (lastOrder && lastOrder.orderNumber) {
    const formattedTotal = typeof formatPrice === 'function' ? formatPrice(lastOrder.totalAmount) : `$${lastOrder.totalAmount.toFixed(2)}`;
    recentOrderCardHtml = `
      <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(13, 17, 28, 0.95) 100%); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; flex-wrap: wrap; gap: 0.8rem;">
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <span style="font-size: 1.8rem;">🎉</span>
            <div>
              <span style="background: var(--success); color: #000; font-weight: 800; font-size: 0.75rem; padding: 0.15rem 0.6rem; border-radius: var(--radius-full);">RECENTLY CONFIRMED ORDER</span>
              <div style="font-family: var(--font-heading); font-weight: 800; font-size: 1.3rem; color: var(--primary); margin-top: 0.2rem;">${lastOrder.orderNumber}</div>
            </div>
          </div>
          <button id="viewLastOrderFullBtn" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">View Details</button>
        </div>
        <div style="color: var(--text-secondary); font-size: 0.9rem;">
          Total Paid: <strong>${formattedTotal}</strong> • Status: <span style="color: var(--success); font-weight: 700;">Processing</span>
        </div>
      </div>
    `;
  }

  if (!user) {
    container.innerHTML = htmlHeader + recentOrderCardHtml + `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
        <div style="font-size: 2.5rem; margin-bottom: 0.8rem;">🔒</div>
        <h3 style="color: var(--text-primary); font-size: 1.3rem;">Sign in to view full order history</h3>
        <p style="margin-top: 0.4rem; margin-bottom: 1.5rem; color: var(--text-muted);">Sign in to automatically view all your past purchases or use the Order Tracker above.</p>
        <button onclick="openAuthModal('login')" class="btn-primary">Log In / Sign Up</button>
      </div>
    `;
    attachTrackerListeners();
    return;
  }

  container.innerHTML = htmlHeader + recentOrderCardHtml + `
    <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
      <p>Loading your past orders...</p>
    </div>
  `;
  attachTrackerListeners();

  try {
    const data = await apiRequest('/orders/my-orders');
    if (data.success) {
      let ordersHtml = '';
      if (data.orders.length === 0) {
        ordersHtml = `
          <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
            <div style="font-size: 2.5rem; margin-bottom: 0.8rem;">📦</div>
            <h3 style="color: var(--text-primary); font-size: 1.3rem;">No past order history found</h3>
            <p style="margin-top: 0.4rem; margin-bottom: 1.5rem; color: var(--text-muted);">You haven't placed any past orders under this account yet.</p>
            <a href="index.html" class="btn-primary">Explore Shop Products</a>
          </div>
        `;
      } else {
        ordersHtml = data.orders.map(order => {
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

              <!-- Shipping details -->
              <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>📍 Ships to: <strong style="color: var(--text-secondary);">${order.shipping_address ? order.shipping_address.fullName : ''}</strong> (${order.shipping_address ? order.shipping_address.city : ''})</div>
                <div>💳 Payment: <strong style="color: var(--text-secondary);">${order.payment_method}</strong></div>
              </div>
            </div>
          `;
        }).join('');
      }

      container.innerHTML = htmlHeader + recentOrderCardHtml + ordersHtml;
      attachTrackerListeners();
    }
  } catch (error) {
    console.error('Fetch orders failed:', error);

    // Check if error is authentication / expired token error
    const isAuthErr = error.message && (error.message.toLowerCase().includes('token') || error.message.toLowerCase().includes('auth') || error.message.toLowerCase().includes('login') || error.message.includes('401') || error.message.includes('403'));

    if (isAuthErr) {
      // Clear expired session
      localStorage.removeItem('auracraft_token');
      localStorage.removeItem('auracraft_user');
      if (typeof updateAuthUI === 'function') updateAuthUI();

      container.innerHTML = htmlHeader + recentOrderCardHtml + `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
          <div style="font-size: 2.5rem; margin-bottom: 0.8rem;">🔒</div>
          <h3 style="color: var(--text-primary); font-size: 1.3rem;">Session Expired or Login Required</h3>
          <p style="margin-top: 0.4rem; margin-bottom: 1.5rem; color: var(--text-muted);">Your login session expired. Please sign in again to view your full order history, or enter an Order # above.</p>
          <button onclick="openAuthModal('login')" class="btn-primary">Sign In / Log In</button>
        </div>
      `;
    } else {
      container.innerHTML = htmlHeader + recentOrderCardHtml + `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
          <h4 style="color: var(--text-primary); font-size: 1.1rem; margin-bottom: 0.5rem;">Order History Unavailable</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Use the Track Confirmed Order box above to look up any order details using your Order Number.</p>
          <button onclick="loadUserOrders()" class="btn-secondary" style="font-size: 0.85rem;">🔄 Retry Loading History</button>
        </div>
      `;
    }
    attachTrackerListeners();
  }
}

function attachTrackerListeners() {
  const form = document.getElementById('trackOrderForm');
  const input = document.getElementById('trackOrderInput');
  const resultDiv = document.getElementById('trackResultContainer');
  const viewLastBtn = document.getElementById('viewLastOrderFullBtn');

  if (viewLastBtn) {
    const savedOrderRaw = localStorage.getItem('auracraft_last_order');
    if (savedOrderRaw) {
      try {
        const lastOrder = JSON.parse(savedOrderRaw);
        viewLastBtn.addEventListener('click', () => {
          if (input) input.value = lastOrder.orderNumber;
          if (form) form.dispatchEvent(new Event('submit'));
        });
      } catch (e) {}
    }
  }

  if (form && input && resultDiv) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const orderNum = input.value.trim();
      if (!orderNum) return;

      resultDiv.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">Searching order #${orderNum}...</p>`;

      try {
        const res = await apiRequest(`/orders/track/${encodeURIComponent(orderNum)}`);
        if (res.success && res.order) {
          const order = res.order;
          const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          });
          const formattedTotal = typeof formatPrice === 'function' ? formatPrice(order.total_amount) : `$${order.total_amount.toFixed(2)}`;

          resultDiv.innerHTML = `
            <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid var(--success); border-radius: var(--radius-md); padding: 1.2rem; margin-top: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                <div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Order Number</div>
                  <div style="font-family: var(--font-heading); font-weight: 700; font-size: 1.2rem; color: var(--primary);">${order.order_number}</div>
                </div>
                <span style="background: rgba(34,197,94,0.2); color: var(--success); padding: 0.3rem 0.8rem; border-radius: var(--radius-full); font-weight: 700; font-size: 0.8rem;">
                  ● ${order.status}
                </span>
              </div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem;">
                Date: ${orderDate} • Payment: <strong>${order.payment_method} (${order.payment_status})</strong>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.8rem;">
                ${(order.items || []).map(item => `
                  <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); padding: 0.5rem 0.8rem; border-radius: var(--radius-sm);">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                      <img src="${item.image}" alt="${item.title}" style="width: 36px; height: 36px; object-fit: cover; border-radius: var(--radius-sm);" />
                      <span style="font-size: 0.9rem; font-weight: 600;">${item.title} (Qty: ${item.quantity})</span>
                    </div>
                    <span style="font-weight: 700; font-size: 0.9rem;">${typeof formatPrice === 'function' ? formatPrice(item.price * item.quantity) : `$${(item.price * item.quantity).toFixed(2)}`}</span>
                  </div>
                `).join('')}
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1rem; border-top: 1px dashed var(--border-color); padding-top: 0.6rem;">
                <span>Total Paid</span>
                <span style="color: var(--primary); font-size: 1.1rem;">${formattedTotal}</span>
              </div>
            </div>
          `;
        } else {
          resultDiv.innerHTML = `<p style="color: var(--danger); font-size: 0.9rem;">${res.message || 'Order not found.'}</p>`;
        }
      } catch (err) {
        resultDiv.innerHTML = `<p style="color: var(--danger); font-size: 0.9rem;">Order lookup failed. Please check order number.</p>`;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserOrders();
  window.addEventListener('authChanged', loadUserOrders);
  window.addEventListener('currencyChanged', loadUserOrders);
});
