// Product Detail Page Logic

let currentProduct = null;
let selectedQuantity = 1;

async function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const container = document.getElementById('productDetailContainer');
  if (!container) return;

  if (!productId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await apiRequest(`/products/${productId}`);
    if (data.success) {
      currentProduct = data.product;
      renderProductDetails(data.product);
    }
  } catch (error) {
    container.innerHTML = `
      <div style="text-align: center; padding: 5rem 1rem; color: var(--danger);">
        <h2>Product Not Found</h2>
        <p style="margin-top: 0.5rem; color: var(--text-muted);">The product you are looking for does not exist or has been removed.</p>
        <a href="index.html" class="btn-primary" style="margin-top: 1.5rem;">Return to Shop</a>
      </div>
    `;
  }
}

function renderProductDetails(p) {
  const container = document.getElementById('productDetailContainer');
  document.title = `${p.title} - AuraCraft Store`;

  const isOutOfStock = p.stock <= 0;
  const galleryImages = p.gallery && p.gallery.length ? p.gallery : [p.image];

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 3rem; align-items: start;">
      
      <!-- Gallery Column -->
      <div>
        <div style="width: 100%; height: 420px; border-radius: var(--radius-lg); overflow: hidden; background: #000; border: 1px solid var(--border-color); margin-bottom: 1rem;">
          <img id="mainProductImg" src="${galleryImages[0]}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="display: flex; gap: 0.8rem; overflow-x: auto; padding-bottom: 0.4rem;">
          ${galleryImages.map((img, idx) => `
            <img src="${img}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-src="${img}" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-md); border: 2px solid ${idx === 0 ? 'var(--primary)' : 'var(--border-color)'}; cursor: pointer;" />
          `).join('')}
        </div>
      </div>

      <!-- Info Column -->
      <div>
        <span style="display: inline-block; background: rgba(99, 102, 241, 0.15); color: var(--primary); padding: 0.3rem 0.8rem; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.8rem;">${p.category}</span>
        <h1 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.8rem;">${p.title}</h1>
        
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <div style="color: var(--warning); font-size: 1.1rem;">★ <strong>${p.rating}</strong></div>
          <span style="color: var(--text-muted); font-size: 0.9rem;">(${p.reviews_count} customer reviews)</span>
          <span style="color: ${isOutOfStock ? 'var(--danger)' : 'var(--success)'}; font-weight: 600; font-size: 0.9rem;">
            ${isOutOfStock ? '✖ Out of Stock' : `✔ In Stock (${p.stock} units)`}
          </span>
        </div>

        <div style="font-size: 2.2rem; font-family: var(--font-heading); font-weight: 800; color: var(--text-primary); margin-bottom: 1.5rem; display: flex; align-items: baseline; gap: 1rem;">
          ${typeof formatPrice === 'function' ? formatPrice(p.price) : `$${p.price.toFixed(2)}`}
          ${p.original_price ? `<span style="font-size: 1.2rem; color: var(--text-muted); text-decoration: line-through; font-weight: 400;">${typeof formatPrice === 'function' ? formatPrice(p.original_price) : `$${p.original_price.toFixed(2)}`}</span>` : ''}
        </div>

        <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.7; margin-bottom: 2rem;">${p.description}</p>

        <!-- Features List -->
        ${p.features && p.features.length ? `
          <div style="margin-bottom: 2rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.2rem;">
            <h4 style="font-family: var(--font-heading); margin-bottom: 0.8rem; font-size: 1rem; color: var(--text-primary);">Key Features:</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
              ${p.features.map(f => `<li style="font-size: 0.92rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--primary);">✓</span> ${f}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Add to Cart Actions -->
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: var(--radius-full); overflow: hidden; background: rgba(255,255,255,0.05);">
            <button id="qtyMinusBtn" style="padding: 0.75rem 1.2rem; color: var(--text-primary); font-weight: 700;">-</button>
            <span id="detailQtyDisplay" style="padding: 0.75rem 1rem; font-weight: 700; font-size: 1rem;">1</span>
            <button id="qtyPlusBtn" style="padding: 0.75rem 1.2rem; color: var(--text-primary); font-weight: 700;">+</button>
          </div>

          <button id="addDetailCartBtn" class="btn-primary" style="flex: 1; min-width: 200px; justify-content: center;" ${isOutOfStock ? 'disabled' : ''}>
            🛒 Add to Cart
          </button>
          <button id="buyNowBtn" class="btn-secondary" style="justify-content: center;" ${isOutOfStock ? 'disabled' : ''}>
            ⚡ Buy Now
          </button>
        </div>

      </div>
    </div>

    <!-- Reviews Section -->
    <div style="margin-top: 4rem; border-top: 1px solid var(--border-color); padding-top: 3rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 700;">Customer Reviews (${p.reviews ? p.reviews.length : 0})</h2>
        <button id="toggleReviewFormBtn" class="btn-secondary" style="font-size: 0.9rem; padding: 0.5rem 1rem;">✍ Write a Review</button>
      </div>

      <!-- Add Review Form -->
      <form id="reviewForm" style="display: none; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.8rem; margin-bottom: 2.5rem;">
        <h3 style="font-family: var(--font-heading); margin-bottom: 1rem; font-size: 1.2rem;">Write your review</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" class="form-group">
          <div>
            <label class="form-label">Your Name</label>
            <input type="text" id="reviewName" class="form-input" required placeholder="John Doe" />
          </div>
          <div>
            <label class="form-label">Rating (1 to 5 Stars)</label>
            <select id="reviewRating" class="form-input" required>
              <option value="5">★★★★★ (5 - Excellent)</option>
              <option value="4">★★★★☆ (4 - Good)</option>
              <option value="3">★★★☆☆ (3 - Average)</option>
              <option value="2">★★☆☆☆ (2 - Poor)</option>
              <option value="1">★☆☆☆☆ (1 - Terrible)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Review Comment</label>
          <textarea id="reviewComment" class="form-input" rows="3" required placeholder="Share your experience with this product..."></textarea>
        </div>
        <button type="submit" class="btn-primary" style="font-size: 0.9rem; padding: 0.6rem 1.4rem;">Submit Review</button>
      </form>

      <!-- Reviews List -->
      <div style="display: flex; flex-direction: column; gap: 1.2rem;">
        ${p.reviews && p.reviews.length ? p.reviews.map(r => `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.2rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong style="color: var(--text-primary); font-size: 1rem;">${r.user_name}</strong>
              <span style="color: var(--warning);">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">${r.comment}</p>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.6rem;">${new Date(r.date).toLocaleDateString()}</div>
          </div>
        `).join('') : '<p style="color: var(--text-muted);">No reviews yet. Be the first to leave a review!</p>'}
      </div>
    </div>
  `;

  // Gallery Thumb Click Listener
  container.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      container.querySelectorAll('.gallery-thumb').forEach(t => t.style.borderColor = 'var(--border-color)');
      e.target.style.borderColor = 'var(--primary)';
      document.getElementById('mainProductImg').src = e.target.dataset.src;
    });
  });

  // Quantity controls
  const qtyMinus = document.getElementById('qtyMinusBtn');
  const qtyPlus = document.getElementById('qtyPlusBtn');
  const qtyDisplay = document.getElementById('detailQtyDisplay');

  if (qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', () => {
      if (selectedQuantity > 1) {
        selectedQuantity--;
        qtyDisplay.textContent = selectedQuantity;
      }
    });
    qtyPlus.addEventListener('click', () => {
      if (selectedQuantity < p.stock) {
        selectedQuantity++;
        qtyDisplay.textContent = selectedQuantity;
      }
    });
  }

  // Add to Cart listener
  const addCartBtn = document.getElementById('addDetailCartBtn');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      addToCart(currentProduct, selectedQuantity);
    });
  }

  // Buy Now listener
  const buyNowBtn = document.getElementById('buyNowBtn');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      addToCart(currentProduct, selectedQuantity);
      window.location.href = 'checkout.html';
    });
  }

  // Toggle review form
  const toggleFormBtn = document.getElementById('toggleReviewFormBtn');
  const reviewForm = document.getElementById('reviewForm');
  if (toggleFormBtn && reviewForm) {
    toggleFormBtn.addEventListener('click', () => {
      reviewForm.style.display = reviewForm.style.display === 'none' ? 'block' : 'none';
    });

    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user_name = document.getElementById('reviewName').value;
      const rating = document.getElementById('reviewRating').value;
      const comment = document.getElementById('reviewComment').value;

      try {
        const res = await apiRequest(`/products/${p.id}/reviews`, 'POST', { user_name, rating, comment });
        if (res.success) {
          showToast('Review submitted!', 'success');
          loadProductDetails(); // reload
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProductDetails();
  window.addEventListener('currencyChanged', loadProductDetails);
});
