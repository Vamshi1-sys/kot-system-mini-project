
import express from 'express';
const app = express();

import dotenv from 'dotenv';
dotenv.config();
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
app.use(express.json());

// Stripe Payment Intent route
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, currency = 'inr', metadata = {} } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import session from 'express-session';
import QRCode from 'qrcode';
import multer from 'multer';
import cors from 'cors';

declare module 'express-session' {
  interface SessionData {
    isAdmin: boolean;
    restaurantId: number;
  }
}
const PORT = 3000;
const db = new Database('database.db');

// Database Initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    menu_id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,
    item_name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    category TEXT,
    availability BOOLEAN DEFAULT 1,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,
    table_number INTEGER,
    total_price REAL,
    status TEXT DEFAULT 'Pending',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    item_name TEXT,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    type TEXT DEFAULT 'string'
  );
`);

// Preload Demo Data
const restaurantCount = db.prepare('SELECT COUNT(*) as count FROM restaurants').get() as { count: number };
if (restaurantCount.count === 0) {
  const insertRestaurant = db.prepare('INSERT INTO restaurants (restaurant_name, email, password) VALUES (?, ?, ?)');
  const insertMenuItem = db.prepare('INSERT INTO menu_items (restaurant_id, item_name, price, category, image) VALUES (?, ?, ?, ?, ?)');

  for (let i = 1; i <= 3; i++) {
    const res = insertRestaurant.run(`Demo Restaurant ${i}`, `demo${i}@example.com`, 'password123');
    const restaurantId = res.lastInsertRowid;

    insertMenuItem.run(restaurantId, 'Classic Burger', 150, 'Main Course', 'https://picsum.photos/seed/burger/200/200');
    insertMenuItem.run(restaurantId, 'Margherita Pizza', 250, 'Main Course', 'https://picsum.photos/seed/pizza/200/200');
    insertMenuItem.run(restaurantId, 'Chicken Biryani', 200, 'Main Course', 'https://picsum.photos/seed/biryani/200/200');
    insertMenuItem.run(restaurantId, 'Veg Fried Rice', 120, 'Main Course', 'https://picsum.photos/seed/rice/200/200');
    insertMenuItem.run(restaurantId, 'Cold Drink', 50, 'Beverages', 'https://picsum.photos/seed/drink/200/200');
  }
}

// Preload Default Settings
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare('INSERT INTO settings (key, value, description, category, type) VALUES (?, ?, ?, ?, ?)');
  insertSetting.run('app_name', 'Smart Kitchen', 'The name of the application displayed in the UI', 'General', 'string');
  insertSetting.run('currency_symbol', '₹', 'The currency symbol used for pricing', 'General', 'string');
  insertSetting.run('maintenance_mode', 'false', 'Enable or disable maintenance mode', 'System', 'boolean');
  insertSetting.run('enable_qr_ordering', 'true', 'Enable or disable QR-based ordering feature', 'Features', 'boolean');
  insertSetting.run('support_email', 'support@smartkitchen.com', 'Contact email for support', 'General', 'string');
  insertSetting.run('tax_percentage', '5', 'Default tax percentage applied to orders', 'Finance', 'number');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'smart-kitchen-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './static/images';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Ensure directories exist
if (!fs.existsSync('./qr_codes')) fs.mkdirSync('./qr_codes');
if (!fs.existsSync('./static/images')) fs.mkdirSync('./static/images', { recursive: true });

// API Routes

// Super Admin Auth (Hardcoded for demo)
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@smartkitchen.com' && password === 'admin123') {
    req.session.isAdmin = true;
    res.json({ success: true, role: 'admin' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Restaurant Auth
app.post('/api/restaurant/login', (req, res) => {
  const { email, password } = req.body;
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE email = ? AND password = ?').get(email, password) as any;
  if (restaurant) {
    req.session.restaurantId = restaurant.restaurant_id;
    res.json({ success: true, restaurantId: restaurant.restaurant_id, name: restaurant.restaurant_name });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Super Admin: Get Stats
app.get('/api/admin/stats', (req, res) => {
  const totalRestaurants = db.prepare('SELECT COUNT(*) as count FROM restaurants').get() as any;
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
  const totalRevenue = db.prepare('SELECT SUM(total_price) as sum FROM orders').get() as any;
  res.json({
    totalRestaurants: totalRestaurants.count,
    totalOrders: totalOrders.count,
    totalRevenue: totalRevenue.sum || 0
  });
});

// Super Admin: Manage Restaurants
app.get('/api/admin/restaurants', (req, res) => {
  const restaurants = db.prepare('SELECT * FROM restaurants').all();
  res.json(restaurants);
});

app.post('/api/admin/restaurants', (req, res) => {
  const { name, email, password } = req.body;
  try {
    db.prepare('INSERT INTO restaurants (restaurant_name, email, password) VALUES (?, ?, ?)').run(name, email, password);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Email already exists' });
  }
});

app.delete('/api/admin/restaurants/:id', (req, res) => {
  db.prepare('DELETE FROM restaurants WHERE restaurant_id = ?').run(req.params.id);
  res.json({ success: true });
});

app.patch('/api/admin/restaurants/:id', (req, res) => {
  const { name, email, password } = req.body;
  db.prepare('UPDATE restaurants SET restaurant_name = ?, email = ?, password = ? WHERE restaurant_id = ?')
    .run(name, email, password, req.params.id);
  res.json({ success: true });
});

// Super Admin: Settings Management
app.get('/api/settings/public', (req, res) => {
  const publicKeys = ['app_name', 'currency_symbol', 'maintenance_mode', 'enable_qr_ordering', 'support_email'];
  const settings = db.prepare(`SELECT key, value FROM settings WHERE key IN (${publicKeys.map(() => '?').join(',')})`).all(publicKeys);
  const settingsMap = settings.reduce((acc: any, s: any) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
  res.json(settingsMap);
});

app.get('/api/admin/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  res.json(settings);
});

app.post('/api/admin/settings', (req, res) => {
  const settings = req.body; // Expecting an array of { key, value }
  const updateSetting = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
  
  const transaction = db.transaction((settingsList) => {
    for (const setting of settingsList) {
      updateSetting.run(setting.value, setting.key);
    }
  });

  try {
    transaction(settings);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// Restaurant: Dashboard Stats
app.get('/api/restaurant/:id/stats', (req, res) => {
  const id = req.params.id;
  const ordersToday = db.prepare("SELECT COUNT(*) as count FROM orders WHERE restaurant_id = ? AND date(created_time) = date('now')").get(id) as any;
  const activeOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE restaurant_id = ? AND status != 'Completed'").get(id) as any;
  const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE restaurant_id = ? AND status = 'Completed'").get(id) as any;
  res.json({
    ordersToday: ordersToday.count,
    activeOrders: activeOrders.count,
    completedOrders: completedOrders.count
  });
});

// Restaurant: Menu Management
app.get('/api/restaurant/:id/menu', (req, res) => {
  const menu = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ?').all(req.params.id);
  res.json(menu);
});

app.post('/api/restaurant/:id/menu', upload.single('image'), (req, res) => {
  const { name, price, category, availability } = req.body;
  const image = req.file ? `/static/images/${req.file.filename}` : 'https://picsum.photos/seed/food/200/200';
  db.prepare('INSERT INTO menu_items (restaurant_id, item_name, price, category, availability, image) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.params.id, name, price, category, availability === 'true' ? 1 : 0, image);
  res.json({ success: true });
});

app.delete('/api/menu/:id', (req, res) => {
  db.prepare('DELETE FROM menu_items WHERE menu_id = ?').run(req.params.id);
  res.json({ success: true });
});

app.patch('/api/menu/:id', upload.single('image'), (req, res) => {
  const { name, price, category, availability } = req.body;
  const item = db.prepare('SELECT image FROM menu_items WHERE menu_id = ?').get(req.params.id) as any;
  const image = req.file ? `/static/images/${req.file.filename}` : item.image;
  
  db.prepare('UPDATE menu_items SET item_name = ?, price = ?, category = ?, availability = ?, image = ? WHERE menu_id = ?')
    .run(name, price, category, availability === 'true' ? 1 : 0, image, req.params.id);
  res.json({ success: true });
});

// Customer: Get Restaurant Menu
app.get('/api/menu', (req, res) => {
  const { restaurant_id } = req.query;
  const menu = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ? AND availability = 1').all(restaurant_id);
  const restaurant = db.prepare('SELECT restaurant_name FROM restaurants WHERE restaurant_id = ?').get(restaurant_id) as any;
  res.json({ menu, restaurantName: restaurant?.restaurant_name });
});

// Customer: Place Order
app.post('/api/orders', async (req, res) => {
  const { restaurant_id, table_number, items, total_price, paymentIntentId } = req.body;
  try {
    // Require payment before order is created
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({ error: 'Payment not completed' });
    }
    const result = db.prepare('INSERT INTO orders (restaurant_id, table_number, total_price) VALUES (?, ?, ?)')
      .run(restaurant_id, table_number, total_price);
    const orderId = result.lastInsertRowid;
    const insertItem = db.prepare('INSERT INTO order_items (order_id, item_name, quantity, price) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      insertItem.run(orderId, item.item_name, item.quantity, item.price);
    }
    res.json({ success: true, orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer: Order Status
app.get('/api/orders/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(req.params.id);
  res.json(order);
});

// Kitchen: Get Active Orders
app.get('/api/restaurant/:id/kitchen', (req, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE restaurant_id = ? AND status != 'Completed' ORDER BY created_time DESC").all(req.params.id) as any[];
  const ordersWithItems = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.order_id);
    return { ...order, items };
  });
  res.json(ordersWithItems);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE order_id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// QR Code Generation
app.get('/api/restaurant/:id/qr', async (req, res) => {
  const { table } = req.query;
  const restaurantId = req.params.id;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const url = `${appUrl}/menu?restaurant_id=${restaurantId}&table=${table}`;
  
  try {
    const qrDataUrl = await QRCode.toDataURL(url);
    res.json({ qrDataUrl, url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Serve static files
app.use('/static', express.static('static'));

// Vite setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
