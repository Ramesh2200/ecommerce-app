// Main catalog controller for homepage

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';

async function loadCategories() {
  const container = document.getElementById('categoryChips');
  if (!container) return;

  try {
    const data = await apiRequest('/products/categories');
    if (data.success) {
      let html = `<button class="chip ${currentCategory === 'all' ? 'active' : ''}" data-category="all">All Products</button>`;
      
      data.categories.forEach(cat => {
        const isActive = currentCategory.toLowerCase() === cat.category.toLowerCase();
        html += `<button class="chip ${isActive ? 'active' : ''}" data-category="${cat.category}">${cat.category} (${cat.count})</button>`;
      });

      container.innerHTML = html;

      // Attach click listeners to chips
      container.querySelectorAll('.chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
          container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          e.target.classList.add('active');
          currentCategory = e.target.dataset.category;
          loadProducts();
        });
      });
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
      <div style="font-size: 2rem; margin-bottom: 0.5rem; animation: spin 1s linear infinite;">⏳</div>
      <p>Loading products...</p>
    </div>
  `;

  try {
    let queryParams = [];
    if (currentCategory && currentCategory !== 'all') queryParams.push(`category=${encodeURIComponent(currentCategory)}`);
    if (currentSearch) queryParams.push(`search=${encodeURIComponent(currentSearch)}`);
    if (currentSort && currentSort !== 'default') queryParams.push(`sort=${encodeURIComponent(currentSort)}`);

    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
    const data = await apiRequest(`/products${queryString}`);

    if (data.success) {
      if (data.products.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
            <h3 style="color: var(--text-primary); font-size: 1.3rem;">No products found</h3>
            <p style="margin-top: 0.4rem;">Try adjusting your search query or filter settings.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = data.products.map(p => `
        <div class="product-card">
          <a href="product.html?id=${p.id}" class="product-image-container">
            <img src="${p.image}" alt="${p.title}" class="product-image" loading="lazy" />
            <span class="product-category-badge">${p.category}</span>
          </a>
          <div class="product-info">
            <div class="product-rating">
              <span>★</span> <strong>${p.rating}</strong> <span class="rating-count">(${p.reviews_count})</span>
            </div>
            <a href="product.html?id=${p.id}">
              <h3 class="product-title">${p.title}</h3>
            </a>
            <p class="product-description">${p.description}</p>
            <div class="product-footer">
              <div class="product-price-block">
                <span class="product-price">${typeof formatPrice === 'function' ? formatPrice(p.price) : `$${p.price.toFixed(2)}`}</span>
                ${p.original_price ? `<span class="product-original-price">${typeof formatPrice === 'function' ? formatPrice(p.original_price) : `$${p.original_price.toFixed(2)}`}</span>` : ''}
              </div>
              <button class="btn-add-cart" data-product='${JSON.stringify(p).replace(/'/g, "&apos;")}'>
                <span>+</span> Add
              </button>
            </div>
          </div>
        </div>
      `).join('');

      // Attach add-to-cart listeners
      grid.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const product = JSON.parse(btn.dataset.product);
          addToCart(product, 1);
        });
      });
    }
  } catch (error) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--danger);">
        <p>Failed to load products. Please check server connection.</p>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productsGrid')) {
    loadCategories();
    loadProducts();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          currentSearch = e.target.value;
          loadProducts();
        }, 300);
      });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        loadProducts();
      });
    }

    window.addEventListener('currencyChanged', () => {
      loadProducts();
      checkAndRenderOrderConfirmation();
    });
  }

  checkAndRenderOrderConfirmation();
});

// Render Order Confirmation Details Banner on index.html if recent order exists
async function checkAndRenderOrderConfirmation() {
  const container = document.getElementById('orderConfirmationBannerContainer');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const urlOrderNum = urlParams.get('orderNum');
  const savedOrderRaw = localStorage.getItem('auracraft_last_order');

  let lastOrder = null;
  if (savedOrderRaw) {
    try {
      lastOrder = JSON.parse(savedOrderRaw);
    } catch (e) {
      lastOrder = null;
    }
  }

  const orderNumToDisplay = urlOrderNum || (lastOrder ? lastOrder.orderNumber : null);
  if (!orderNumToDisplay) {
    container.innerHTML = '';
    return;
  }

  const totalAmount = lastOrder ? lastOrder.totalAmount : 0;
  const itemsCount = lastOrder ? lastOrder.itemsCount : 1;
  const shippingName = lastOrder ? lastOrder.shippingName : '';
  const formattedTotal = typeof formatPrice === 'function' ? formatPrice(totalAmount) : `$${totalAmount.toFixed(2)}`;

  container.innerHTML = `
    <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(13, 17, 28, 0.95) 100%); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: var(--radius-lg); padding: 1.2rem 1.6rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; box-shadow: var(--shadow-lg);">
      <div style="display: flex; align-items: center; gap: 1.2rem;">
        <div style="font-size: 2.2rem; background: rgba(34, 197, 94, 0.2); border-radius: 50%; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🎉</div>
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.2rem;">
            <span style="background: var(--success); color: #000; font-weight: 800; font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: var(--radius-full); text-transform: uppercase;">ORDER CONFIRMED</span>
            <span style="font-family: var(--font-heading); font-weight: 700; color: var(--primary); font-size: 1.05rem;">${orderNumToDisplay}</span>
          </div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">
            Thank you${shippingName ? ` <strong>${shippingName}</strong>` : ''}! Your order for <strong>${itemsCount} item${itemsCount > 1 ? 's' : ''}</strong> (${formattedTotal}) has been placed & is processing.
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.8rem;">
        <button id="viewConfirmedOrderDetailsBtn" class="btn-primary" style="padding: 0.55rem 1.1rem; font-size: 0.85rem;">
          🔍 View Order Details
        </button>
        <button id="dismissConfirmedOrderBannerBtn" style="background: none; border: 1px solid var(--border-color); color: var(--text-muted); padding: 0.55rem 0.8rem; border-radius: var(--radius-md); cursor: pointer; font-size: 0.85rem;">
          ✕ Dismiss
        </button>
      </div>
    </div>
  `;

  // Listener for View Details
  const viewBtn = document.getElementById('viewConfirmedOrderDetailsBtn');
  if (viewBtn) {
    viewBtn.addEventListener('click', () => openOrderDetailsModal(orderNumToDisplay));
  }

  // Listener for Dismiss
  const dismissBtn = document.getElementById('dismissConfirmedOrderBannerBtn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      localStorage.removeItem('auracraft_last_order');
      if (window.history.replaceState) {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      }
      container.innerHTML = '';
    });
  }
}

// Open Order Track / Details Modal
async function openOrderDetailsModal(orderNumber) {
  const modal = document.getElementById('orderTrackerModal');
  const modalBody = document.getElementById('trackerModalBody');
  const closeBtn = document.getElementById('closeTrackerModalBtn');

  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
      <div style="font-size: 2rem; animation: spin 1s linear infinite;">⏳</div>
      <p style="margin-top: 0.5rem;">Fetching confirmed order details...</p>
    </div>
  `;

  modal.classList.add('active');

  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };

  try {
    const res = await apiRequest(`/orders/track/${orderNumber}`);
    if (res.success && res.order) {
      const order = res.order;
      const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const formattedTotal = typeof formatPrice === 'function' ? formatPrice(order.total_amount) : `$${order.total_amount.toFixed(2)}`;

      modalBody.innerHTML = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Order Number</div>
              <div style="font-family: var(--font-heading); font-weight: 700; font-size: 1.2rem; color: var(--primary);">${order.order_number}</div>
            </div>
            <span style="background: rgba(34,197,94,0.15); border: 1px solid var(--success); color: var(--success); padding: 0.3rem 0.8rem; border-radius: var(--radius-full); font-weight: 700; font-size: 0.8rem;">
              ● ${order.status || 'Processing'}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); border-top: 1px dashed var(--border-color); padding-top: 0.6rem;">
            <span>Date: ${orderDate}</span>
            <span>Payment: <strong>${order.payment_method || 'Credit Card'} (${order.payment_status || 'Completed'})</strong></span>
          </div>
        </div>

        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.6rem; color: var(--text-primary);">Order Items</div>
        <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 220px; overflow-y: auto; padding-right: 0.4rem; margin-bottom: 1.2rem;">
          ${(order.items || []).map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.6rem 0.8rem;">
              <div style="display: flex; align-items: center; gap: 0.8rem;">
                <img src="${item.image}" alt="${item.title}" style="width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-sm);" />
                <div>
                  <div style="font-weight: 600; font-size: 0.9rem; max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.title}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Qty: ${item.quantity} × ${typeof formatPrice === 'function' ? formatPrice(item.price) : `$${item.price.toFixed(2)}`}</div>
                </div>
              </div>
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">${typeof formatPrice === 'function' ? formatPrice(item.price * item.quantity) : `$${(item.price * item.quantity).toFixed(2)}`}</div>
            </div>
          `).join('')}
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.8rem; font-size: 0.85rem; margin-bottom: 1.2rem; color: var(--text-secondary);">
          <div>📍 Shipping Destination: <strong>${order.shipping_address ? (order.shipping_address.fullName || 'Customer') : 'Customer'}</strong></div>
          <div style="color: var(--text-muted); margin-top: 0.2rem;">${order.shipping_address ? (order.shipping_address.city || '') : ''}</div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.8rem;">
          <span style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700;">Total Paid</span>
          <span style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: var(--primary);">${formattedTotal}</span>
        </div>
      `;
    } else {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--danger);">
          <p>${res.message || 'Order details not found.'}</p>
        </div>
      `;
    }
  } catch (err) {
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--danger);">
        <p>Failed to load order details.</p>
      </div>
    `;
  }
}
