// Railway redeploy trigger
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Razorpay from 'razorpay';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import db, { initDb } from './database.ts';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'paws_secret_key_123';

// Razorpay Setup
const razorpay = new Razorpay({
  key_id: 'rzp_test_SVScCOC0D3Twzu',
  key_secret: 'P8Y8wlUi7yrJTL1HuldqIeHx',
});

app.use(cors());
app.use(express.json());

// Initialize DB and Seed Admin/Staff
initDb();

const seedUsers = () => {
  const admin = db.prepare('SELECT * FROM profiles WHERE email = ?').get('admin@paws.com');
  if (!admin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO profiles (email, password, role, name) VALUES (?, ?, ?, ?)').run(
      'admin@paws.com',
      hashedPassword,
      'admin',
      'Admin User'
    );
  }

  const staff = db.prepare('SELECT * FROM profiles WHERE email = ?').get('staff@paws.com');
  if (!staff) {
    const hashedPassword = bcrypt.hashSync('staff123', 10);
    db.prepare('INSERT INTO profiles (email, password, role, name) VALUES (?, ?, ?, ?)').run(
      'staff@paws.com',
      hashedPassword,
      'staff',
      'Staff User'
    );
  }
};
seedUsers();

const seedProducts = () => {
  const count: any = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (count.count === 0) {
    const products = [
      { name: 'Premium Puppy Food', description: 'High-protein formula for growing puppies.', price: 1200, stock: 50, category: 'Food', image_url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=800' },
      { name: 'Interactive Squeaky Toy', description: 'Durable rubber toy that keeps your pet engaged.', price: 450, stock: 100, category: 'Toys', image_url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800' },
      { name: 'Orthopedic Pet Bed', description: 'Memory foam bed for maximum comfort and joint support.', price: 2500, stock: 20, category: 'Accessories', image_url: 'https://images.unsplash.com/photo-1591768793355-74d7c836038c?auto=format&fit=crop&q=80&w=800' },
      { name: 'Catnip Infused Scratching Post', description: 'Keep your cat happy and your furniture safe.', price: 850, stock: 30, category: 'Toys', image_url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&q=80&w=800' }
    ];
    const insert = db.prepare('INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)');
    products.forEach(p => insert.run(p.name, p.description, p.price, p.stock, p.category, p.image_url));
  }
};
seedProducts();

const seedPets = () => {
  const count: any = db.prepare('SELECT COUNT(*) as count FROM pets').get();
  if (count.count === 0) {
    const pets = [
      { name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: 2, description: 'Friendly and energetic, loves playing fetch.', status: 'available', image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800' },
      { name: 'Luna', species: 'Cat', breed: 'Siamese', age: 1, description: 'Calm and affectionate, enjoys afternoon naps.', status: 'available', image_url: 'https://images.unsplash.com/photo-1513245535761-07742dd136ff?auto=format&fit=crop&q=80&w=800' },
      { name: 'Max', species: 'Dog', breed: 'German Shepherd', age: 3, description: 'Loyal and intelligent, great for active families.', status: 'available', image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=800' }
    ];
    const insert = db.prepare('INSERT INTO pets (name, species, breed, age, description, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
    pets.forEach(p => insert.run(p.name, p.species, p.breed, p.age, p.description, p.status, p.image_url));
  }
};
seedPets();

// Middleware: Auth
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare('INSERT INTO profiles (email, password, name) VALUES (?, ?, ?)').run(email, hashedPassword, name);
    res.json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare('SELECT * FROM profiles WHERE email = ?').get(email);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/auth/profile', authenticateToken, (req: any, res) => {
  const user = db.prepare('SELECT id, email, role, name, address, phone FROM profiles WHERE id = ?').get(req.user.id);
  res.json(user);
});

app.patch('/api/auth/profile', authenticateToken, (req: any, res) => {
  const { name, address, phone } = req.body;
  db.prepare('UPDATE profiles SET name = ?, address = ?, phone = ? WHERE id = ?').run(name, address, phone, req.user.id);
  const updatedUser = db.prepare('SELECT id, email, role, name, address, phone FROM profiles WHERE id = ?').get(req.user.id);
  res.json(updatedUser);
});

// --- PET ROUTES ---
app.get('/api/pets', (req, res) => {
  const status = req.query.status || 'available';
  const pets = db.prepare('SELECT * FROM pets WHERE status = ?').all(status);
  res.json(pets);
});

app.get('/api/pets/all', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') return res.sendStatus(403);
  const pets = db.prepare('SELECT * FROM pets').all();
  res.json(pets);
});

app.post('/api/pets', authenticateToken, (req: any, res) => {
  const { name, species, breed, age, description, image_url } = req.body;
  const status = req.user.role === 'admin' ? 'available' : 'pending_approval';
  const result = db.prepare('INSERT INTO pets (name, species, breed, age, description, image_url, status, submitted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(name, species, breed, age, description, image_url, status, req.user.id);
  res.json({ id: result.lastInsertRowid });
});

app.patch('/api/pets/:id/status', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { status } = req.body;
  db.prepare('UPDATE pets SET status = ? WHERE id = ?').run(status, req.params.id);
  
  // Notify user
  const pet: any = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id);
  db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(pet.submitted_by, `Your pet submission for ${pet.name} has been ${status}.`);
  
  res.json({ success: true });
});

// --- ADOPTION ROUTES ---
app.post('/api/adoptions', authenticateToken, (req: any, res) => {
  const { pet_id, application_text } = req.body;
  const result = db.prepare('INSERT INTO adoptions (pet_id, user_id, application_text) VALUES (?, ?, ?)').run(pet_id, req.user.id, application_text);
  res.json({ id: result.lastInsertRowid });
});

app.get('/api/adoptions/my', authenticateToken, (req: any, res) => {
  const adoptions = db.prepare(`
    SELECT adoptions.*, pets.name as pet_name, pets.image_url as pet_image 
    FROM adoptions 
    JOIN pets ON adoptions.pet_id = pets.id 
    WHERE adoptions.user_id = ?
  `).all(req.user.id);
  res.json(adoptions);
});

app.get('/api/adoptions/all', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const adoptions = db.prepare(`
    SELECT adoptions.*, pets.name as pet_name, profiles.name as user_name, profiles.email as user_email
    FROM adoptions 
    JOIN pets ON adoptions.pet_id = pets.id 
    JOIN profiles ON adoptions.user_id = profiles.id
  `).all();
  res.json(adoptions);
});

app.patch('/api/adoptions/:id/status', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { status } = req.body;
  const adoption: any = db.prepare('SELECT * FROM adoptions WHERE id = ?').get(req.params.id);
  
  if (!adoption) return res.status(404).json({ error: 'Adoption request not found' });

  db.prepare('UPDATE adoptions SET status = ? WHERE id = ?').run(status, req.params.id);
  
  if (status === 'approved') {
    db.prepare("UPDATE pets SET status = 'adopted' WHERE id = ?").run(adoption.pet_id);
  }
  
  db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(adoption.user_id, `Your adoption application for pet ID ${adoption.pet_id} has been ${status}.`);
  
  res.json({ success: true });
});

