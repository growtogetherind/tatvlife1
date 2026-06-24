/**
 * firestoreService.js
 * All Firestore CRUD operations for The WellMan Co.
 * Data is read/written directly from/to Firebase.
 */

import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, increment, limit,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Converts a Firestore doc snapshot to a plain object with an `id` field. */
const docToObj = (snap) => ({ id: snap.id, ...snap.data() });

/** Converts a Timestamp or ISO string to a JS Date-compatible ISO string. */
const toISO = (val) => {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate().toISOString();
  return val;
};

/** Normalises a doc so timestamps become ISO strings for easy use in UI. */
const normaliseDoc = (obj) => ({
  ...obj,
  created_at: toISO(obj.created_at),
  updated_at: toISO(obj.updated_at),
});

// ─── USERS ───────────────────────────────────────────────────────────────────

const ADMIN_EMAILS = ['admin@gmail.com'];

/**
 * Called after Firebase Auth sign-in.
 * Creates the user doc if it doesn't exist, returns the profile.
 */
export const getOrCreateUser = async (firebaseUser, overrideData = {}) => {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return normaliseDoc(docToObj(snap));
  }

  const email = firebaseUser.email?.toLowerCase() || '';
  const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'customer';

  const userData = {
    full_name: overrideData.full_name || firebaseUser.displayName || email.split('@')[0],
    email,
    phone: overrideData.phone || firebaseUser.phoneNumber || '',
    photo_url: firebaseUser.photoURL || '',
    role,
    created_at: serverTimestamp(),
  };

  await setDoc(ref, userData);
  return { id: firebaseUser.uid, ...userData, created_at: new Date().toISOString() };
};

