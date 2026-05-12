import express from 'express';
import cors from 'cors';
import multer from 'multer';
import QRCode from 'qrcode';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

type Restaurant = {
  restaurant_id: number;
  restaurant_name: string;
  email: string;
  password: string;
  created_at: string;
};

type MenuItem = {
  menu_id: number;
  restaurant_id: number;
  item_name: string;
  price: number;
  image: string;
  category: string;
  availability: number;
};

type Order = {
  order_id: number;
  restaurant_id: number;
  table_number: number;
  total_price: number;
  status: 'Pending' | 'Preparing' | 'Completed';
  created_time: string;
};

type OrderItem = {
  order_item_id: number;
  order_id: number;
  item_name: string;
  quantity: number;
  price: number;
};

type Setting = {
  key: string;
  value: string;
  description: string;
  category: string;
  type: string;
};

type Store = {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  orderItems: OrderItem[];
  settings: Setting[];
  counters: {
    restaurantId: number;
    menuId: number;
    orderId: number;
    orderItemId: number;
  };
};

const storeFile = path.join(os.tmpdir(), 'smart-kitchen-demo-store.json');
const upload = multer({ storage: multer.memoryStorage() });
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function nowIso() {
  return new Date().toISOString();
}

function seedStore(): Store {
  const restaurants: Restaurant[] = [];
  const menuItems: MenuItem[] = [];
  let menuId = 1;

  const seeds = [
    {
      name: 'Demo Restaurant 1',
      email: 'demo1@example.com',
      password: 'password123',
      seed: 'burger-1',
    },
    {
      name: 'Demo Restaurant 2',
      email: 'demo2@example.com',
      password: 'password123',
      seed: 'burger-2',
    },
    {
      name: 'Demo Restaurant 3',
      email: 'demo3@example.com',
      password: 'password123',
      seed: 'burger-3',
    },
  ];

  seeds.forEach((item, index) => {
    const restaurantId = index + 1;
    restaurants.push({
      restaurant_id: restaurantId,
      restaurant_name: item.name,
      email: item.email,
      password: item.password,
      created_at: nowIso(),
    });

    [
      ['Classic Burger', 150, 'Main Course', `https://picsum.photos/seed/${item.seed}-1/200/200`],
      ['Margherita Pizza', 250, 'Main Course', `https://picsum.photos/seed/${item.seed}-2/200/200`],
      ['Chicken Biryani', 200, 'Main Course', `https://picsum.photos/seed/${item.seed}-3/200/200`],
      ['Veg Fried Rice', 120, 'Main Course', `https://picsum.photos/seed/${item.seed}-4/200/200`],
      ['Cold Drink', 50, 'Beverages', `https://picsum.photos/seed/${item.seed}-5/200/200`],
    ].forEach(([name, price, category, image]) => {
      menuItems.push({
        menu_id: menuId++,
        restaurant_id: restaurantId,
        item_name: String(name),
        price: Number(price),
        category: String(category),
        image: String(image),
        availability: 1,
      });
    });
  });

  return {
    restaurants,
    menuItems,
    orders: [],
    orderItems: [],
    settings: [
      {
        key: 'app_name',
        value: 'Smart Kitchen',
        description: 'The name of the application displayed in the UI',
        category: 'General',
        type: 'string',
      },
      {
        key: 'currency_symbol',
        value: '₹',
        description: 'The currency symbol used for pricing',
        category: 'General',
        type: 'string',
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Enable or disable maintenance mode',
        category: 'System',
        type: 'boolean',
      },
      {
        key: 'enable_qr_ordering',
        value: 'true',
        description: 'Enable or disable QR-based ordering feature',
        category: 'Features',
        type: 'boolean',
      },
      {
        key: 'support_email',
        value: 'support@smartkitchen.com',
        description: 'Contact email for support',
        category: 'General',
        type: 'string',
      },
      {
        key: 'tax_percentage',
        value: '5',
        description: 'Default tax percentage applied to orders',
        category: 'Finance',
        type: 'number',
      },
    ],
    counters: {
      restaurantId: restaurants.length,
      menuId: menuId - 1,
      orderId: 0,
      orderItemId: 0,
    },
  };
}

function readStore(): Store {
  try {
    if (!fs.existsSync(storeFile)) {
      const seeded = seedStore();
      fs.writeFileSync(storeFile, JSON.stringify(seeded, null, 2), 'utf8');
      return seeded;
    }

    const raw = fs.readFileSync(storeFile, 'utf8');
    const parsed = JSON.parse(raw) as Store;
    if (!parsed?.restaurants || !parsed?.menuItems || !parsed?.settings || !parsed?.counters) {
      throw new Error('Invalid store');
    }
    return parsed;
  } catch {
    const seeded = seedStore();
    fs.writeFileSync(storeFile, JSON.stringify(seeded, null, 2), 'utf8');
    return seeded;
  }
}

function writeStore(store: Store) {
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf8');
}