// --- SHOP ROUTES ---
app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

app.post('/api/products', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { name, description, price, stock, image_url, category } = req.body;
  const result = db.prepare('INSERT INTO products (name, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?)')
    .run(name, description, price, stock, image_url, category);
  res.json({ id: result.lastInsertRowid });
});

app.patch('/api/products/:id', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { name, description, price, stock, image_url, category } = req.body;
  db.prepare('UPDATE products SET name=?, description=?, price=?, stock=?, image_url=?, category=? WHERE id=?')
    .run(name, description, price, stock, image_url, category, req.params.id);
  res.json({ success: true });
});

app.delete('/api/products/:id', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- CART ROUTES ---
app.get('/api/cart', authenticateToken, (req: any, res) => {
  const items = db.prepare(`
    SELECT cart_items.*, products.name, products.price, products.image_url, products.stock
    FROM cart_items 
    JOIN products ON cart_items.product_id = products.id 
    WHERE cart_items.user_id = ?
  `).all(req.user.id);
  res.json(items);
});

app.post('/api/cart', authenticateToken, (req: any, res) => {
  const { product_id, quantity } = req.body;
  const existing: any = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
  
  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, product_id, quantity);
  }
  res.json({ success: true });
});

app.patch('/api/cart/:id', authenticateToken, (req: any, res) => {
  const { quantity } = req.body;
  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
  res.json({ success: true });
});