/** Fetch a user profile from Firestore by UID. */
export const getUserDoc = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return normaliseDoc(docToObj(snap));
};

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export const getCategories = async () => {
  const snap = await getDocs(collection(db, 'categories'));
  return snap.docs.map(docToObj);
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export const getProducts = async ({ includeInactive = false } = {}) => {
  let q = collection(db, 'products');
  if (!includeInactive) {
    q = query(q, where('active', '==', true));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => normaliseDoc(docToObj(d)));
};

export const getProductBySlug = async (slug) => {
  const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return normaliseDoc(docToObj(snap.docs[0]));
};

export const getProductById = async (id) => {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return normaliseDoc(docToObj(snap));
};

export const createProduct = async (data) => {
  const ref = await addDoc(collection(db, 'products'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return normaliseDoc(docToObj(snap));
};

export const updateProduct = async (id, data) => {
  const ref = doc(db, 'products', id);
  await updateDoc(ref, { ...data, updated_at: serverTimestamp() });
  const snap = await getDoc(ref);
  return normaliseDoc(docToObj(snap));
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, 'products', id));
  return { id };
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const createOrder = async (data) => {
  const ref = await addDoc(collection(db, 'orders'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return normaliseDoc(docToObj(snap));
};

export const getOrders = async () => {
  const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => normaliseDoc(docToObj(d)));
};

export const getUserOrders = async (userId) => {
  const q = query(
    collection(db, 'orders'),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => normaliseDoc(docToObj(d)));
};

export const updateOrder = async (id, data) => {
  const ref = doc(db, 'orders', id);
  await updateDoc(ref, { ...data, updated_at: serverTimestamp() });
  const snap = await getDoc(ref);
  return normaliseDoc(docToObj(snap));
};

// ─── BLOGS ───────────────────────────────────────────────────────────────────

export const getBlogs = async ({ includeDrafts = false } = {}) => {
  let q = collection(db, 'blogs');
  if (!includeDrafts) {
    q = query(q, where('published', '==', true), orderBy('created_at', 'desc'));
  } else {
    q = query(q, orderBy('created_at', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => normaliseDoc(docToObj(d)));
};

export const getBlogBySlug = async (slug) => {
  const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return normaliseDoc(docToObj(snap.docs[0]));
};

export const createBlog = async (data) => {
  const ref = await addDoc(collection(db, 'blogs'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return normaliseDoc(docToObj(snap));
};

export const updateBlog = async (id, data) => {
  const ref = doc(db, 'blogs', id);
  await updateDoc(ref, { ...data, updated_at: serverTimestamp() });
  const snap = await getDoc(ref);
  return normaliseDoc(docToObj(snap));
};

export const deleteBlog = async (id) => {
  await deleteDoc(doc(db, 'blogs', id));
  return { id };
};

// ─── COUPONS ─────────────────────────────────────────────────────────────────

export const getCoupons = async () => {
  const snap = await getDocs(collection(db, 'coupons'));
  return snap.docs.map(d => normaliseDoc(docToObj(d)));
};

export const getCouponByCode = async (code) => {
  const q = query(
    collection(db, 'coupons'),
    where('code', '==', code.toUpperCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return normaliseDoc(docToObj(snap.docs[0]));
};

export const getActiveCoupons = async () => {
  const q = query(collection(db, 'coupons'), where('active', '==', true));
  const snap = await getDocs(q);
  const now = new Date();
  return snap.docs
    .map(d => normaliseDoc(docToObj(d)))
    .filter(c =>
      (!c.expires_at || new Date(c.expires_at) > now) &&
      (c.max_uses == null || (c.used_count || 0) < c.max_uses)
    );
};

/**
 * Validates a coupon code and returns discount info.
 * Returns { code, discount_amount, discount_type, discount_value } or throws an error.
 */
export const validateCoupon = async (code, orderAmount) => {
  const coupon = await getCouponByCode(code);

  if (!coupon) throw new Error('Coupon code not found');
  if (!coupon.active) throw new Error('This coupon is no longer active');

  const now = new Date();
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    throw new Error('This coupon has expired');
  }
  if (
    coupon.max_uses != null &&
    (coupon.used_count || 0) >= coupon.max_uses
  ) {
    throw new Error('This coupon limit has been reached');
  }

  const minAmount = Number(coupon.min_order_amount) || 0;
  if (Number(orderAmount) < minAmount) {
    throw new Error(`Minimum order amount of $${minAmount.toFixed(2)} is required for this coupon`);
  }

  let discountAmount = 0;
  if (coupon.discount_type === 'percent') {
    discountAmount = Math.round((Number(orderAmount) * (Number(coupon.discount_value) / 100)) * 100) / 100;
  } else {
    discountAmount = Number(coupon.discount_value);
  }
  if (discountAmount > Number(orderAmount)) discountAmount = Number(orderAmount);

  return { ...coupon, discount_amount: discountAmount };
};

export const createCoupon = async (data) => {
  const ref = await addDoc(collection(db, 'coupons'), {
    ...data,
    code: data.code.toUpperCase(),
    used_count: 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return normaliseDoc(docToObj(snap));
};

export const updateCoupon = async (id, data) => {
  const ref = doc(db, 'coupons', id);
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  await updateDoc(ref, { ...clean, updated_at: serverTimestamp() });
  const snap = await getDoc(ref);
  return normaliseDoc(docToObj(snap));
};

export const deleteCoupon = async (id) => {
  await deleteDoc(doc(db, 'coupons', id));
  return { id };
};

export const incrementCouponUse = async (code) => {
  const coupon = await getCouponByCode(code);
  if (!coupon) return;
  await updateDoc(doc(db, 'coupons', coupon.id), {
    used_count: increment(1),
  });
};

// ─── EMAIL LOGS ──────────────────────────────────────────────────────────────

export const getEmailLogs = async () => {
  const q = query(collection(db, 'emailLogs'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => normaliseDoc(docToObj(d)));
};

export const createEmailLog = async (data) => {
  const ref = await addDoc(collection(db, 'emailLogs'), {
    ...data,
    created_at: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return normaliseDoc(docToObj(snap));
};