function getSettingsMap(store: Store) {
  return store.settings.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRestaurantName(store: Store, restaurantId: number) {
  return store.restaurants.find((restaurant) => restaurant.restaurant_id === restaurantId)?.restaurant_name || '';
}

app.post('/api/create-payment-intent', (req, res) => {
  const { amount } = req.body || {};
  res.json({ clientSecret: `demo_client_secret_${amount ?? Date.now()}`, demo: true });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email === 'admin@smartkitchen.com' && password === 'admin123') {
    res.json({ success: true, role: 'admin' });
    return;
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/restaurant/login', (req, res) => {
  const { email, password } = req.body || {};
  const store = readStore();
  const restaurant = store.restaurants.find((item) => item.email === email && item.password === password);

  if (!restaurant) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  res.json({
    success: true,
    restaurantId: restaurant.restaurant_id,
    name: restaurant.restaurant_name,
  });
});

app.get('/api/settings/public', (_req, res) => {
  const store = readStore();
  const publicKeys = ['app_name', 'currency_symbol', 'maintenance_mode', 'enable_qr_ordering', 'support_email'];
  const settings = Object.fromEntries(
    publicKeys.map((key) => [key, store.settings.find((setting) => setting.key === key)?.value ?? ''])
  );
  res.json(settings);
});

app.get('/api/admin/settings', (_req, res) => {
  const store = readStore();
  res.json(store.settings);
});

app.post('/api/admin/settings', (req, res) => {
  const store = readStore();
  const settings = Array.isArray(req.body) ? req.body : [];

  settings.forEach((setting: { key: string; value: string }) => {
    const existing = store.settings.find((item) => item.key === setting.key);
    if (existing) {
      existing.value = setting.value;
    }
  });

  writeStore(store);
  res.json({ success: true });
});

app.get('/api/admin/stats', (_req, res) => {
  const store = readStore();
  const totalRevenue = store.orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);

  res.json({
    totalRestaurants: store.restaurants.length,
    totalOrders: store.orders.length,
    totalRevenue,
  });
});

app.get('/api/admin/restaurants', (_req, res) => {
  const store = readStore();
  res.json(store.restaurants);
});

app.post('/api/admin/restaurants', (req, res) => {
  const store = readStore();
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Missing restaurant details' });
    return;
  }

  if (store.restaurants.some((restaurant) => restaurant.email === email)) {
    res.status(400).json({ success: false, message: 'Email already exists' });
    return;
  }

  const restaurantId = store.counters.restaurantId + 1;
  store.counters.restaurantId = restaurantId;
  store.restaurants.push({
    restaurant_id: restaurantId,
    restaurant_name: name,
    email,
    password,
    created_at: nowIso(),
  });

  writeStore(store);
  res.json({ success: true });
});

app.patch('/api/admin/restaurants/:id', (req, res) => {
  const store = readStore();
  const restaurantId = toNumber(req.params.id);
  const { name, email, password } = req.body || {};
  const restaurant = store.restaurants.find((item) => item.restaurant_id === restaurantId);

  if (!restaurant) {
    res.status(404).json({ success: false, message: 'Restaurant not found' });
    return;
  }

  restaurant.restaurant_name = name ?? restaurant.restaurant_name;
  restaurant.email = email ?? restaurant.email;
  restaurant.password = password ?? restaurant.password;
  writeStore(store);
  res.json({ success: true });
});

app.delete('/api/admin/restaurants/:id', (req, res) => {
  const store = readStore();
  const restaurantId = toNumber(req.params.id);
  const removedOrderIds = new Set(store.orders.filter((order) => order.restaurant_id === restaurantId).map((order) => order.order_id));
  store.restaurants = store.restaurants.filter((restaurant) => restaurant.restaurant_id !== restaurantId);
  store.menuItems = store.menuItems.filter((item) => item.restaurant_id !== restaurantId);
  store.orders = store.orders.filter((order) => order.restaurant_id !== restaurantId);
  store.orderItems = store.orderItems.filter((item) => !removedOrderIds.has(item.order_id));
  writeStore(store);
  res.json({ success: true });
});

app.get('/api/restaurant/:id/stats', (req, res) => {
  const store = readStore();
  const restaurantId = toNumber(req.params.id);
  const today = new Date().toDateString();
  const restaurantOrders = store.orders.filter((order) => order.restaurant_id === restaurantId);

  res.json({
    ordersToday: restaurantOrders.filter((order) => new Date(order.created_time).toDateString() === today).length,
    activeOrders: restaurantOrders.filter((order) => order.status !== 'Completed').length,
    completedOrders: restaurantOrders.filter((order) => order.status === 'Completed').length,
  });
});

app.get('/api/restaurant/:id/menu', (req, res) => {
  const store = readStore();
  const restaurantId = toNumber(req.params.id);
  res.json(store.menuItems.filter((item) => item.restaurant_id === restaurantId));
});

