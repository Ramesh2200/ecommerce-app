const getDb = require('../database/db');

// Create a new order
async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod, promoCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
    }

    const db = await getDb();

    // Verify stock and compute total
    let calculatedSubtotal = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      const product = await db.get('SELECT * FROM products WHERE id = ?', [item.id]);

      if (!product) {
        return res.status(400).json({ success: false, message: `Product ID ${item.id} not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Only ${product.stock} items remaining.`
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      orderItemsToInsert.push({
        product_id: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Apply promo code discount if valid
    let discount = 0;
    if (promoCode && promoCode.toUpperCase() === 'CODEALPHA10') {
      discount = calculatedSubtotal * 0.10; // 10% OFF
    } else if (promoCode && promoCode.toUpperCase() === 'WELCOME20') {
      discount = calculatedSubtotal * 0.20; // 20% OFF
    }

    const shippingFee = calculatedSubtotal > 150 ? 0 : 9.99;
    const tax = calculatedSubtotal * 0.08;
    const finalTotal = Math.max(0, calculatedSubtotal - discount + shippingFee + tax);

    // Generate Order Number: ORD-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    // Begin Order Insertion
    const orderRes = await db.run(
      `INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_method, payment_status, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        orderNumber,
        parseFloat(finalTotal.toFixed(2)),
        JSON.stringify(shippingAddress),
        paymentMethod || 'Credit Card',
        'Completed',
        'Processing'
      ]
    );

    const orderId = orderRes.lastID;

    // Insert Order Items and Update Product Stock
    for (const item of orderItemsToInsert) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, title, price, quantity, image)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.title, item.price, item.quantity, item.image]
      );

      // Deduct Stock
      await db.run(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        order_number: orderNumber,
        total_amount: parseFloat(finalTotal.toFixed(2)),
        items_count: orderItemsToInsert.length,
        status: 'Processing',
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while processing order.' });
  }
}

function safeParseJson(data, fallback = {}) {
  if (!data) return fallback;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
}

// Get logged in user's orders
async function getUserOrders(req, res) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    const orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    // Attach items to each order
    const ordersWithItems = [];
    for (const order of (orders || [])) {
      const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      ordersWithItems.push({
        ...order,
        shipping_address: safeParseJson(order.shipping_address, { fullName: 'Customer', city: '' }),
        items: items || []
      });
    }

    return res.json({
      success: true,
      orders: ordersWithItems
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order history.' });
  }
}

// Get order details by ID
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const db = await getDb();

    const order = await db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    return res.json({
      success: true,
      order: {
        ...order,
        shipping_address: safeParseJson(order.shipping_address, { fullName: 'Customer', city: '' }),
        items: items || []
      }
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
}

// Admin: Get analytics dashboard metrics
async function getDashboardMetrics(req, res) {
  try {
    const db = await getDb();

    const revenueRes = await db.get('SELECT SUM(total_amount) as total_revenue, COUNT(*) as total_orders FROM orders');
    const userCount = await db.get('SELECT COUNT(*) as total_users FROM users WHERE role = "customer"');
    const productCount = await db.get('SELECT COUNT(*) as total_products, SUM(stock) as total_stock FROM products');
    const recentOrders = await db.all('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');

    const ordersWithItems = [];
    for (const order of (recentOrders || [])) {
      const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      ordersWithItems.push({
        ...order,
        shipping_address: safeParseJson(order.shipping_address, { fullName: 'Customer', city: '' }),
        items: items || []
      });
    }

    const totalRevenue = (revenueRes && revenueRes.total_revenue) || 0;
    const totalOrders = (revenueRes && revenueRes.total_orders) || 0;

    return res.json({
      success: true,
      metrics: {
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        total_orders: totalOrders,
        total_users: (userCount && userCount.total_users) || 0,
        total_products: (productCount && productCount.total_products) || 0,
        total_stock: (productCount && productCount.total_stock) || 0,
        avg_order_value: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0
      },
      recentOrders: ordersWithItems
    });
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics metrics.' });
  }
}

// Admin: Update order status
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const db = await getDb();
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    return res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
}

// Track order by Order Number (Public / Confirmed details lookup)
async function trackOrderByNumber(req, res) {
  try {
    const { orderNumber } = req.params;
    const db = await getDb();

    const order = await db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);

    if (!order) {
      return res.status(404).json({ success: false, message: `Order #${orderNumber} not found.` });
    }

    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    let shippingAddress = {};
    try {
      shippingAddress = JSON.parse(order.shipping_address);
    } catch (e) {
      shippingAddress = {};
    }

    return res.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        created_at: order.created_at,
        shipping_address: {
          fullName: shippingAddress.fullName || 'Customer',
          city: shippingAddress.city || '',
          country: shippingAddress.country || ''
        },
        items
      }
    });

  } catch (error) {
    console.error('Error tracking order:', error);
    return res.status(500).json({ success: false, message: 'Failed to lookup order.' });
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  trackOrderByNumber,
  getDashboardMetrics,
  updateOrderStatus
};

