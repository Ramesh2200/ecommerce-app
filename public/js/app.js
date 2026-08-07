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

    window.addEventListener('currencyChanged', loadProducts);
  }
});
