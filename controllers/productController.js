const getDb = require('../database/db');

// Get all products with search, category filtering, price filtering, and sorting
async function getAllProducts(req, res) {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category.toLowerCase() !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search && search.trim() !== '') {
      query += ' AND (title LIKE ? OR description LIKE ? OR category LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (minPrice && !isNaN(minPrice)) {
      query += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice && !isNaN(maxPrice)) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price DESC';
        break;
      case 'rating_desc':
        query += ' ORDER BY rating DESC';
        break;
      case 'newest':
        query += ' ORDER BY created_at DESC';
        break;
      default:
        query += ' ORDER BY id ASC';
        break;
    }

    const products = await db.all(query, params);

    // Parse JSON fields
    const formattedProducts = products.map(p => ({
      ...p,
      gallery: p.gallery ? JSON.parse(p.gallery) : [p.image],
      features: p.features ? JSON.parse(p.features) : []
    }));

    return res.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
}

// Get single product details by ID
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const reviews = await db.all('SELECT * FROM reviews WHERE product_id = ? ORDER BY date DESC', [id]);

    const formattedProduct = {
      ...product,
      gallery: product.gallery ? JSON.parse(product.gallery) : [product.image],
      features: product.features ? JSON.parse(product.features) : [],
      reviews
    };

    return res.json({
      success: true,
      product: formattedProduct
    });

  } catch (error) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }
}

// Get categories list with product counts
async function getCategories(req, res) {
  try {
    const db = await getDb();
    const categories = await db.all(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category ASC'
    );
    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
}

// Add review to a product
async function addReview(req, res) {
  try {
    const { id } = req.params;
    const { user_name, rating, comment } = req.body;

    if (!rating || !comment || !user_name) {
      return res.status(400).json({ success: false, message: 'Name, rating (1-5), and comment are required.' });
    }

    const db = await getDb();
    const product = await db.get('SELECT id FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await db.run(
      'INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
      [id, user_name.trim(), parseInt(rating), comment.trim()]
    );

    // Recalculate rating & reviews count
    const stats = await db.get(
      'SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE product_id = ?',
      [id]
    );

    const newRating = Math.round(stats.avg_rating * 10) / 10;
    const newCount = stats.count;

    await db.run(
      'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
      [newRating, newCount, id]
    );

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      rating: newRating,
      reviews_count: newCount
    });

  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ success: false, message: 'Failed to add review.' });
  }
}

// Admin: Create product
async function createProduct(req, res) {
  try {
    const { title, description, category, price, original_price, image, gallery, stock, features } = req.body;

    if (!title || !description || !category || !price || !image) {
      return res.status(400).json({ success: false, message: 'Title, description, category, price, and image are required.' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO products (title, description, category, price, original_price, rating, reviews_count, image, gallery, stock, features)
       VALUES (?, ?, ?, ?, ?, 5.0, 1, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        category.trim(),
        parseFloat(price),
        original_price ? parseFloat(original_price) : null,
        image.trim(),
        JSON.stringify(gallery || [image]),
        parseInt(stock || 50),
        JSON.stringify(features || [])
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
}

// Admin: Update product
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { title, description, category, price, stock } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT id FROM products WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await db.run(
      `UPDATE products SET title = ?, description = ?, category = ?, price = ?, stock = ? WHERE id = ?`,
      [title, description, category, parseFloat(price), parseInt(stock), id]
    );

    return res.json({ success: true, message: 'Product updated successfully!' });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
}

// Admin: Delete product
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    await db.run('DELETE FROM products WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Product deleted successfully!' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  getCategories,
  addReview,
  createProduct,
  updateProduct,
  deleteProduct
};