app.delete('/api/cart/:id', authenticateToken, (req: any, res) => {
  db.prepare('DELETE FROM cart_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- ORDER ROUTES ---
app.post('/api/orders/create', authenticateToken, async (req: any, res) => {
  const user: any = db.prepare('SELECT address, phone FROM profiles WHERE id = ?').get(req.user.id);
  
  if (!user.address || !user.phone) {
    return res.status(400).json({ error: 'Please update your delivery address and phone number in your profile before checking out.' });
  }

  const cartItems: any[] = db.prepare(`
    SELECT cart_items.*, products.price, products.stock, products.name
    FROM cart_items 
    JOIN products ON cart_items.product_id = products.id 
    WHERE cart_items.user_id = ?
  `).all(req.user.id);

  if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  let total = 0;
  for (const item of cartItems) {
    if (item.quantity > item.stock) return res.status(400).json({ error: `Not enough stock for ${item.name}` });
    total += item.price * item.quantity;
  }

  const options = {
    amount: Math.round(total * 100), // Razorpay expects paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const rzpOrder = await razorpay.orders.create(options);
    const result = db.prepare('INSERT INTO orders (user_id, total_amount, razorpay_order_id) VALUES (?, ?, ?)')
      .run(req.user.id, total, rzpOrder.id);
    
    const orderId = result.lastInsertRowid;
    for (const item of cartItems) {
      db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)')
        .run(orderId, item.product_id, item.quantity, item.price);
    }

    res.json({ rzpOrder, orderId });
  } catch (e) {
    res.status(500).json({ error: 'Razorpay order creation failed' });
  }
});

app.post('/api/orders/verify', authenticateToken, (req: any, res) => {
  const { razorpay_order_id, razorpay_payment_id, orderId } = req.body;
  
  const order: any = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  // In a real app, verify signature here. For MVP, we'll check order ID match.
  if (order.razorpay_order_id !== razorpay_order_id) {
    return res.status(400).json({ error: 'Payment verification failed: Order ID mismatch' });
  }

  const result = db.prepare("UPDATE orders SET status = 'paid', razorpay_payment_id = ? WHERE id = ?").run(razorpay_payment_id, orderId);
  
  if (result.changes === 0) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }

  // Update stock and clear cart
  const items: any[] = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  for (const item of items) {
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
  }
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  
  db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(req.user.id, `Your order #${orderId} has been paid successfully.`);
  
  res.json({ success: true });
});

app.get('/api/orders/my', authenticateToken, (req: any, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(orders);
});

app.get('/api/orders/all', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') return res.sendStatus(403);
  const orders = db.prepare(`
    SELECT orders.*, profiles.name as user_name, profiles.email as user_email, profiles.address, profiles.phone
    FROM orders 
    JOIN profiles ON orders.user_id = profiles.id 
    ORDER BY created_at DESC
  `).all();
  res.json(orders);
});

app.patch('/api/orders/:id/status', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') return res.sendStatus(403);
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  
  const order: any = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(order.user_id, `Your order #${req.params.id} status has been updated to ${status}.`);
  
  res.json({ success: true });
});

// --- MEDICAL ROUTES ---
app.get('/api/medical/:petId', authenticateToken, (req: any, res) => {
  const records = db.prepare('SELECT * FROM medical_records WHERE pet_id = ? ORDER BY created_at DESC').all(req.params.petId);
  res.json(records);
});

app.post('/api/medical', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'staff') return res.sendStatus(403);
  const { pet_id, vaccination_date, next_due_date, notes } = req.body;
  db.prepare('INSERT INTO medical_records (pet_id, vaccination_date, next_due_date, notes, staff_id) VALUES (?, ?, ?, ?, ?)')
    .run(pet_id, vaccination_date, next_due_date, notes, req.user.id);
  
  // Notify owner if pet is adopted
  const pet: any = db.prepare('SELECT * FROM pets WHERE id = ?').get(pet_id);
  if (pet.status === 'adopted') {
    const adoption: any = db.prepare("SELECT * FROM adoptions WHERE pet_id = ? AND status = 'approved'").get(pet_id);
    if (adoption) {
      db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(adoption.user_id, `New medical record added for ${pet.name}. Next due: ${next_due_date}`);
    }
  }
  
  res.json({ success: true });
});

// --- NOTIFICATION ROUTES ---
app.get('/api/notifications', authenticateToken, (req: any, res) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(notifications);
});

app.patch('/api/notifications/:id/read', authenticateToken, (req: any, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

app.post('/api/reminders', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'staff') return res.sendStatus(403);
  const { pet_id, message } = req.body;
  const pet: any = db.prepare('SELECT * FROM pets WHERE id = ?').get(pet_id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });

  if (pet.status === 'adopted') {
    const adoption: any = db.prepare("SELECT * FROM adoptions WHERE pet_id = ? AND status = 'approved'").get(pet_id);
    if (adoption) {
      db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(adoption.user_id, message);
    }
  } else if (pet.submitted_by) {
    db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(pet.submitted_by, message);
  }
  res.json({ success: true });
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
