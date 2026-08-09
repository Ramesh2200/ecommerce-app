const path = require('path');

let memoryStore = null;

function initMemoryStore() {
  if (memoryStore) return memoryStore;

  const sampleProducts = [
    { id: 1, title: 'Aura Wireless Noise-Canceling Headphones', category: 'Audio', price: 299.99, original_price: 349.99, rating: 4.8, reviews_count: 142, image: '/images/headphones.jpg', stock: 25, created_at: new Date().toISOString() },
    { id: 2, title: 'AuraCraft Ergonomic Mechanical Keyboard', category: 'Accessories', price: 159.99, original_price: 189.99, rating: 4.7, reviews_count: 98, image: '/images/keyboard.jpg', stock: 40, created_at: new Date().toISOString() },
    { id: 3, title: 'Aura Ultra-Wide 4K Gaming Monitor', category: 'Displays', price: 699.99, original_price: 799.99, rating: 4.9, reviews_count: 215, image: '/images/monitor.jpg', stock: 12, created_at: new Date().toISOString() },
    { id: 4, title: 'Aura Precision Wireless Mouse', category: 'Accessories', price: 79.99, original_price: 99.99, rating: 4.6, reviews_count: 76, image: '/images/mouse.jpg', stock: 60, created_at: new Date().toISOString() },
    { id: 5, title: 'Aura Studio Smart Speaker', category: 'Audio', price: 199.99, original_price: 229.99, rating: 4.5, reviews_count: 54, image: '/images/speaker.jpg', stock: 30, created_at: new Date().toISOString() }
  ];

  const sampleUsers = [
    { id: 1, name: 'Admin User', email: 'admin@auracraft.com', password: '$2a$10$YourHashedPasswordHere', role: 'admin', created_at: new Date().toISOString() },
    { id: 2, name: 'John Doe', email: 'john@example.com', password: '$2a$10$YourHashedPasswordHere', role: 'customer', created_at: new Date().toISOString() }
  ];

  const sampleOrders = [];
  const sampleReviews = [];

  memoryStore = {
    products: sampleProducts,
    users: sampleUsers,
    orders: sampleOrders,
    reviews: sampleReviews,

    async all(sql, params = []) {
      const lowerSql = (sql || '').toLowerCase();
      if (lowerSql.includes('from products')) {
        let res = [...sampleProducts];
        if (params.length > 0 && typeof params[0] === 'string' && !params[0].startsWith('%')) {
          res = res.filter(p => p.category.toLowerCase() === params[0].toLowerCase());
        }
        return res;
      }
      if (lowerSql.includes('from users')) return [...sampleUsers];
      if (lowerSql.includes('from orders')) return [...sampleOrders];
      if (lowerSql.includes('from reviews')) return [...sampleReviews];
      return [...sampleProducts];
    },

    async get(sql, params = []) {
      const lowerSql = (sql || '').toLowerCase();
      if (lowerSql.includes('from products')) {
        return sampleProducts.find(p => p.id == params[0]) || sampleProducts[0];
      }
      if (lowerSql.includes('from users')) {
        return sampleUsers.find(u => u.email == params[0] || u.id == params[0]);
      }
      return sampleProducts[0];
    },

    async run(sql, params = []) {
      const lowerSql = (sql || '').toLowerCase();
      if (lowerSql.includes('insert into orders')) {
        const newOrder = { id: sampleOrders.length + 1, order_number: `ORD-${Date.now()}`, total_amount: params[1] || 299.99, status: 'Processing', created_at: new Date().toISOString() };
        sampleOrders.push(newOrder);
        return { lastID: newOrder.id };
      }
      return { lastID: 1 };
    },

    async exec(sql) { return true; }
  };

  return memoryStore;
}

async function getDb() {
  if (process.env.VERCEL) {
    return initMemoryStore();
  }
  
  try {
    const sqlite3 = require('sqlite3').verbose();
    const { open } = require('sqlite');
    const dbPath = path.join(__dirname, 'ecommerce.db');
    return open({ filename: dbPath, driver: sqlite3.Database });
  } catch (err) {
    return initMemoryStore();
  }
}

module.exports = getDb;
