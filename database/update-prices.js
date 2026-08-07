const getDb = require('./db');

async function updatePrices() {
  const db = await getDb();
  console.log('Updating product prices in database...');

  const priceUpdates = [
    { titleLike: '%Headphones%', price: 39.99, original_price: 79.99 },
    { titleLike: '%Smartwatch%', price: 49.99, original_price: 99.99 },
    { titleLike: '%Backpack%', price: 29.99, original_price: 49.99 },
    { titleLike: '%Keyboard%', price: 24.99, original_price: 39.99 },
    { titleLike: '%Lamp%', price: 14.99, original_price: 24.99 },
    { titleLike: '%Coffee Maker%', price: 34.99, original_price: 59.99 },
    { titleLike: '%Speaker%', price: 19.99, original_price: 29.99 },
    { titleLike: '%Drone%', price: 89.99, original_price: 149.99 }
  ];

  for (const item of priceUpdates) {
    await db.run(
      'UPDATE products SET price = ?, original_price = ? WHERE title LIKE ?',
      [item.price, item.original_price, item.titleLike]
    );
  }

  console.log('All product prices successfully decreased!');
}

updatePrices().catch(console.error);
