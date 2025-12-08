import Database from 'better-sqlite3';

const db = new Database('garment-manager.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    price REAL NOT NULL,
    cost REAL DEFAULT 0,
    stock INTEGER DEFAULT 0,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total REAL NOT NULL,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER,
    item_id INTEGER,
    quantity INTEGER,
    price_at_sale REAL,
    FOREIGN KEY(sale_id) REFERENCES sales(id),
    FOREIGN KEY(item_id) REFERENCES items(id)
  );
`);

// Migrations for Phase 2
try { db.exec("ALTER TABLE items ADD COLUMN image_path TEXT"); } catch (e) { }
try { db.exec("ALTER TABLE items ADD COLUMN source TEXT"); } catch (e) { }
try { db.exec("ALTER TABLE sales ADD COLUMN discount REAL DEFAULT 0"); } catch (e) { }
try { db.exec("ALTER TABLE sales ADD COLUMN status TEXT DEFAULT 'completed'"); } catch (e) { }

export default db;
