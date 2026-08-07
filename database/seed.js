const getDb = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  const db = await getDb();

  console.log('Creating database tables...');

  // Create Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      rating REAL DEFAULT 4.5,
      reviews_count INTEGER DEFAULT 12,
      image TEXT NOT NULL,
      gallery TEXT,
      stock INTEGER DEFAULT 50,
      features TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Reviews table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  // Create Orders table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_number TEXT UNIQUE NOT NULL,
      total_amount REAL NOT NULL,
      shipping_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'Completed',
      status TEXT DEFAULT 'Processing',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create Order Items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Seed Users
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding initial users...');
    const hashedAdminPw = await bcrypt.hash('admin123', 10);
    const hashedUserPw = await bcrypt.hash('user123', 10);

    await db.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Alex Mercer', 'admin@codealpha.tech', hashedAdminPw, 'admin']
    );

    await db.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Jane Doe', 'jane@example.com', hashedUserPw, 'customer']
    );
  }

  // Seed Products
  const productCount = await db.get('SELECT COUNT(*) as count FROM products');
  if (productCount.count === 0) {
    console.log('Seeding initial products...');

    const initialProducts = [
      {
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
        features: JSON.stringify(['Active Noise Cancellation', 'Bluetooth 5.3', '40hr Battery', 'Fast USB-C Charging', 'Built-in Mic array'])
      },
      {
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
        features: JSON.stringify(['Sapphire Glass', 'Water Resistant 100m', 'Heart Rate & SpO2 Sensor', 'Customizable Watch Faces'])
      },
      {
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
        features: JSON.stringify(['Full-Grain Italian Leather', 'Padded 16" Laptop Sleeve', 'Hidden Security Pocket', 'Luggage Pass-Through'])
      },
      {
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
        features: JSON.stringify(['Hot-Swappable PCB', 'Double-shot PBT Keycaps', 'Detachable Type-C Cable', 'Programmable Macros'])
      },
      {
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
        features: JSON.stringify(['15W Fast Wireless Charging', 'Eye-Care Anti-Glare LED', '5 Color Modes & 10 Brightness Levels', 'Timer Auto-Shutoff'])
      },
      {
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
        features: JSON.stringify(['Integrated Conical Burr Grinder', 'Double-Wall Stainless Steel Carafe', 'Programmable 24hr Timer'])
      },
      {
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
        features: JSON.stringify(['IP67 Waterproof', 'Party Sync Mode (Pair 2+)', '24hr Playtime', 'Rugged Rubber Armor'])
      },
      {
        title: 'ProVision 4K Ultra HD Drone Camera',
        description: 'Foldable quadcopter drone equipped with 3-axis gimbal 4K/60fps camera, 10km HD video transmission, obstacle avoidance, and 34min flight time.',
        category: 'Electronics',
        price: 89.99,
        original_price: 149.99,
        rating: 4.9,
        reviews_count: 76,
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'
        ]),
        stock: 12,
        features: JSON.stringify(['4K 60fps HDR Video', 'Omnidirectional Obstacle Sensing', '34 Mins Flight Time', 'Smart Return to Home'])
      }
    ];

    for (const p of initialProducts) {
      const res = await db.run(
        `INSERT INTO products (title, description, category, price, original_price, rating, reviews_count, image, gallery, stock, features)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.title, p.description, p.category, p.price, p.original_price, p.rating, p.reviews_count, p.image, p.gallery, p.stock, p.features]
      );

      // Add sample reviews for each product
      await db.run(
        `INSERT INTO reviews (product_id, user_name, rating, comment, date) VALUES (?, ?, ?, ?, ?)`,
        [res.lastID, 'David Miller', 5, 'Absolute top notch quality! Exceeded my expectations.', '2026-08-01 10:30:00']
      );
      await db.run(
        `INSERT INTO reviews (product_id, user_name, rating, comment, date) VALUES (?, ?, ?, ?, ?)`,
        [res.lastID, 'Sarah Jenkins', 4, 'Great performance and build. Super fast shipping!', '2026-08-03 14:15:00']
      );
    }
  }

  console.log('Database initialized and seeded successfully!');
}

seed().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
