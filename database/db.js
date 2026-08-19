const path = require('path');

let memoryStore = null;

function initMemoryStore() {
  if (memoryStore) return memoryStore;

  const sampleProducts = [
    {
      id: 1,
      title: 'Aura Studio Wireless Noise-Canceling Headphones',
      description: 'Experience studio-grade audio with active noise cancellation, 40-hour battery life, spatial audio processing, and ultra-soft memory foam ear cushions.',
      category: 'Audio',
      price: 39.99,
      original_price: 79.99,
      rating: 4.8,
      reviews_count: 142,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
      ]),
      stock: 35,
      features: JSON.stringify(['Active Noise Cancellation', 'Bluetooth 5.3', '40hr Battery', 'Fast USB-C Charging']),
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Quantum Horizon Smartwatch Ultra',
      description: 'Titanium chassis smartwatch with AMOLED display, precision dual-frequency GPS, ECG monitor, depth gauge, and 7-day battery endurance.',
      category: 'Wearables',
      price: 49.99,
      original_price: 99.99,
      rating: 4.9,
      reviews_count: 89,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
      ]),
      stock: 20,
      features: JSON.stringify(['Sapphire Glass', 'Water Resistant 100m', 'Heart Rate & SpO2 Sensor']),
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Minimalist Artisan Leather Backpack',
      description: 'Handcrafted full-grain Italian leather laptop backpack with padded 16-inch laptop compartment, waterproof zippers, and ergonomic shoulder straps.',
      category: 'Accessories',
      price: 29.99,
      original_price: 49.99,
      rating: 4.7,
      reviews_count: 64,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
      ]),
      stock: 15,
      features: JSON.stringify(['Full-Grain Italian Leather', 'Padded 16" Laptop Sleeve', 'Hidden Security Pocket']),
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'HyperGlow Mechanical Gaming Keyboard',
      description: 'Custom hot-swappable mechanical keyboard featuring tactile Gateron switches, per-key RGB backlighting, aircraft aluminum frame, and PBT keycaps.',
      category: 'Electronics',
      price: 24.99,
      original_price: 39.99,
      rating: 4.6,
      reviews_count: 210,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
      ]),
      stock: 50,
      features: JSON.stringify(['Hot-Swappable PCB', 'Double-shot PBT Keycaps', 'Detachable Type-C Cable']),
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Lumina Ergonomic Desk Lamp with Wireless Charger',
      description: 'Sleek architectural LED desk lamp with touch dimming, color temperature adjustment (2700K-6500K), auto-brightness sensor, and 15W Qi wireless charger base.',
      category: 'Home & Living',
      price: 14.99,
      original_price: 24.99,
      rating: 4.5,
      reviews_count: 53,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'
      ]),
      stock: 40,
      features: JSON.stringify(['15W Fast Wireless Charging', 'Eye-Care Anti-Glare LED', 'Timer Auto-Shutoff']),
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      title: 'Precision Brew Thermal Coffee Maker',
      description: 'Barista-quality drip coffee maker with thermal carafe, precise temperature PID control, customizable bloom timing, and built-in bean grinder.',
      category: 'Home & Living',
      price: 34.99,
      original_price: 59.99,
      rating: 4.8,
      reviews_count: 118,
      image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80'
      ]),
      stock: 25,
      features: JSON.stringify(['Integrated Conical Burr Grinder', 'Double-Wall Stainless Steel Carafe']),
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      title: 'SonicPulse Waterproof Portable Speaker',
      description: 'IP67 dust and waterproof bluetooth speaker delivering deep bass and 360-degree room-filling acoustic sound with 24 hours playback.',
      category: 'Audio',
      price: 19.99,
      original_price: 29.99,
      rating: 4.7,
      reviews_count: 95,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80'
      ]),
      stock: 60,
      features: JSON.stringify(['IP67 Waterproof', '24hr Playtime', 'Rugged Rubber Armor']),
      created_at: new Date().toISOString()
    },
    {
      id: 8,
      title: 'ProVision 4K Ultra HD Drone Camera',
      description: 'Foldable quadcopter drone equipped with 3-axis gimbal 4K/60fps camera, 10km HD video transmission, obstacle avoidance, and 34min flight time.',
      category: 'Electronics',
      price: 129.99,
      original_price: 199.99,
      rating: 4.9,
      reviews_count: 167,
      image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80'
      ]),
      stock: 10,
      features: JSON.stringify(['4K 60fps Video', '3-Axis Mechanical Gimbal', '34 Min Flight Time']),
      created_at: new Date().toISOString()
    }
  ];

  const sampleUsers = [
    { id: 1, name: 'CodeAlpha Instructor', email: 'codealpha123@gmail.com', password: '$2a$10$YourHashedPasswordHere', role: 'admin', created_at: new Date().toISOString() },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com', password: '$2a$10$YourHashedPasswordHere', role: 'customer', created_at: new Date().toISOString() }
  ];

  const sampleOrders = [];
  const sampleOrderItems = [];
  const sampleReviews = [];

  memoryStore = {
    products: sampleProducts,
    users: sampleUsers,
    orders: sampleOrders,
    orderItems: sampleOrderItems,
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
      if (lowerSql.includes('from order_items')) {
        if (params.length > 0) {
          return sampleOrderItems.filter(i => i.order_id == params[0]);
        }
        return [...sampleOrderItems];
      }
      if (lowerSql.includes('from orders')) {
        if (params.length > 0 && lowerSql.includes('user_id =')) {
          return sampleOrders.filter(o => o.user_id == params[0]);
        }
        return [...sampleOrders];
      }
      if (lowerSql.includes('from reviews')) return [...sampleReviews];
      return [];
    },

    async get(sql, params = []) {
      const lowerSql = (sql || '').toLowerCase();
      if (lowerSql.includes('from products')) {
        return sampleProducts.find(p => p.id == params[0]) || sampleProducts[0];
      }
      if (lowerSql.includes('from users')) {
        return sampleUsers.find(u => u.email == params[0] || u.id == params[0]);
      }
      if (lowerSql.includes('from orders')) {
        if (lowerSql.includes('order_number =')) {
          return sampleOrders.find(o => o.order_number == params[0]);
        }
        return sampleOrders.find(o => o.id == params[0] || (params[1] && o.user_id == params[1]));
      }
      if (lowerSql.includes('sum(total_amount)')) {
        const totalRevenue = sampleOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        return { total_revenue: totalRevenue, total_orders: sampleOrders.length };
      }
      if (lowerSql.includes('count(*) as total_users')) {
        return { total_users: sampleUsers.length };
      }
      if (lowerSql.includes('count(*) as total_products')) {
        return { total_products: sampleProducts.length, total_stock: sampleProducts.reduce((sum, p) => sum + (p.stock || 0), 0) };
      }
      return null;
    },

    async run(sql, params = []) {
      const lowerSql = (sql || '').toLowerCase();
      if (lowerSql.includes('insert into orders')) {
        const newOrder = {
          id: sampleOrders.length + 1,
          user_id: params[0],
          order_number: params[1],
          total_amount: params[2],
          shipping_address: params[3] || '{}',
          payment_method: params[4] || 'Credit Card',
          payment_status: params[5] || 'Completed',
          status: params[6] || 'Processing',
          created_at: new Date().toISOString()
        };
        sampleOrders.unshift(newOrder);
        return { lastID: newOrder.id };
      }

      if (lowerSql.includes('insert into order_items')) {
        const newItem = {
          id: sampleOrderItems.length + 1,
          order_id: params[0],
          product_id: params[1],
          title: params[2],
          price: params[3],
          quantity: params[4],
          image: params[5]
        };
        sampleOrderItems.push(newItem);
        return { lastID: newItem.id };
      }

      if (lowerSql.includes('update products set stock')) {
        const qty = params[0];
        const prodId = params[1];
        const prod = sampleProducts.find(p => p.id == prodId);
        if (prod) prod.stock = Math.max(0, prod.stock - qty);
        return { changes: 1 };
      }

      if (lowerSql.includes('update orders set status')) {
        const status = params[0];
        const orderId = params[1];
        const order = sampleOrders.find(o => o.id == orderId);
        if (order) order.status = status;
        return { changes: 1 };
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
