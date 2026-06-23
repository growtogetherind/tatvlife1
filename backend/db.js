import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, 'db.json');

// Preseeded data
const DEFAULT_CATEGORIES = [
  { id: 'sexual-health', name: 'Sexual Health', slug: 'sexual-health' },
  { id: 'hair-loss', name: 'Hair Loss', slug: 'hair-loss' },
  { id: 'skin-care', name: 'Skin Care', slug: 'skin-care' },
  { id: 'muscle-growth', name: 'Muscle Growth', slug: 'muscle-growth' }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'sildenafil-pills-25mg',
    name: 'Sildenafil Pills (Viagra Generic) - 25mg',
    slug: 'sildenafil-pills-25mg',
    description: 'Oral tablets used for erectile dysfunction. Take 30-60 minutes before activity.',
    manufacturer: 'Generic',
    price: 18.00,
    stock: 100,
    dosage: '25mg',
    side_effects: 'Headache, flushing, upset stomach, abnormal vision, nasal congestion, back pain, muscle pain, nausea, dizziness, rash.',
    category_id: 'sexual-health',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/viagra25/400/400',
    pack_size: '4x10 pills'
  },
  {
    id: 'sildenafil-pills-50mg',
    name: 'Sildenafil Pills (Viagra Generic) - 50mg',
    slug: 'sildenafil-pills-50mg',
    description: 'Oral tablets used for erectile dysfunction. Take 30-60 minutes before activity.',
    manufacturer: 'Generic',
    price: 28.00,
    stock: 100,
    dosage: '50mg',
    side_effects: 'Headache, flushing, upset stomach, abnormal vision, nasal congestion, back pain, muscle pain, nausea, dizziness, rash.',
    category_id: 'sexual-health',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/viagra50/400/400',
    pack_size: '4x10 pills'
  },
  {
    id: 'sildenafil-pills-100mg',
    name: 'Sildenafil Pills (Viagra Generic) - 100mg',
    slug: 'sildenafil-pills-100mg',
    description: 'Oral tablets used for erectile dysfunction. Take 30-60 minutes before activity.',
    manufacturer: 'Generic',
    price: 44.00,
    stock: 100,
    dosage: '100mg',
    side_effects: 'Headache, flushing, upset stomach, abnormal vision, nasal congestion, back pain, muscle pain, nausea, dizziness, rash.',
    category_id: 'sexual-health',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/viagra100/400/400',
    pack_size: '4x10 pills'
  },
  {
    id: 'sildenafil-oral-jelly-50mg',
    name: 'Sildenafil Oral Jelly (Kamagra Brand) - 50mg',
    slug: 'sildenafil-oral-jelly-50mg',
    description: 'Fast-acting oral jelly for erectile dysfunction. Squeeze sachet directly into mouth.',
    manufacturer: 'Kamagra',
    price: 7.00,
    stock: 150,
    dosage: '50mg',
    side_effects: 'Headache, dizziness, flushing, indigestion, nasal congestion, diarrhea.',
    category_id: 'sexual-health',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/kamagra50/400/400',
    pack_size: '1x7 sachets',
    minimum_qty: 4
  },
  {
    id: 'sildenafil-oral-jelly-100mg',
    name: 'Sildenafil Oral Jelly (Kamagra Brand) - 100mg',
    slug: 'sildenafil-oral-jelly-100mg',
    description: 'Fast-acting oral jelly for erectile dysfunction. Squeeze sachet directly into mouth.',
    manufacturer: 'Kamagra',
    price: 12.25,
    stock: 150,
    dosage: '100mg',
    side_effects: 'Headache, dizziness, flushing, indigestion, nasal congestion, diarrhea.',
    category_id: 'sexual-health',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/kamagra100/400/400',
    pack_size: '1x7 sachets',
    minimum_qty: 4
  },
  {
    id: 'sildenafil-dapoxetine-pills-100mg-60mg',
    name: 'Sildenafil + Dapoxetine Pills',
    slug: 'sildenafil-dapoxetine-pills-100mg-60mg',
    description: 'Combination formula containing Sildenafil for erection support and Dapoxetine to prevent premature ejaculation.',
    manufacturer: 'Generic',
    price: 80.00,
    stock: 80,
    dosage: '100mg+60mg',
    side_effects: 'Nausea, dizziness, headache, flushing, dyspepsia, insomnia, anxiety, increased blood pressure.',
    category_id: 'sexual-health',
    featured: false,
    active: true,
    image_url: 'https://picsum.photos/seed/sildap/400/400',
    pack_size: '4x10 pills'
  },
  {
    id: 'sildenafil-dapoxetine-oral-jelly-100mg-60mg',
    name: 'Sildenafil + Dapoxetine Oral Jelly (Super Kamagra Brand)',
    slug: 'sildenafil-dapoxetine-oral-jelly-100mg-60mg',
    description: 'Fast-absorbing combination oral jelly with Sildenafil and Dapoxetine for enhanced stamina.',
    manufacturer: 'Super Kamagra',
    price: 17.50,
    stock: 80,
    dosage: '100mg+60mg',
    side_effects: 'Nausea, dizziness, headache, flushing, indigestion, sleepiness, nasal congestion.',
    category_id: 'sexual-health',
    featured: false,
    active: true,
    image_url: 'https://picsum.photos/seed/superkamagra/400/400',
    pack_size: '1x7 sachets',
    minimum_qty: 4
  },
  {
    id: 'tadalafil-pills-5mg',
    name: 'Tadalafil Pills (Cialis Generic) - 5mg',
    slug: 'tadalafil-pills-5mg',
    description: 'Daily low-dose tadalafil for ongoing erectile dysfunction treatment and peak performance.',
    manufacturer: 'Generic',
    price: 50.00,
    stock: 120,
    dosage: '5mg',
    side_effects: 'Headache, indigestion, back pain, muscle aches, flushing, stuffy or runny nose.',
    category_id: 'sexual-health',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/cialis5/400/400',
    pack_size: '10x10 pills'
  },
  {
    id: 'tadalafil-pills-20mg',
    name: 'Tadalafil Pills (Cialis Generic) - 20mg',
    slug: 'tadalafil-pills-20mg',
    description: 'High-strength Tadalafil pills for erectile dysfunction. Provides up to 36 hours of active support.',
    manufacturer: 'Generic',
    price: 46.00,
    stock: 120,
    dosage: '20mg',
    side_effects: 'Headache, indigestion, back pain, muscle aches, flushing, stuffy or runny nose.',
    category_id: 'sexual-health',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/cialis20/400/400',
    pack_size: '4x10 pills'
  },
  {
    id: 'minoxidil-5-solution',
    name: 'Minoxidil 5% solution',
    slug: 'minoxidil-5-solution',
    description: 'Topical solution clinically proven to stimulate hair follicles and treat male pattern baldness.',
    manufacturer: 'Generic',
    price: 25.00,
    stock: 200,
    dosage: '5% w/v',
    side_effects: 'Scalp irritation, unwanted facial hair growth, rapid heart rate, chest pain, dizziness.',
    category_id: 'hair-loss',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/minoxidil5/400/400',
    pack_size: '60mlx2 bottles'
  },
  {
    id: 'minoxidil-10-solution',
    name: 'Minoxidil Maximum Strength - 10% solution',
    slug: 'minoxidil-10-solution',
    description: 'Extra strength topical minoxidil solution for advanced hair thinning and stubble regrowth.',
    manufacturer: 'Generic',
    price: 50.00,
    stock: 150,
    dosage: '10% w/v',
    side_effects: 'Scalp dryness, itching, redness, minor burning sensation, hypertrichosis.',
    category_id: 'hair-loss',
    featured: false,
    active: true,
    image_url: 'https://picsum.photos/seed/minoxidil10/400/400',
    pack_size: '60mlx2 bottles'
  },
  {
    id: 'minoxidil-finasteride-dual-action',
    name: 'Minoxidil + Finasteride Dual action solution',
    slug: 'minoxidil-finasteride-dual-action',
    description: 'Dual-action formula combining Minoxidil to promote hair growth and Finasteride to block DHT.',
    manufacturer: 'Generic',
    price: 40.00,
    stock: 150,
    dosage: 'Minoxidil (5% w/v) + Finasteride (0.1% w/v)',
    side_effects: 'Local skin irritation, redness, dry skin, decreased libido, erectile dysfunction (rare).',
    category_id: 'hair-loss',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/minoxfin/400/400',
    pack_size: '60mlx2 bottles'
  },
  {
    id: 'minoxidil-finasteride-forte-max-strength',
    name: 'Minoxidil + Finasteride Forte Dual action solution - Max Strength',
    slug: 'minoxidil-finasteride-forte-max-strength',
    description: 'Maximum strength combination solution targeting aggressive hair loss with 10% Minoxidil and DHT-blocking Finasteride.',
    manufacturer: 'Generic',
    price: 60.00,
    stock: 100,
    dosage: 'Minoxidil (10% w/v) + Finasteride (0.1% w/v)',
    side_effects: 'Skin irritation, flaking, dryness, allergic contact dermatitis, systemic absorption symptoms (rare).',
    category_id: 'hair-loss',
    featured: false,
    active: true,
    image_url: 'https://picsum.photos/seed/minoxfinforte/400/400',
    pack_size: '60mlx2 bottles'
  },
  {
    id: 'tretinoin-cream-0-025',
    name: 'Tretinoin 0.025% cream (Acne/Anti-aging & Hyperpigmentation)',
    slug: 'tretinoin-cream-0-025',
    description: 'Retinoid cream used for the treatment of acne, fine lines, dark spots, and skin renewal.',
    manufacturer: 'Generic',
    price: 12.50,
    stock: 180,
    dosage: 'Tretinoin (0.025% w/w)',
    side_effects: 'Skin redness, peeling, dryness, burning, stinging, increased sensitivity to sunlight.',
    category_id: 'skin-care',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/tretinoin025/400/400',
    pack_size: '20mgx1 tube',
    minimum_qty: 3
  },
  {
    id: 'tretinoin-cream-0-05',
    name: 'Tretinoin 0.05% cream (Acne/Anti-aging & Hyperpigmentation)',
    slug: 'tretinoin-cream-0-05',
    description: 'Moderate-strength retinoid cream targeting acne vulgaris, cell turnover, and skin anti-aging.',
    manufacturer: 'Generic',
    price: 18.50,
    stock: 150,
    dosage: 'Tretinoin (0.05% w/w)',
    side_effects: 'Severe redness, peeling, blistering, crusting, temporary skin discoloration, sun sensitivity.',
    category_id: 'skin-care',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/tretinoin05/400/400',
    pack_size: '20mgx1 tube',
    minimum_qty: 3
  },
  {
    id: 'anavar-pills-oxandrolone-10mg',
    name: 'Anavar pills (oxandrolone)',
    slug: 'anavar-pills-oxandrolone-10mg',
    description: 'Oxandrolone oral steroid used for promoting lean muscle mass, vascularity, and physical recovery.',
    manufacturer: 'Generic',
    price: 70.00,
    stock: 90,
    dosage: '10mg',
    side_effects: 'Acne, changes in sexual desire, hair loss, oily skin, sleep problems, liver toxicity at high doses.',
    category_id: 'muscle-growth',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/anavar/400/400',
    pack_size: '10x10 pills'
  },
  {
    id: 'dianabol-pills-methandrostenolone-10mg',
    name: 'Dianabol pills (Methandrostenolone)',
    slug: 'dianabol-pills-methandrostenolone-10mg',
    description: 'Methandrostenolone oral steroid used for rapid muscle volume, strength gains, and protein synthesis.',
    manufacturer: 'Generic',
    price: 50.00,
    stock: 95,
    dosage: '10mg',
    side_effects: 'Water retention, gynecomastia, high blood pressure, acne, liver strain, virilization in females.',
    category_id: 'muscle-growth',
    featured: true,
    active: true,
    image_url: 'https://picsum.photos/seed/dianabol/400/400',
    pack_size: '10x10 pills'
  }
];


