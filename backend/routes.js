import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import admin from 'firebase-admin';
import https from 'https';
import { db } from './db.js';
import { getEmailConfig, updateEmailConfig, sendEmail } from './emailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tatvalife_secret_key_12345';

// Firebase verification helpers for fallback (no service account config)
let googlePublicKeys = null;
let googlePublicKeysExpiry = 0;

const fetchGooglePublicKeys = () => {
  return new Promise((resolve, reject) => {
    if (googlePublicKeys && Date.now() < googlePublicKeysExpiry) {
      return resolve(googlePublicKeys);
    }
    
    https.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', (res) => {
      let data = '';
      
      const cacheControl = res.headers['cache-control'];
      let maxAge = 3600;
      if (cacheControl) {
        const match = cacheControl.match(/max-age=(\d+)/);
        if (match) maxAge = parseInt(match[1], 10);
      }
      
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          googlePublicKeys = JSON.parse(data);
          googlePublicKeysExpiry = Date.now() + (maxAge * 1000);
          resolve(googlePublicKeys);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const verifyFirebaseIdTokenFallback = async (idToken) => {
  const decodedHeader = jwt.decode(idToken, { complete: true });
  if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
    throw new Error('Invalid token format or missing key ID (kid)');
  }
  
  const kid = decodedHeader.header.kid;
  const publicKeys = await fetchGooglePublicKeys();
  const cert = publicKeys[kid];
  
  if (!cert) {
    throw new Error('Public key not found for key ID (kid)');
  }
  
  const projectId = process.env.FIREBASE_PROJECT_ID || 'tatvlife';
  
  const decoded = jwt.verify(idToken, cert, {
    algorithms: ['RS256'],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`
  });
  
  // Map standard 'sub' claim to 'uid' expected by the application
  if (decoded && !decoded.uid && decoded.sub) {
    decoded.uid = decoded.sub;
  }
  
  return decoded;
};

// Authentication Middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Admin Middleware
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// ─── AUTH ENDPOINTS ──────────────────────────────────────────

// Register
router.post('/auth/register', async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'customer';

    const user = await db.createUser({
      full_name,
      email,
      phone: phone || '',
      password: hashedPassword,
      role
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});


// Google Firebase Login
router.post('/auth/google', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'Firebase ID token required' });
  }

  try {
    let decoded;
    if (admin.apps.length) {
      decoded = await admin.auth().verifyIdToken(idToken);
    } else {
      // Fallback verification if service account key is not configured locally
      decoded = await verifyFirebaseIdTokenFallback(idToken);
    }
    
    const email = decoded.email?.toLowerCase();
    if (!email) return res.status(400).json({ error: 'Google account email is required' });

    let user = await db.getUserByEmail(email);
    if (!user) {
      user = await db.createUser({
        full_name: decoded.name || email.split('@')[0],
        email,
        phone: decoded.phone_number || '',
        password: '',
        provider: 'google',
        firebase_uid: decoded.uid,
        photo_url: decoded.picture || '',
        role: email === 'admin@gmail.com' ? 'admin' : 'customer'
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid Firebase Google token' });
  }
});


// ─── BLOG ENDPOINTS ──────────────────────────────────────────

router.get('/blogs', async (req, res) => {
  try {
    const blogs = await db.getBlogs({ includeDrafts: req.user?.role === 'admin' });
    res.json(blogs);
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Server error fetching blogs' });
  }
});

router.get('/blogs/:slug', async (req, res) => {
  try {
    const blog = await db.getBlogBySlug(req.params.slug, { includeDrafts: req.user?.role === 'admin' });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Server error fetching blog' });
  }
});

router.post('/blogs', authenticateToken, requireAdmin, async (req, res) => {
  const { title, slug, excerpt, content, cover_image, author_name, published } = req.body;

  if (!title || !slug || !excerpt || !content) {
    return res.status(400).json({ error: 'title, slug, excerpt, and content are required' });
  }

  try {
    const existing = await db.getBlogBySlug(slug, { includeDrafts: true });
    if (existing) return res.status(400).json({ error: 'Blog slug already exists' });

    const blog = await db.createBlog({
      title,
      slug,
      excerpt,
      content,
      cover_image: cover_image || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
      author_name: author_name || 'Tatvalife Care Team',
      published: published !== undefined ? !!published : true
    });
    res.status(201).json(blog);
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Server error creating blog' });
  }
});

router.put('/blogs/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { title, slug, excerpt, content, cover_image, author_name, published } = req.body;

  if (!title || !slug || !excerpt || !content) {
    return res.status(400).json({ error: 'title, slug, excerpt, and content are required' });
  }

  try {
    const existing = await db.getBlogBySlug(slug, { includeDrafts: true });
    if (existing && existing.id !== req.params.id) return res.status(400).json({ error: 'Blog slug already exists' });

    const blog = await db.updateBlog(req.params.id, {
      title,
      slug,
      excerpt,
      content,
      cover_image: cover_image || '',
      author_name: author_name || 'Tatvalife Care Team',
      published: published !== undefined ? !!published : true
    });
    res.json(blog);
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: error.message || 'Server error updating blog' });
  }
});

router.delete('/blogs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const blog = await db.deleteBlog(req.params.id);
    res.json(blog);
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: error.message || 'Server error deleting blog' });
  }
});

// ─── PRODUCT ENDPOINTS ───────────────────────────────────────

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// Get product by slug
router.get('/products/:slug', async (req, res) => {
  try {
    const product = await db.getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({ error: 'Server error fetching product details' });
  }
});

// Create product (Admin only)
router.post('/products', authenticateToken, requireAdmin, async (req, res) => {
  const { name, slug, description, manufacturer, price, stock, dosage, side_effects, category_id, featured, image_url, active } = req.body;

  if (!name || !slug || !price || !category_id) {
    return res.status(400).json({ error: 'Name, slug, price, and category_id are required' });
  }

  try {
    const existing = await db.getProductBySlug(slug);
    if (existing) return res.status(400).json({ error: 'Product slug already exists' });

    const newProd = await db.createProduct({
      name,
      slug,
      description: description || '',
      manufacturer: manufacturer || 'Generic',
      price: Number(price),
      stock: Number(stock) || 10,
      dosage: dosage || '',
      side_effects: side_effects || '',
      category_id,
      featured: !!featured,
      active: active !== undefined ? !!active : true,
      image_url: image_url || 'https://picsum.photos/seed/default/400/400'
    });

    res.status(201).json(newProd);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error creating product' });
  }
});



// Update product (Admin only)
router.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { name, slug, description, manufacturer, price, stock, dosage, side_effects, category_id, featured, image_url, active } = req.body;
  const { id } = req.params;

  if (!name || !slug || !price || !category_id) {
    return res.status(400).json({ error: 'Name, slug, price, and category_id are required' });
  }

  try {
    const existing = await db.getProductBySlug(slug);
    if (existing && existing.id !== id) return res.status(400).json({ error: 'Product slug already exists' });

    const updatedProduct = await db.updateProduct(id, {
      name,
      slug,
      description: description || '',
      manufacturer: manufacturer || 'Generic',
      price: Number(price),
      stock: Number(stock) || 0,
      dosage: dosage || '',
      side_effects: side_effects || '',
      category_id,
      featured: !!featured,
      active: active !== undefined ? !!active : true,
      image_url: image_url || 'https://picsum.photos/seed/default/400/400'
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message || 'Server error updating product' });
  }
});

// Delete product (Admin only)
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deletedProduct = await db.deleteProduct(req.params.id);
    res.json(deletedProduct);
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message || 'Server error deleting product' });
  }
});

// ─── CATEGORY ENDPOINTS ──────────────────────────────────────

router.get('/categories', async (req, res) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

// ─── ORDER ENDPOINTS ─────────────────────────────────────────

// Create Order (Checkout)
router.post('/orders', authenticateToken, async (req, res) => {
  const { items, totalAmount, shippingAddress, prescriptionName, prescriptionData, paymentMethod, couponCode } = req.body;

  if (!items || !items.length || !totalAmount || !shippingAddress) {
    return res.status(400).json({ error: 'Order details and shipping address are required' });
  }

  try {
    let finalDiscount = 0;
    let appliedCode = null;

    if (couponCode) {
      const coupon = await db.getCouponByCode(couponCode);
      if (coupon && coupon.active) {
        const now = new Date();
        const expired = coupon.expires_at && new Date(coupon.expires_at) < now;
        const limitReached = coupon.max_uses !== null && coupon.max_uses !== undefined && (coupon.used_count || 0) >= coupon.max_uses;

        if (!expired && !limitReached) {
          const minOrder = Number(coupon.min_order_amount) || 0;
          let tempSubtotal = 0;
          for (const item of items) {
            tempSubtotal += Number(item.price) * Number(item.quantity);
          }

          if (tempSubtotal >= minOrder) {
            if (coupon.discount_type === 'percent') {
              finalDiscount = Math.round((tempSubtotal * (Number(coupon.discount_value) / 100)) * 100) / 100;
            } else {
              finalDiscount = Number(coupon.discount_value);
            }
            if (finalDiscount > tempSubtotal) {
              finalDiscount = tempSubtotal;
            }
            appliedCode = coupon.code.toUpperCase();
          }
        }
      }
    }

    const calculatedTotal = Math.max(0.01, Number(totalAmount) - finalDiscount);

    const order = await db.createOrder({
      user_id: req.user.id,
      user_email: req.user.email,
      items,
      total_amount: Number(calculatedTotal.toFixed(2)),
      shipping_address: shippingAddress,
      prescription_name: prescriptionName || null,
      prescription_data: prescriptionData || null, // Base64 data if uploaded
      payment_status: 'unpaid',
      order_status: 'pending_payment',
      payment_link: '',
      transaction_hash: '',
      payment_method: paymentMethod || 'crypto',
      coupon_code: appliedCode,
      discount_amount: Number(finalDiscount.toFixed(2))
    });

    if (appliedCode) {
      await db.incrementCouponUse(appliedCode);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error creating order' });
  }
});

// Get orders (Admins get all, customers get their own)
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const orders = await db.getOrders();
      res.json(orders);
    } else {
      const orders = await db.getOrdersByUserId(req.user.id);
      res.json(orders);
    }
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// Update order status/payment details (Admin or User for transaction hash)
router.put('/orders/:id', authenticateToken, async (req, res) => {
  const { order_status, payment_status, payment_link, transaction_hash } = req.body;
  const { id } = req.params;

  try {
    // Basic verification - Non-admins can only submit transaction hashes
    if (req.user.role !== 'admin') {
      if (transaction_hash === undefined || order_status !== undefined || payment_status !== undefined || payment_link !== undefined) {
        return res.status(403).json({ error: 'Non-admin users can only submit payment transaction hashes' });
      }
      
      const order = await db.updateOrder(id, {
        transaction_hash,
        order_status: 'processing' // Advance to processing once transaction hash is submitted
      });
      return res.json(order);
    }

    // Admin updates
    const updates = {};
    if (order_status !== undefined) updates.order_status = order_status;
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (payment_link !== undefined) updates.payment_link = payment_link;
    if (transaction_hash !== undefined) updates.transaction_hash = transaction_hash;

    const updatedOrder = await db.updateOrder(id, updates);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Server error updating order' });
  }
});

// ─── EMAIL LOGS ENDPOINTS ────────────────────────────────────


// Get local SMTP email settings (Admin only; password is never returned)
router.get('/emails/config', authenticateToken, requireAdmin, async (req, res) => {
  res.json(getEmailConfig());
});

// Configure local SMTP email settings (Admin only)
router.put('/emails/config', authenticateToken, requireAdmin, async (req, res) => {
  const { host, port, secure, user, pass, fromEmail, fromName, replyTo } = req.body;

  if (!host || !port || !user || !fromEmail) {
    return res.status(400).json({ error: 'host, port, user, and fromEmail are required' });
  }

  const config = updateEmailConfig({ host, port, secure, user, pass, fromEmail, fromName, replyTo });
  res.json(config);
});

// Remove local SMTP email settings (Admin only)
router.delete('/emails/config', authenticateToken, requireAdmin, async (req, res) => {
  const config = updateEmailConfig({ host: '', port: 587, secure: false, user: '', pass: '', fromEmail: '', fromName: 'Tatvalife Care Team', replyTo: '' });
  res.json(config);
});


// Send real email through configured local SMTP and save delivery log (Admin only)
router.post('/emails/send', authenticateToken, requireAdmin, async (req, res) => {
  const { user_email, email_type, subject, body } = req.body;

  if (!user_email || !email_type || !subject || !body) {
    return res.status(400).json({ error: 'user_email, email_type, subject, and body are required' });
  }

  try {
    const delivery = await sendEmail({ to: user_email, subject, text: body });
    const log = await db.createEmailLog({
      user_email,
      email_type,
      status: 'sent',
      subject,
      body,
      provider_message_id: delivery.messageId || '',
      accepted: delivery.accepted || [],
      rejected: delivery.rejected || []
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Send email error:', error);
    try {
      const failedLog = await db.createEmailLog({
        user_email,
        email_type,
        status: 'failed',
        subject,
        body,
        error: error.message || 'Email send failed'
      });
      return res.status(500).json({ error: error.message || 'Email send failed', log: failedLog });
    } catch {
      return res.status(500).json({ error: error.message || 'Email send failed' });
    }
  }
});

// Get Email Logs (Admin only)
router.get('/emails', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const logs = await db.getEmailLogs();
    res.json(logs);
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ error: 'Server error fetching email logs' });
  }
});

// Log an email sent (Admin or backend triggers)
router.post('/emails/log', authenticateToken, async (req, res) => {
  const { user_email, email_type, status, subject, body } = req.body;

  if (!user_email || !email_type || !status) {
    return res.status(400).json({ error: 'user_email, email_type, and status are required' });
  }

  try {
    const log = await db.createEmailLog({
      user_email,
      email_type,
      status,
      subject: subject || '',
      body: body || ''
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('Log email error:', error);
    res.status(500).json({ error: 'Server error logging email' });
  }
});

// ─── COUPONS ENDPOINTS ───────────────────────────────────────

// Get all coupons (Admin only)
router.get('/coupons', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const coupons = await db.getCoupons();
    res.json(coupons);
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Server error fetching coupons' });
  }
});

// Get active coupon list (Public - for banners)
router.get('/coupons/active', async (req, res) => {
  try {
    const coupons = await db.getCoupons();
    const now = new Date();
    // Filter active & non-expired ones
    const active = coupons.filter(c => 
      c.active && 
      (!c.expires_at || new Date(c.expires_at) > now) &&
      (c.max_uses === null || c.max_uses === undefined || (c.used_count || 0) < c.max_uses)
    );
    // Only return fields needed for banner
    const bannerInfo = active.map(c => ({
      code: c.code,
      title: c.title,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      banner_text: c.banner_text || `${c.title} - Use code ${c.code}`
    }));
    res.json(bannerInfo);
  } catch (error) {
    console.error('Get active coupons error:', error);
    res.status(500).json({ error: 'Server error fetching active coupons' });
  }
});

// Create a coupon (Admin only)
router.post('/coupons', authenticateToken, requireAdmin, async (req, res) => {
  const { code, title, discount_type, discount_value, min_order_amount, max_uses, expires_at, active, banner_text } = req.body;

  if (!code || !title || !discount_type || discount_value === undefined) {
    return res.status(400).json({ error: 'Code, title, discount_type, and discount_value are required' });
  }

  try {
    const existing = await db.getCouponByCode(code);
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const coupon = await db.createCoupon({
      code: code.toUpperCase(),
      title,
      discount_type,
      discount_value: Number(discount_value),
      min_order_amount: min_order_amount ? Number(min_order_amount) : 0,
      max_uses: max_uses ? Number(max_uses) : null,
      expires_at: expires_at || null,
      active: active !== undefined ? !!active : true,
      banner_text: banner_text || ''
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Server error creating coupon' });
  }
});

// Update coupon (Admin only)
router.put('/coupons/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { code, title, discount_type, discount_value, min_order_amount, max_uses, expires_at, active, banner_text } = req.body;

  try {
    const existing = await db.getCouponByCode(code);
    if (existing && existing.id !== req.params.id) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const updates = {
      code,
      title,
      discount_type,
      discount_value: discount_value !== undefined ? Number(discount_value) : undefined,
      min_order_amount: min_order_amount !== undefined ? Number(min_order_amount) : undefined,
      max_uses: max_uses !== undefined ? (max_uses ? Number(max_uses) : null) : undefined,
      expires_at: expires_at !== undefined ? (expires_at || null) : undefined,
      active: active !== undefined ? !!active : undefined,
      banner_text
    };

    const coupon = await db.updateCoupon(req.params.id, updates);
    res.json(coupon);
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Server error updating coupon' });
  }
});

// Delete coupon (Admin only)
router.delete('/coupons/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.deleteCoupon(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Server error deleting coupon' });
  }
});

// Validate coupon code (User checkout)
router.post('/coupons/validate', authenticateToken, async (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code || orderAmount === undefined) {
    return res.status(400).json({ error: 'Code and order amount are required' });
  }

  try {
    const coupon = await db.getCouponByCode(code);

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon code not found' });
    }

    if (!coupon.active) {
      return res.status(400).json({ error: 'This coupon is no longer active' });
    }

    const now = new Date();
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return res.status(400).json({ error: 'This coupon has expired' });
    }

    if (coupon.max_uses !== null && coupon.max_uses !== undefined && (coupon.used_count || 0) >= coupon.max_uses) {
      return res.status(400).json({ error: 'This coupon limit has been reached' });
    }

    const minAmount = Number(coupon.min_order_amount) || 0;
    if (Number(orderAmount) < minAmount) {
      return res.status(400).json({ error: `Minimum order amount of $${minAmount.toFixed(2)} is required for this coupon` });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discount_type === 'percent') {
      discountAmount = Math.round((Number(orderAmount) * (Number(coupon.discount_value) / 100)) * 100) / 100;
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    // Discount cannot exceed order amount
    if (discountAmount > Number(orderAmount)) {
      discountAmount = Number(orderAmount);
    }

    res.json({
      valid: true,
      code: coupon.code,
      title: coupon.title,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: Number(discountAmount.toFixed(2))
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ error: 'Server error validating coupon' });
  }
});

export default router;
