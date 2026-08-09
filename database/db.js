const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

// On Vercel serverless environment, use /tmp or :memory: database
const isVercel = Boolean(process.env.VERCEL);
const dbPath = isVercel ? '/tmp/ecommerce.db' : path.join(__dirname, 'ecommerce.db');

let dbPromise = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}

module.exports = getDb;