const DEFAULT_BLOGS = [
  {
    id: 'blog_wellness_foundations',
    title: 'Wellness Foundations for Private Care',
    slug: 'wellness-foundations-private-care',
    excerpt: 'A practical guide to discreet treatment planning, fulfillment expectations, and ongoing self-care routines.',
    content: 'Private care works best when the process is clear. Start by choosing products that match your goals, keep a record of dosage instructions, and follow up with support whenever you need help with shipping, payment, or product guidance. Tatvalife keeps the experience discreet from order review through delivery.',
    cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
    author_name: 'Tatvalife Care Team',
    published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'blog_secure_checkout',
    title: 'How Secure Checkout Links Work',
    slug: 'secure-checkout-links',
    excerpt: 'What customers should expect when an order is reviewed and a secure payment link is issued.',
    content: 'After checkout, the admin team reviews the order and shares a secure payment link when payment is required. Customers should only use links sent through official Tatvalife communication channels and can always confirm order status from their dashboard.',
    cover_image: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&q=80&w=1200',
    author_name: 'Tatvalife Care Team',
    published: true,
    created_at: new Date().toISOString()
  }
];

let firebaseApp = null;
let firestore = null;
let useFirebase = false;

// Attempt Firebase initialization
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || path.join(__dirname, 'firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firestore = firebaseApp.firestore();
    useFirebase = true;
    console.log('Firebase initialized successfully with service account key.');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    firestore = firebaseApp.firestore();
    useFirebase = true;
    console.log('Firebase initialized successfully via environment variables.');
  } else {
    console.warn('Firebase configuration not found. Falling back to local file-based database.');
  }
} catch (error) {
  console.error('Firebase initialization failed, falling back to local database:', error);
}

