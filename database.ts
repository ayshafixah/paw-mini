// Railway redeploy trigger
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'paws.db');

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize Database Schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user', -- 'user', 'admin', 'staff'
      name TEXT,
      address TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: Add address and phone if they don't exist (for existing databases)
  const tableInfo = db.prepare("PRAGMA table_info(profiles)").all() as any[];
  const columns = tableInfo.map(c => c.name);
  
  if (!columns.includes('address')) {
    db.exec("ALTER TABLE profiles ADD COLUMN address TEXT");
  }
  if (!columns.includes('phone')) {
    db.exec("ALTER TABLE profiles ADD COLUMN phone TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      species TEXT,
      breed TEXT,
      age INTEGER,
      description TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'pending_approval', -- 'available', 'adopted', 'pending_approval', 'rejected'
      submitted_by INTEGER,
      FOREIGN KEY(submitted_by) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS adoptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER,
      user_id INTEGER,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      application_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(pet_id) REFERENCES pets(id),
      FOREIGN KEY(user_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL,
      stock INTEGER,
      image_url TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      FOREIGN KEY(user_id) REFERENCES profiles(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_amount REAL,
      status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped'
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      price_at_purchase REAL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER,
      vaccination_date DATE,
      next_due_date DATE,
      notes TEXT,
      staff_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(pet_id) REFERENCES pets(id),
      FOREIGN KEY(staff_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES profiles(id)
    );
  `);
}

export default db;
