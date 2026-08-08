CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  cover TEXT NOT NULL DEFAULT '',
  cover_banner TEXT NOT NULL DEFAULT '',
  rating REAL NOT NULL DEFAULT 5,
  sales INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  images TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  vendor_slug TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  needs_restock INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  dni TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL DEFAULT '',
  district TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  address_reference TEXT NOT NULL DEFAULT '',
  delivery_method TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_proof_url TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  subtotal REAL NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_confirmation',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS cash_closings (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  total_orders INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  top_payment_method TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