// Local File Database Helper Class
class LocalDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.init();
  }

  init() {
    if (!fs.existsSync(this.filePath)) {
      const hashPassword = (plain) => bcrypt.hashSync(plain, 10);
      const data = {
        categories: DEFAULT_CATEGORIES,
        products: DEFAULT_PRODUCTS,
        users: [
          {
            id: 'admin_id',
            full_name: 'System Admin',
            email: 'admin@gmail.com',
            password: hashPassword('password1234'),
            role: 'admin',
            created_at: new Date().toISOString()
          },
          {
            id: 'customer_id',
            full_name: 'John Doe',
            email: 'customer@gmail.com',
            password: hashPassword('password1234'),
            role: 'customer',
            created_at: new Date().toISOString()
          }
        ],
        orders: [],
        emailLogs: [],
        blogs: DEFAULT_BLOGS,
        coupons: []
      };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } else {
      const data = this.read();
      let changed = false;
      if (!Array.isArray(data.blogs)) {
        data.blogs = DEFAULT_BLOGS;
        changed = true;
      }
      if (!Array.isArray(data.emailLogs)) {
        data.emailLogs = [];
        changed = true;
      }
      if (!Array.isArray(data.coupons)) {
        data.coupons = [];
        changed = true;
      }
      if (changed) this.write(data);
    }
  }

  read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to read local DB:', error);
      return { categories: [], products: [], users: [], orders: [], emailLogs: [], blogs: DEFAULT_BLOGS, coupons: [] };
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to write to local DB:', error);
    }
  }

  getCollection(name) {
    const data = this.read();
    return data[name] || [];
  }

  saveCollection(name, collection) {
    const data = this.read();
    data[name] = collection;
    this.write(data);
  }
}