app.post('/api/restaurant/:id/menu', upload.single('image'), (req, res) => {
  const store = readStore();
  const restaurantId = toNumber(req.params.id);
  const { name, price, category, availability } = req.body || {};

  if (!name || !price) {
    res.status(400).json({ success: false, message: 'Missing menu item details' });
    return;
  }

  const menuId = store.counters.menuId + 1;
  store.counters.menuId = menuId;
  store.menuItems.push({
    menu_id: menuId,
    restaurant_id: restaurantId,
    item_name: name,
    price: Number(price),
    category: category || 'Main Course',
    availability: availability === 'false' ? 0 : 1,
    image: `https://picsum.photos/seed/menu-${menuId}/200/200`,
  });

  writeStore(store);
  res.json({ success: true });
});

app.patch('/api/menu/:id', upload.single('image'), (req, res) => {
  const store = readStore();
  const menuId = toNumber(req.params.id);
  const { name, price, category, availability } = req.body || {};
  const item = store.menuItems.find((menuItem) => menuItem.menu_id === menuId);

  if (!item) {
    res.status(404).json({ success: false, message: 'Menu item not found' });
    return;
  }

  item.item_name = name ?? item.item_name;
  item.price = price !== undefined ? Number(price) : item.price;
  item.category = category ?? item.category;
  item.availability = availability === 'false' ? 0 : 1;
  writeStore(store);
  res.json({ success: true });
});

app.delete('/api/menu/:id', (req, res) => {
  const store = readStore();
  const menuId = toNumber(req.params.id);
  store.menuItems = store.menuItems.filter((item) => item.menu_id !== menuId);
  writeStore(store);
  res.json({ success: true });
});

app.get('/api/menu', (req, res) => {
  const store = readStore();
  const restaurantId = toNumber(req.query.restaurant_id);
  const restaurant = store.restaurants.find((item) => item.restaurant_id === restaurantId);
  const menu = store.menuItems.filter((item) => item.restaurant_id === restaurantId && item.availability === 1);
  res.json({ menu, restaurantName: restaurant?.restaurant_name ?? '' });
});

app.post('/api/orders', (req, res) => {
  const store = readStore();
  const { restaurant_id, table_number, items, total_price } = req.body || {};

  if (!restaurant_id || !Array.isArray(items)) {
    res.status(400).json({ error: 'Invalid order payload' });
    return;
  }

  const orderId = store.counters.orderId + 1;
  store.counters.orderId = orderId;
  const created_time = nowIso();

  store.orders.push({
    order_id: orderId,
    restaurant_id: toNumber(restaurant_id),
    table_number: toNumber(table_number),
    total_price: Number(total_price || 0),
    status: 'Pending',
    created_time,
  });

  items.forEach((item: { item_name: string; quantity: number; price: number }) => {
    const orderItemId = store.counters.orderItemId + 1;
    store.counters.orderItemId = orderItemId;
    store.orderItems.push({
      order_item_id: orderItemId,
      order_id: orderId,
      item_name: item.item_name,
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
    });
  });

  writeStore(store);
  res.json({ success: true, orderId });
});

app.get('/api/orders/:id', (req, res) => {
  const store = readStore();
  const orderId = toNumber(req.params.id);
  const order = store.orders.find((item) => item.order_id === orderId);
  if (!order) {
    res.status(404).json(null);
    return;
  }

  res.json({
    ...order,
    items: store.orderItems.filter((item) => item.order_id === orderId),
  });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const store = readStore();
  const orderId = toNumber(req.params.id);
  const { status } = req.body || {};
  const order = store.orders.find((item) => item.order_id === orderId);

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  order.status = status;
  writeStore(store);
  res.json({ success: true });
});

app.get('/api/restaurant/:id/kitchen', (req, res) => {
  const store = readStore();
  const restaurantId = toNumber(req.params.id);
  const orders = store.orders.filter((order) => order.restaurant_id === restaurantId && order.status !== 'Completed');
  res.json(
    orders.map((order) => ({
      ...order,
      items: store.orderItems.filter((item) => item.order_id === order.order_id),
    }))
  );
});

app.get('/api/restaurant/orders', (req, res) => {
  const store = readStore();
  const restaurantId = toNumber(req.query.restaurant_id);

  if (!restaurantId) {
    res.status(400).json({ error: 'restaurant_id is required' });
    return;
  }

  const orders = store.orders
    .filter((order) => order.restaurant_id === restaurantId)
    .map((order) => ({
      ...order,
      items: store.orderItems.filter((item) => item.order_id === order.order_id),
    }))
    .sort((a, b) => b.order_id - a.order_id);

  res.json({ orders });
});

app.get('/api/restaurant/:id/qr', async (req, res) => {
  const restaurantId = toNumber(req.params.id);
  const table = req.query.table || '1';
  const host = req.headers.host || 'localhost:5174';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const url = `${protocol}://${host}/menu?restaurant_id=${restaurantId}&table=${table}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(url);
    res.json({ qrDataUrl, url });
  } catch {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

export default function handler(req: any, res: any) {
  // Ensure body is parsed properly for Vercel
  return new Promise((resolve) => {
    app(req, res, () => {
      resolve(undefined);
    });
  });
}
