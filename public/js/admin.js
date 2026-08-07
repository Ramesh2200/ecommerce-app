// Admin Dashboard Controller

async function loadDashboardMetrics() {
  const revenueEl = document.getElementById('kpiRevenue');
  const ordersEl = document.getElementById('kpiOrders');
  const avgOrderEl = document.getElementById('kpiAvgOrder');
  const stockEl = document.getElementById('kpiStock');
  const recentOrdersTable = document.getElementById('recentOrdersBody');

  if (!revenueEl) return;

  try {
    const data = await apiRequest('/orders/admin/metrics');
    if (data.success) {
      const { metrics, recentOrders } = data;

      revenueEl.textContent = typeof formatPrice === 'function' ? formatPrice(metrics.total_revenue) : `$${metrics.total_revenue.toFixed(2)}`;
      ordersEl.textContent = metrics.total_orders;
      avgOrderEl.textContent = typeof formatPrice === 'function' ? formatPrice(metrics.avg_order_value) : `$${metrics.avg_order_value.toFixed(2)}`;
      stockEl.textContent = `${metrics.total_stock} units`;

      // Render Recent Orders Table
      if (recentOrdersTable) {
        if (recentOrders.length === 0) {
          recentOrdersTable.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No orders recorded yet.</td></tr>`;
        } else {
          recentOrdersTable.innerHTML = recentOrders.map(order => {
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return `
              <tr>
                <td><strong>${order.order_number}</strong></td>
                <td>${order.shipping_address.fullName}</td>
                <td>${typeof formatPrice === 'function' ? formatPrice(order.total_amount) : `$${order.total_amount.toFixed(2)}`}</td>
                <td>
                  <select class="status-select sort-select" data-id="${order.id}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem;">
                    <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>🟡 Processing</option>
                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>🔵 Shipped</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>🟢 Delivered</option>
                  </select>
                </td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${dateStr}</td>
              </tr>
            `;
          }).join('');

          // Status Change Listeners
          recentOrdersTable.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
              const orderId = e.target.dataset.id;
              const newStatus = e.target.value;
              try {
                const res = await apiRequest(`/orders/${orderId}/status`, 'PATCH', { status: newStatus });
                if (res.success) {
                  showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
                }
              } catch (err) {
                showToast(err.message, 'error');
              }
            });
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to load admin metrics:', error);
  }
}

async function loadProductsManagement() {
  const tableBody = document.getElementById('adminProductsBody');
  if (!tableBody) return;

  try {
    const data = await apiRequest('/products');
    if (data.success) {
      tableBody.innerHTML = data.products.map(p => `
        <tr>
          <td style="display: flex; align-items: center; gap: 0.8rem;">
            <img src="${p.image}" alt="${p.title}" style="width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-sm);" />
            <strong style="color: var(--text-primary); font-size: 0.9rem;">${p.title}</strong>
          </td>
          <td><span style="background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.8rem;">${p.category}</span></td>
          <td>${typeof formatPrice === 'function' ? formatPrice(p.price) : `$${p.price.toFixed(2)}`}</td>
          <td><strong style="color: ${p.stock < 10 ? 'var(--warning)' : 'var(--success)'};">${p.stock}</strong></td>
          <td>
            <button class="delete-prod-btn" data-id="${p.id}" style="color: var(--danger); font-size: 0.85rem; font-weight: 600;">Delete</button>
          </td>
        </tr>
      `).join('');

      tableBody.querySelectorAll('.delete-prod-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          if (confirm('Are you sure you want to delete this product?')) {
            try {
              const res = await apiRequest(`/products/${id}`, 'DELETE');
              if (res.success) {
                showToast('Product deleted!', 'info');
                loadProductsManagement();
                loadDashboardMetrics();
              }
            } catch (err) {
              showToast(err.message, 'error');
            }
          }
        });
      });
    }
  } catch (error) {
    console.error('Failed to load admin products:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardMetrics();
  loadProductsManagement();

  window.addEventListener('currencyChanged', () => {
    loadDashboardMetrics();
    loadProductsManagement();
  });

  // Add Product Modal Form Listener
  const addProdForm = document.getElementById('addProductForm');
  if (addProdForm) {
    addProdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('newTitle').value;
      const category = document.getElementById('newCategory').value;
      const price = document.getElementById('newPrice').value;
      const stock = document.getElementById('newStock').value;
      const image = document.getElementById('newImage').value;
      const description = document.getElementById('newDescription').value;

      try {
        const res = await apiRequest('/products', 'POST', { title, category, price, stock, image, description });
        if (res.success) {
          showToast('New product added to catalog!', 'success');
          addProdForm.reset();
          document.getElementById('addProductModal').classList.remove('active');
          loadProductsManagement();
          loadDashboardMetrics();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  const openAddModalBtn = document.getElementById('openAddProductModalBtn');
  const closeAddModalBtn = document.getElementById('closeAddModalBtn');
  const addModal = document.getElementById('addProductModal');

  if (openAddModalBtn && addModal) {
    openAddModalBtn.addEventListener('click', () => addModal.classList.add('active'));
  }
  if (closeAddModalBtn && addModal) {
    closeAddModalBtn.addEventListener('click', () => addModal.classList.remove('active'));
  }
});