const localDb = new LocalDatabase(LOCAL_DB_PATH);

// Database Adapter Methods
export const db = {
  // Categories
  async getCategories() {
    if (useFirebase) {
      const snapshot = await firestore.collection('categories').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return localDb.getCollection('categories');
    }
  },

  // Products
  async getProducts() {
    if (useFirebase) {
      const snapshot = await firestore.collection('products').get();
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const categories = await this.getCategories();
      return products.map(p => ({
        ...p,
        categories: categories.find(c => c.id === p.category_id)
      }));
    } else {
      const products = localDb.getCollection('products');
      const categories = localDb.getCollection('categories');
      return products.map(p => ({
        ...p,
        categories: categories.find(c => c.id === p.category_id)
      }));
    }
  },

  async getProductBySlug(slug) {
    if (useFirebase) {
      const snapshot = await firestore.collection('products').where('slug', '==', slug).limit(1).get();
      if (snapshot.empty) return null;
      const product = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      const categories = await this.getCategories();
      product.categories = categories.find(c => c.id === product.category_id);
      return product;
    } else {
      const products = localDb.getCollection('products');
      const product = products.find(p => p.slug === slug);
      if (!product) return null;
      const categories = localDb.getCollection('categories');
      return {
        ...product,
        categories: categories.find(c => c.id === product.category_id)
      };
    }
  },

  async createProduct(productData) {
    const id = 'prod_' + Math.random().toString(36).substr(2, 9);
    const newProduct = {
      id,
      ...productData,
      active: true,
      created_at: new Date().toISOString()
    };

    if (useFirebase) {
      await firestore.collection('products').doc(id).set(newProduct);
      return newProduct;
    } else {
      const products = localDb.getCollection('products');
      products.push(newProduct);
      localDb.saveCollection('products', products);
      return newProduct;
    }
  },



  async updateProduct(productId, updates) {
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (useFirebase) {
      await firestore.collection('products').doc(productId).update(cleanUpdates);
      const doc = await firestore.collection('products').doc(productId).get();
      if (!doc.exists) throw new Error('Product not found');
      return { id: doc.id, ...doc.data() };
    } else {
      const products = localDb.getCollection('products');
      const index = products.findIndex(p => p.id === productId);
      if (index === -1) throw new Error('Product not found');
      products[index] = { ...products[index], ...cleanUpdates, updated_at: new Date().toISOString() };
      localDb.saveCollection('products', products);
      return products[index];
    }
  },

  async deleteProduct(productId) {
    if (useFirebase) {
      await firestore.collection('products').doc(productId).delete();
      return { id: productId };
    } else {
      const products = localDb.getCollection('products');
      const nextProducts = products.filter(p => p.id !== productId);
      if (nextProducts.length === products.length) throw new Error('Product not found');
      localDb.saveCollection('products', nextProducts);
      return { id: productId };
    }
  },

  // Users
  async getUserByEmail(email) {
    if (useFirebase) {
      const snapshot = await firestore.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } else {
      const users = localDb.getCollection('users');
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async createUser(userData) {
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    const newUser = {
      id,
      ...userData,
      email: userData.email.toLowerCase(),
      created_at: new Date().toISOString()
    };

    if (useFirebase) {
      await firestore.collection('users').doc(id).set(newUser);
      return newUser;
    } else {
      const users = localDb.getCollection('users');
      users.push(newUser);
      localDb.saveCollection('users', users);
      return newUser;
    }
  },

  // Orders
  async getOrders() {
    if (useFirebase) {
      const snapshot = await firestore.collection('orders').orderBy('created_at', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const orders = localDb.getCollection('orders');
      return [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async getOrdersByUserId(userId) {
    if (useFirebase) {
      const snapshot = await firestore.collection('orders').where('user_id', '==', userId).get();
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      const orders = localDb.getCollection('orders');
      return orders
        .filter(o => o.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async createOrder(orderData) {
    const id = 'ord_' + Math.random().toString(36).substr(2, 9);
    const newOrder = {
      id,
      ...orderData,
      created_at: new Date().toISOString()
    };

    if (useFirebase) {
      await firestore.collection('orders').doc(id).set(newOrder);
      return newOrder;
    } else {
      const orders = localDb.getCollection('orders');
      orders.push(newOrder);
      localDb.saveCollection('orders', orders);
      return newOrder;
    }
  },

  async updateOrder(orderId, updates) {
    if (useFirebase) {
      await firestore.collection('orders').doc(orderId).update(updates);
      const doc = await firestore.collection('orders').doc(orderId).get();
      return { id: doc.id, ...doc.data() };
    } else {
      const orders = localDb.getCollection('orders');
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) throw new Error('Order not found');
      orders[index] = { ...orders[index], ...updates };
      localDb.saveCollection('orders', orders);
      return orders[index];
    }
  },

  // Email Logs
  async getEmailLogs() {
    if (useFirebase) {
      const snapshot = await firestore.collection('email_logs').orderBy('sent_at', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const logs = localDb.getCollection('emailLogs');
      return [...logs].sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
    }
  },

  async createEmailLog(logData) {
    const id = 'log_' + Math.random().toString(36).substr(2, 9);
    const newLog = {
      id,
      ...logData,
      sent_at: new Date().toISOString()
    };

    if (useFirebase) {
      await firestore.collection('email_logs').doc(id).set(newLog);
      return newLog;
    } else {
      const logs = localDb.getCollection('emailLogs');
      logs.push(newLog);
      localDb.saveCollection('emailLogs', logs);
      return newLog;
    }
  },

  // Blogs
  async getBlogs({ includeDrafts = false } = {}) {
    if (useFirebase) {
      const snapshot = await firestore.collection('blogs').orderBy('created_at', 'desc').get();
      const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return includeDrafts ? blogs : blogs.filter(blog => blog.published !== false);
    }

    const blogs = localDb.getCollection('blogs');
    const sorted = [...blogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return includeDrafts ? sorted : sorted.filter(blog => blog.published !== false);
  },

  async getBlogBySlug(slug, { includeDrafts = false } = {}) {
    const blogs = await this.getBlogs({ includeDrafts: true });
    const blog = blogs.find(item => item.slug === slug);
    if (!blog || (!includeDrafts && blog.published === false)) return null;
    return blog;
  },

  async createBlog(blogData) {
    const id = 'blog_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newBlog = {
      id,
      ...blogData,
      published: blogData.published !== undefined ? !!blogData.published : true,
      created_at: now,
      updated_at: now
    };

    if (useFirebase) {
      await firestore.collection('blogs').doc(id).set(newBlog);
      return newBlog;
    }

    const blogs = localDb.getCollection('blogs');
    blogs.push(newBlog);
    localDb.saveCollection('blogs', blogs);
    return newBlog;
  },

  async updateBlog(blogId, updates) {
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    cleanUpdates.updated_at = new Date().toISOString();

    if (useFirebase) {
      await firestore.collection('blogs').doc(blogId).update(cleanUpdates);
      const doc = await firestore.collection('blogs').doc(blogId).get();
      if (!doc.exists) throw new Error('Blog not found');
      return { id: doc.id, ...doc.data() };
    }

    const blogs = localDb.getCollection('blogs');
    const index = blogs.findIndex(blog => blog.id === blogId);
    if (index === -1) throw new Error('Blog not found');
    blogs[index] = { ...blogs[index], ...cleanUpdates };
    localDb.saveCollection('blogs', blogs);
    return blogs[index];
  },

  async deleteBlog(blogId) {
    if (useFirebase) {
      await firestore.collection('blogs').doc(blogId).delete();
      return { id: blogId };
    }

    const blogs = localDb.getCollection('blogs');
    const nextBlogs = blogs.filter(blog => blog.id !== blogId);
    if (nextBlogs.length === blogs.length) throw new Error('Blog not found');
    localDb.saveCollection('blogs', nextBlogs);
    return { id: blogId };
  },

  // Coupons Database Operations
  async getCoupons() {
    if (useFirebase) {
      const snapshot = await firestore.collection('coupons').orderBy('created_at', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const coupons = localDb.getCollection('coupons');
      return [...coupons].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async getCouponByCode(code) {
    const normalizedCode = code.toUpperCase();
    if (useFirebase) {
      const snapshot = await firestore.collection('coupons').where('code', '==', normalizedCode).limit(1).get();
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } else {
      const coupons = localDb.getCollection('coupons');
      return coupons.find(c => c.code.toUpperCase() === normalizedCode) || null;
    }
  },

  async createCoupon(couponData) {
    const id = 'coup_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newCoupon = {
      id,
      ...couponData,
      code: couponData.code.toUpperCase(),
      used_count: 0,
      active: couponData.active !== undefined ? !!couponData.active : true,
      created_at: now,
      updated_at: now
    };

    if (useFirebase) {
      await firestore.collection('coupons').doc(id).set(newCoupon);
      return newCoupon;
    } else {
      const coupons = localDb.getCollection('coupons');
      coupons.push(newCoupon);
      localDb.saveCollection('coupons', coupons);
      return newCoupon;
    }
  },

  async updateCoupon(couponId, updates) {
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    if (cleanUpdates.code) {
      cleanUpdates.code = cleanUpdates.code.toUpperCase();
    }
    cleanUpdates.updated_at = new Date().toISOString();

    if (useFirebase) {
      await firestore.collection('coupons').doc(couponId).update(cleanUpdates);
      const doc = await firestore.collection('coupons').doc(couponId).get();
      if (!doc.exists) throw new Error('Coupon not found');
      return { id: doc.id, ...doc.data() };
    } else {
      const coupons = localDb.getCollection('coupons');
      const index = coupons.findIndex(c => c.id === couponId);
      if (index === -1) throw new Error('Coupon not found');
      coupons[index] = { ...coupons[index], ...cleanUpdates };
      localDb.saveCollection('coupons', coupons);
      return coupons[index];
    }
  },

  async deleteCoupon(couponId) {
    if (useFirebase) {
      await firestore.collection('coupons').doc(couponId).delete();
      return { id: couponId };
    } else {
      const coupons = localDb.getCollection('coupons');
      const nextCoupons = coupons.filter(c => c.id !== couponId);
      if (nextCoupons.length === coupons.length) throw new Error('Coupon not found');
      localDb.saveCollection('coupons', nextCoupons);
      return { id: couponId };
    }
  },

  async incrementCouponUse(code) {
    const normalizedCode = code.toUpperCase();
    if (useFirebase) {
      const snapshot = await firestore.collection('coupons').where('code', '==', normalizedCode).limit(1).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const currentCount = doc.data().used_count || 0;
        await doc.ref.update({ used_count: currentCount + 1 });
      }
    } else {
      const coupons = localDb.getCollection('coupons');
      const index = coupons.findIndex(c => c.code.toUpperCase() === normalizedCode);
      if (index !== -1) {
        coupons[index].used_count = (coupons[index].used_count || 0) + 1;
        localDb.saveCollection('coupons', coupons);
      }
    }
  }
};

// Seed Firebase if it is selected and collection is empty
const seedFirebase = async () => {
  if (!useFirebase) return;
  try {
    console.log('Clearing old categories from Firebase...');
    const catSnapshot = await firestore.collection('categories').get();
    for (const doc of catSnapshot.docs) {
      await doc.ref.delete();
    }
    
    console.log('Clearing old products from Firebase...');
    const prodSnapshot = await firestore.collection('products').get();
    for (const doc of prodSnapshot.docs) {
      await doc.ref.delete();
    }

    console.log('Seeding new categories to Firebase...');
    for (const cat of DEFAULT_CATEGORIES) {
      await firestore.collection('categories').doc(cat.id).set(cat);
    }
    
    console.log('Seeding new products to Firebase...');
    for (const prod of DEFAULT_PRODUCTS) {
      await firestore.collection('products').doc(prod.id).set(prod);
    }
    console.log('Firebase catalog re-seeded successfully.');
  } catch (error) {
    console.error('Firebase seeding failed:', error);
  }
};

seedFirebase();
