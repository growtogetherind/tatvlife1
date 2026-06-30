import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, PlusCircle, Mail, CheckCircle, Package,
  ChevronDown, ChevronUp, AlertCircle, Hash, BarChart2, Users,
  ShoppingBag, ExternalLink, Pencil, Trash2, Settings, Save, FileText,
  Tag,
} from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  getCategories, getProducts, createProduct, updateProduct, deleteProduct,
  getOrders, updateOrder,
  getBlogs, createBlog, updateBlog, deleteBlog,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getEmailLogs, createEmailLog,
  getCheckoutSettings, updateCheckoutSettings, defaultCheckoutSettings,
} from '../lib/firestoreService';

const StatusPill = ({ status }) => {
  const map = {
    unpaid: { cls: 'status-pending', label: 'Unpaid' },
    paid: { cls: 'status-completed', label: 'Paid' },
    pending_payment: { cls: 'status-pending', label: 'Pending Payment' },
    processing: { cls: 'status-processing', label: 'Processing' },
    completed: { cls: 'status-completed', label: 'Completed' },
    sent: { cls: 'status-completed', label: 'Sent' },
    failed: { cls: 'status-cancelled', label: 'Failed' },
    draft_opened: { cls: 'status-processing', label: 'Draft Opened' },
    cancelled: { cls: 'status-cancelled', label: 'Cancelled' },
  };
  const { cls, label } = map[status] || { cls: 'status-cancelled', label: status || 'Unknown' };
  return <span className={`status-pill ${cls}`}>{label}</span>;
};

const paymentMethodLabels = {
  btc: 'Bitcoin (BTC)',
  eth: 'Ethereum (ETH)',
  usdt: 'USDT',
  usdc: 'USDC',
  dai_usds: 'DAI / USDS',
  usd1: 'USD1',
  usde: 'USDe',
  usdg: 'USDG',
  usdd: 'USDD',
  card: 'Credit / Debit Card (USD)',
  paypal: 'PayPal (USD)',
  crypto: 'Cryptocurrency (USDT / USDC / BTC)',
  bank: 'Bank Wire / ACH Transfer (USD)'
};

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [emailLogs, setEmailLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState('');
  const [emailConfigSaving, setEmailConfigSaving] = useState(false);
  const [checkoutSettingsSaving, setCheckoutSettingsSaving] = useState(false);
  const [blogSaving, setBlogSaving] = useState(false);
  const [deletingBlogId, setDeletingBlogId] = useState('');
  const [couponSaving, setCouponSaving] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState('');
  const [editingCouponId, setEditingCouponId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailForm, setEmailForm] = useState({
    recipient: '',
    subject: 'The WellMan Co: Action Required - Secure Payment Link',
    template: 'payment_link',
    message: `Dear Customer,\n\nYour order is currently awaiting payment. Please complete your transaction by visiting the secure payment link below:\n\nhttp://localhost:5173/checkout\n\nWarm regards,\nThe WellMan Co Support Team`,
    paymentLink: 'http://localhost:5173/checkout',
  });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDrafts, setOrderDrafts] = useState({});
  const [editingProductId, setEditingProductId] = useState('');
  const [editingBlogId, setEditingBlogId] = useState('');
  const [seeding, setSeeding] = useState(false);

  const handleSeedFromDbJson = async () => {
    if (!window.confirm('This will seed/merge legacy categories, products, orders, blogs, coupons, and email logs into Firestore. Continue?')) return;
    setError('');
    setSuccess('');
    setSeeding(true);
    try {
      const res = await fetch('/db.json');
      if (!res.ok) throw new Error('Could not fetch db.json. Make sure it is copied to the public folder.');
      const data = await res.json();
      
      // Import categories
      const categoriesList = data.categories || [];
      for (const item of categoriesList) {
        await setDoc(doc(db, 'categories', item.id), item);
      }
      
      // Import products
      const productsList = data.products || [];
      for (const item of productsList) {
        await setDoc(doc(db, 'products', item.id), {
          ...item,
          price: Number(item.price),
          stock: Number(item.stock),
          created_at: item.created_at ? new Date(item.created_at) : new Date(),
          updated_at: item.updated_at ? new Date(item.updated_at) : new Date(),
        });
      }

      // Import blogs
      const blogsList = data.blogs || [];
      for (const item of blogsList) {
        await setDoc(doc(db, 'blogs', item.id), {
          ...item,
          created_at: item.created_at ? new Date(item.created_at) : new Date(),
        });
      }

      // Import coupons
      const couponsList = data.coupons || [];
      for (const item of couponsList) {
        await setDoc(doc(db, 'coupons', item.id), {
          ...item,
          created_at: item.created_at ? new Date(item.created_at) : new Date(),
          updated_at: item.updated_at ? new Date(item.updated_at) : new Date(),
        });
      }

      // Import orders
      const ordersList = data.orders || [];
      for (const item of ordersList) {
        await setDoc(doc(db, 'orders', item.id), {
          ...item,
          created_at: item.created_at ? new Date(item.created_at) : new Date(),
        });
      }

      // Import email logs
      const emailLogsList = data.emailLogs || [];
      for (const item of emailLogsList) {
        await setDoc(doc(db, 'emailLogs', item.id), {
          ...item,
          sent_at: item.sent_at ? new Date(item.sent_at) : new Date(),
        });
      }

      setSuccess('All records from db.json have been successfully migrated and seeded into Firestore!');
      await fetchData();
    } catch (err) {
      setError(err.message || 'Error during database seeding.');
    } finally {
      setSeeding(false);
    }
  };

  const blankProductForm = {
    name: '', slug: '', description: '', manufacturer: '',
    price: '', stock: '', product_information: '', packaging: '',
    category_id: 'sexual-health', featured: false, active: true, image_url: '',
  };

  const [productForm, setProductForm] = useState(blankProductForm);
  const blankBlogForm = {
    title: '', slug: '', excerpt: '', content: '', cover_image: '',
    author_name: 'The WellMan Co Support Team', published: true,
  };
  const [blogForm, setBlogForm] = useState(blankBlogForm);
  const blankCouponForm = {
    code: '', title: '', discount_type: 'percent', discount_value: '',
    min_order_amount: '', max_uses: '', expires_at: '', active: true, banner_text: ''
  };
  const [couponForm, setCouponForm] = useState(blankCouponForm);
  const [emailConfig, setEmailConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    fromEmail: '',
    fromName: 'The WellMan Co Support Team',
    replyTo: '',
    configured: false,
  });
  const [checkoutSettings, setCheckoutSettings] = useState(defaultCheckoutSettings);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login?redirect=/admin');
    } else if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchData = async () => {
    try {
      setPageLoading(true);
      const [cRes, pRes, oRes, bRes, coupRes] = await Promise.all([
        getCategories(),
        getProducts({ includeInactive: true }),
        getOrders(),
        getBlogs({ includeDrafts: true }),
        getCoupons(),
      ]);
      setCategories(cRes);
      setProducts(pRes);
      setOrders(oRes);
      setBlogs(bRes);
      setCoupons(coupRes);
      setCheckoutSettings(await getCheckoutSettings());
    } catch (err) { console.error(err); }
    finally { setPageLoading(false); }
  };

  const fetchEmailLogs = async () => {
    try {
      const logs = await getEmailLogs();
      setEmailLogs(logs);
    } catch (err) { console.error(err); }
  };

  const fetchEmailConfig = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'email'));
      if (snap.exists()) {
        setEmailConfig(prev => ({ ...prev, ...snap.data(), pass: '' }));
      }
    } catch (err) { console.error(err); }
  };


  useEffect(() => { if (user && isAdmin) fetchData(); }, [user, isAdmin]);
  useEffect(() => {
    if (activeTab === 'email-logs' && user && isAdmin) {
      fetchEmailLogs();
      fetchEmailConfig();
    }
  }, [activeTab, user, isAdmin]);

  if (loading || pageLoading) {
    return (
      <div className="admin-layout" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Loading admin dashboard…</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Please wait while we verify your account.</div>
        </div>
      </div>
    );
  }

  const handleSaveProduct = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProductSaving(true);
    try {
      const data = {
        name: productForm.name,
        slug: productForm.slug,
        description: productForm.description,
        manufacturer: productForm.manufacturer,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        product_information: productForm.product_information,
        packaging: productForm.packaging,
        category_id: productForm.category_id,
        featured: Boolean(productForm.featured),
        active: Boolean(productForm.active),
        image_url: productForm.image_url,
      };
      let saved;
      if (editingProductId) {
        saved = await updateProduct(editingProductId, data);
      } else {
        saved = await createProduct(data);
      }
      setProducts(prev => {
        if (editingProductId) return prev.map(product => product.id === saved.id ? saved : product);
        return [saved, ...prev];
      });
      setSuccess(`"${saved.name}" ${editingProductId ? 'updated' : 'added'} successfully.`);
      setProductForm(blankProductForm);
      setEditingProductId('');
      setActiveTab('products');
      fetchData();
    } catch (err) { setError(err.message || 'Error saving product.'); }
    finally { setProductSaving(false); }
  };

  const handleProductChange = e => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditProduct = product => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      manufacturer: product.manufacturer || '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      product_information: product.product_information || '',
      packaging: product.packaging || '',
      category_id: product.category_id || categories[0]?.id || 'sexual-health',
      featured: !!product.featured,
      active: product.active !== false,
      image_url: product.image_url || '',
    });
    setActiveTab('add-product');
  };

  const handleDeleteProduct = async product => {
    if (!window.confirm(`Delete "${product.name}" from the catalog?`)) return;

    setError('');
    setSuccess('');
    setDeletingProductId(product.id);
    try {
      await deleteProduct(product.id);
      setProducts(prev => prev.filter(item => item.id !== product.id));
      setSuccess(`"${product.name}" deleted from the catalog.`);
      if (editingProductId === product.id) {
        setEditingProductId('');
        setProductForm(blankProductForm);
      }
    } catch (err) {
      setError(err.message || 'Error deleting product.');
    } finally {
      setDeletingProductId('');
    }
  };

  const handleCancelProductEdit = () => {
    setEditingProductId('');
    setProductForm(blankProductForm);
    setActiveTab('products');
  };

  const handleBlogChange = e => {
    const { name, value, type, checked } = e.target;
    setBlogForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveBlog = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBlogSaving(true);
    try {
      const data = {
        title: blogForm.title,
        slug: blogForm.slug,
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        cover_image: blogForm.cover_image,
        author_name: blogForm.author_name,
        published: Boolean(blogForm.published),
      };
      let saved;
      if (editingBlogId) {
        saved = await updateBlog(editingBlogId, data);
      } else {
        saved = await createBlog(data);
      }
      setBlogs(prev => editingBlogId ? prev.map(blog => blog.id === saved.id ? saved : blog) : [saved, ...prev]);
      setBlogForm(blankBlogForm);
      setEditingBlogId('');
      setActiveTab('blogs');
      setSuccess(`"${saved.title}" ${editingBlogId ? 'updated' : 'published'} successfully.`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Error saving blog.');
    } finally {
      setBlogSaving(false);
    }
  };

  const handleEditBlog = blog => {
    setEditingBlogId(blog.id);
    setBlogForm({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      cover_image: blog.cover_image || '',
      author_name: blog.author_name || 'The WellMan Co Support Team',
      published: blog.published !== false,
    });
    setActiveTab('blog-editor');
  };

  const handleDeleteBlog = async blog => {
    if (!window.confirm(`Delete "${blog.title}" from the blog?`)) return;
    setError('');
    setSuccess('');
    setDeletingBlogId(blog.id);
    try {
      await deleteBlog(blog.id);
      setBlogs(prev => prev.filter(item => item.id !== blog.id));
      if (editingBlogId === blog.id) {
        setEditingBlogId('');
        setBlogForm(blankBlogForm);
      }
      setSuccess(`"${blog.title}" deleted.`);
    } catch (err) {
      setError(err.message || 'Error deleting blog.');
    } finally {
      setDeletingBlogId('');
    }
  };

  const handleCancelBlogEdit = () => {
    setEditingBlogId('');
    setBlogForm(blankBlogForm);
    setActiveTab('blogs');
  };

  const handleEmailConfigChange = e => {
    const { name, value, type, checked } = e.target;
    setEmailConfig(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveEmailConfig = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setEmailConfigSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'email'), {
        ...emailConfig,
        configured: true,
      });
      setEmailConfig(prev => ({ ...prev, configured: true, pass: '' }));
      setSuccess('Local SMTP configuration simulated and saved.');
    } catch (err) {
      setError(err.message || 'Error saving email settings.');
    } finally {
      setEmailConfigSaving(false);
    }
  };

  const handleClearEmailConfig = async () => {
    if (!window.confirm('Are you sure you want to remove the SMTP configuration?')) return;
    setError('');
    setSuccess('');
    setEmailConfigSaving(true);
    try {
      await deleteDoc(doc(db, 'settings', 'email'));
      setEmailConfig({
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        fromEmail: '',
        fromName: 'The WellMan Co Support Team',
        replyTo: '',
        configured: false,
      });
      setSuccess('Local SMTP configuration removed.');
    } catch (err) {
      setError(err.message || 'Error removing email settings.');
    } finally {
      setEmailConfigSaving(false);
    }
  };

  const handleCheckoutSettingsChange = e => {
    const { name, value, type, checked } = e.target;
    setCheckoutSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveCheckoutSettings = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCheckoutSettingsSaving(true);
    try {
      const saved = await updateCheckoutSettings(checkoutSettings);
      setCheckoutSettings({
        tax_enabled: Boolean(saved.tax_enabled),
        tax_rate_percent: Number(saved.tax_rate_percent) || 0,
        delivery_fee: Number(saved.delivery_fee) || 0,
        free_delivery_threshold: Number(saved.free_delivery_threshold) || 0,
      });
      setSuccess('Checkout settings updated successfully.');
    } catch (err) {
      setError(err.message || 'Error saving checkout settings.');
    } finally {
      setCheckoutSettingsSaving(false);
    }
  };

  const handleCouponChange = e => {
    const { name, value, type, checked } = e.target;
    setCouponForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveCoupon = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCouponSaving(true);
    try {
      const data = {
        code: couponForm.code.toUpperCase(),
        title: couponForm.title,
        discount_type: couponForm.discount_type,
        discount_value: Number(couponForm.discount_value),
        min_order_amount: Number(couponForm.min_order_amount) || 0,
        max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null,
        expires_at: couponForm.expires_at ? new Date(couponForm.expires_at).toISOString() : null,
        active: Boolean(couponForm.active),
        banner_text: couponForm.banner_text,
      };
      let saved;
      if (editingCouponId) {
        saved = await updateCoupon(editingCouponId, data);
      } else {
        saved = await createCoupon(data);
      }
      setSuccess(`Coupon "${saved.code}" ${editingCouponId ? 'updated' : 'created'} successfully.`);
      setCouponForm(blankCouponForm);
      setEditingCouponId('');
      const cList = await getCoupons();
      setCoupons(cList);
    } catch (err) { setError(err.message || 'Error saving coupon.'); }
    finally { setCouponSaving(false); }
  };

  const handleEditCoupon = coupon => {
    setEditingCouponId(coupon.id);
    setCouponForm({
      code: coupon.code || '',
      title: coupon.title || '',
      discount_type: coupon.discount_type || 'percent',
      discount_value: String(coupon.discount_value ?? ''),
      min_order_amount: String(coupon.min_order_amount ?? ''),
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '',
      active: coupon.active !== false,
      banner_text: coupon.banner_text || '',
    });
  };

  const handleToggleCouponActive = async coupon => {
    setError('');
    setSuccess('');
    try {
      await updateCoupon(coupon.id, { active: !coupon.active });
      setSuccess(`Coupon "${coupon.code}" status updated.`);
      const cList = await getCoupons();
      setCoupons(cList);
    } catch (err) { setError(err.message || 'Error toggling coupon.'); }
  };

  const handleDeleteCoupon = async coupon => {
    if (!window.confirm(`Delete coupon "${coupon.code}" permanently?`)) return;
    setError('');
    setSuccess('');
    setDeletingCouponId(coupon.id);
    try {
      await deleteCoupon(coupon.id);
      setSuccess(`Coupon "${coupon.code}" deleted.`);
      if (editingCouponId === coupon.id) {
        setEditingCouponId('');
        setCouponForm(blankCouponForm);
      }
      const cList = await getCoupons();
      setCoupons(cList);
    } catch (err) { setError(err.message || 'Error deleting coupon.'); }
    finally { setDeletingCouponId(''); }
  };

  const handleCancelCouponEdit = () => {
    setEditingCouponId('');
    setCouponForm(blankCouponForm);
  };

  const handleOrderDraftChange = (orderId, field, value) => {
    setOrderDrafts(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value },
    }));
  };

  const handleUpdateOrder = async order => {
    const draft = orderDrafts[order.id] || {};
    const updates = {
      order_status: draft.order_status ?? order.order_status,
      payment_status: draft.payment_status ?? order.payment_status,
      payment_link: draft.payment_link ?? order.payment_link,
      transaction_hash: draft.transaction_hash ?? order.transaction_hash,
    };

    setError('');
    setSuccess('');
    try {
      const data = await updateOrder(order.id, updates);
      setOrders(prev => prev.map(item => item.id === data.id ? data : item));
      setOrderDrafts(prev => {
        const next = { ...prev };
        delete next[order.id];
        return next;
      });
      setSuccess(`Order #${order.id.slice(0, 12)} updated.`);
    } catch (err) {
      setError(err.message || 'Error updating order.');
    }
  };

  const customerOptions = [...new Map(orders
    .filter(order => order.user_email)
    .map(order => [order.user_email, {
      id: order.user_id || order.user_email,
      email: order.user_email,
      name: order.shipping_address?.fullName || order.user_email,
    }])
  ).values()];

  const getEmailTemplateCopy = (template, paymentLink = emailForm.paymentLink) => {
    if (template === 'order_confirmation') {
      return {
        subject: 'The WellMan Co: Order Confirmed & Paid',
        message: `Dear Customer,\n\nWe have received your payment. Your order has been confirmed and is now being processed.\n\nThank you for shopping with us.\n\nWarm regards,\nThe WellMan Co Support Team`,
      };
    }

    if (template === 'shipping_notification') {
      return {
        subject: 'The WellMan Co: Your Order Has Been Dispatched',
        message: `Dear Customer,\n\nYour order has been shipped and is on its way to your address. You can track shipment details in your dashboard.\n\nWarm regards,\nThe WellMan Co Support Team`,
      };
    }

    return {
      subject: 'The WellMan Co: Action Required - Secure Payment Link',
      message: `Dear Customer,\n\nYour order is currently awaiting payment. Please complete your transaction by visiting the secure payment link below:\n\n${paymentLink || `${window.location.origin}/checkout`}\n\nWarm regards,\nThe WellMan Co Support Team`,
    };
  };

  const handleTemplateChange = template => {
    const copy = getEmailTemplateCopy(template);
    setEmailForm(prev => ({
      ...prev,
      template,
      subject: copy.subject,
      message: copy.message,
    }));
  };

  const handlePaymentLinkChange = paymentLink => {
    setEmailForm(prev => ({
      ...prev,
      paymentLink,
      message: prev.template === 'payment_link'
        ? getEmailTemplateCopy('payment_link', paymentLink).message
        : prev.message,
    }));
  };

  const handleSharePayment = order => {
    const checkoutUrl = `${window.location.origin}/checkout?order=${order.id}`;
    const customerName = order.shipping_address?.fullName || 'Customer';

    setActiveTab('email-logs');
    setEmailForm({
      recipient: order.user_email || '',
      subject: `Secure Payment Link for Order #${order.id.slice(0, 8).toUpperCase()}`,
      template: 'payment_link',
      message: `Dear ${customerName},\n\nThank you for choosing The WellMan Co. Your order #${order.id.slice(0, 8).toUpperCase()} for $${Number(order.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} is pending payment.\n\nPlease complete your payment securely using the link below:\n\n${checkoutUrl}\n\nIf you have any questions, please contact our support team.\n\nWarm regards,\nThe WellMan Co Support Team`,
      paymentLink: checkoutUrl,
    });
    setSuccess('Payment email template is ready to send.');
  };

  const handleSendEmail = async e => {
    e.preventDefault();
    if (!emailForm.recipient) {
      setError('Please select or enter a recipient.');
      return;
    }

    setError('');
    setSuccess('');
    setEmailSending(true);
    try {
      const log = await createEmailLog({
        user_email: emailForm.recipient,
        email_type: emailForm.template,
        subject: emailForm.subject,
        body: emailForm.message,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
      setEmailLogs(prev => [log, ...prev]);
      setSuccess(`Email simulated and logged for ${emailForm.recipient}.`);
      setEmailForm({
        recipient: '',
        subject: 'The WellMan Co: Action Required - Secure Payment Link',
        template: 'payment_link',
        message: `Dear Customer,\n\nYour order is currently awaiting payment. Please complete your transaction by visiting the secure payment link below:\n\n${window.location.origin}/checkout\n\nWarm regards,\nThe WellMan Co Support Team`,
        paymentLink: `${window.location.origin}/checkout`,
      });
    } catch (err) {
      setError(err.message || 'Error sending email.');
    } finally {
      setEmailSending(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'blog-editor', label: 'Blog Editor', icon: PlusCircle },
    { id: 'coupons', label: 'Offers & Coupons', icon: Tag },
    { id: 'checkout-settings', label: 'Checkout Settings', icon: Settings },
    { id: 'email-logs', label: 'Email Logs', icon: Mail },
  ];

  const stats = [
    { label: 'Orders', value: orders.length, icon: ShoppingBag },
    { label: 'Products', value: products.length, icon: Package },
    { label: 'Blogs', value: blogs.length, icon: FileText },
    { label: 'Customers', value: new Set(orders.map(order => order.user_email)).size, icon: Users },
    { label: 'Revenue', value: `$${orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: BarChart2 },
  ];

  return (
    <div className="admin-layout" style={{ minHeight: 'calc(100vh - 36px)' }}>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.5 2 5 5 5 9C5 13 8 15.5 12 22C16 15.5 19 13 19 9C19 5 15.5 2 12 2Z" fill="white" opacity="0.9"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 600, color: 'white' }}>Admin Console</span>
          </div>
          <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>The WellMan Co Systems</p>
        </div>

        <nav style={{ padding: '12px 0', flex: 1 }}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`admin-nav-link ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>Logged in as</div>
          <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.65)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content" style={{ padding: '36px 40px' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--green-900)', marginBottom: '4px' }}>
            {navItems.find(n => n.id === activeTab)?.label}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', margin: 0 }}>
            Administrative control panel — The WellMan Co platform management.
          </p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}><AlertCircle size={15} style={{ flexShrink: 0 }} /><span>{error}</span></div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}><CheckCircle size={15} style={{ flexShrink: 0 }} /><span>{success}</span></div>}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: '16px' }}>
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div className="stat-card-label">{label}</div>
                      <div className="stat-card-value">{value}</div>
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon size={18} color="var(--green-700)" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>Recent Orders</h2>
                <button className="btn-ghost btn-sm" onClick={() => setActiveTab('orders')}>View all</button>
              </div>
              {orders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No orders yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th></tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id}>
                        <td><code>#{order.id.slice(0, 12)}</code></td>
                        <td>{order.user_email}</td>
                        <td>${Number(order.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td><StatusPill status={order.order_status} /></td>
                        <td><StatusPill status={order.payment_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card-elevated" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '20px 24px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green-900)', margin: '0 0 4px 0' }}>Data Migration & Seeding</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Import initial categories, products, orders, coupons, blogs, and configurations from the legacy database.</p>
              </div>
              <button className="btn-primary" onClick={handleSeedFromDbJson} disabled={seeding} style={{ padding: '12px 20px', borderRadius: '10px', fontSize: '13.5px' }}>
                {seeding ? 'Seeding Database...' : 'Seed from db.json'}
              </button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.length === 0 ? (
              <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
                <Package size={24} color="var(--text-light)" />
                <p style={{ color: 'var(--text-muted)', marginTop: '10px', marginBottom: 0 }}>No orders found.</p>
              </div>
            ) : orders.map(order => {
              const draft = orderDrafts[order.id] || {};
              const isOpen = expandedOrder === order.id;

              return (
                <div key={order.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                    style={{ width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', border: 'none', background: isOpen ? 'var(--green-50)' : 'white', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '140px minmax(180px, 1fr) 110px 150px 120px', gap: '16px', alignItems: 'center', width: '100%' }}>
                      <div>
                        <div className="label" style={{ marginBottom: '2px' }}>Order</div>
                        <code>#{order.id.slice(0, 12)}</code>
                      </div>
                      <div>
                        <div className="label" style={{ marginBottom: '2px' }}>Customer</div>
                        <span style={{ fontSize: '13.5px', color: 'var(--text-dark)' }}>{order.user_email}</span>
                      </div>
                      <div>
                        <div className="label" style={{ marginBottom: '2px' }}>Total</div>
                        <strong>${Number(order.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <StatusPill status={order.order_status} />
                      <StatusPill status={order.payment_status} />
                    </div>
                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '22px 20px', borderTop: '1px solid var(--beige-100)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div>
                        <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--green-900)' }}>Order Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                          {(order.items || []).map((item, index) => (
                            <div key={`${item.product_id}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 12px', border: '1px solid var(--beige-100)', borderRadius: '10px', background: '#fdfcfb', fontSize: '13px' }}>
                              <span><strong>{item.quantity}x</strong> {item.name}</span>
                              <strong>${Number(item.price * item.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-dark)' }}>
                          <strong>{order.shipping_address?.fullName}</strong><br />
                          {order.shipping_address?.addressLine}<br />
                          {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postalCode}<br />
                          {order.shipping_address?.country}
                        </div>
                        <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--green-50)', border: '1px solid var(--green-100)', borderRadius: '10px', fontSize: '13px' }}>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Payment Method</span>
                          <strong style={{ color: 'var(--green-900)' }}>
                            {paymentMethodLabels[order.payment_method] || order.payment_method || 'Cryptocurrency (USDT / USDC / BTC)'}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--green-900)' }}>Manage Order</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          <div>
                            <label className="label">Order Status</label>
                            <select className="select" value={draft.order_status ?? order.order_status} onChange={e => handleOrderDraftChange(order.id, 'order_status', e.target.value)}>
                              <option value="pending_payment">Pending Payment</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label className="label">Payment Status</label>
                            <select className="select" value={draft.payment_status ?? order.payment_status} onChange={e => handleOrderDraftChange(order.id, 'payment_status', e.target.value)}>
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label className="label">Payment Link</label>
                            <input className="input" value={draft.payment_link ?? order.payment_link ?? ''} onChange={e => handleOrderDraftChange(order.id, 'payment_link', e.target.value)} placeholder="https://checkout..." />
                          </div>
                          <div>
                            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Hash size={11} /> Transaction Hash</label>
                            <input className="input" value={draft.transaction_hash ?? order.transaction_hash ?? ''} onChange={e => handleOrderDraftChange(order.id, 'transaction_hash', e.target.value)} placeholder="0x..." />
                          </div>
                          {order.payment_link && (
                            <a href={order.payment_link} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm" style={{ width: 'fit-content', borderRadius: '10px', gap: '6px' }}>
                              Open payment link <ExternalLink size={13} />
                            </a>
                          )}
                          <button type="button" className="btn-outline btn-sm" style={{ width: 'fit-content', borderRadius: '10px', gap: '6px' }} onClick={() => handleSharePayment(order)}>
                            <Mail size={13} /> Share Payment
                          </button>
                          <button type="button" className="btn-primary" style={{ borderRadius: '10px', width: 'fit-content' }} onClick={() => handleUpdateOrder(order)}>
                            <CheckCircle size={15} /> Save Order
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="card-elevated">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>Product Catalog</h2>
              <button className="btn-primary btn-sm" onClick={() => { setEditingProductId(''); setProductForm(blankProductForm); setActiveTab('add-product'); }}>
                <PlusCircle size={14} /> Add Product
              </button>
            </div>
            {products.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No products found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Manufacturer</th><th>Price</th><th>Stock</th><th>Status</th><th>Featured</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={product.image_url} alt="" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', background: 'var(--beige-100)' }} />
                          <div>
                            <div style={{ fontWeight: 700 }}>{product.name}</div>
                            <code style={{ color: 'var(--text-light)', fontSize: '11.5px' }}>{product.slug}</code>
                          </div>
                        </div>
                      </td>
                      <td>{product.categories?.name || product.category_id}</td>
                      <td>{product.manufacturer}</td>
                      <td>${Number(product.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td>{product.stock ?? 0}</td>
                      <td><StatusPill status={product.active === false ? 'cancelled' : 'completed'} /></td>
                      <td>{product.featured ? 'Yes' : 'No'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button type="button" className="btn-outline btn-sm" style={{ borderRadius: '10px', padding: '8px 12px' }} onClick={() => handleEditProduct(product)}>
                            <Pencil size={13} /> Edit
                          </button>
                          <button type="button" className="btn-ghost btn-sm" style={{ borderRadius: '10px', padding: '8px 12px', color: '#b91c1c' }} onClick={() => handleDeleteProduct(product)} disabled={deletingProductId === product.id}>
                            <Trash2 size={13} /> {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === 'add-product' && (
          <div className="card-elevated" style={{ maxWidth: '820px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={18} color="var(--green-700)" />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>{editingProductId ? 'Edit Product' : 'Add Product to Catalog'}</h2>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Product Name</label>
                  <input type="text" className="input" name="name" required value={productForm.name} onChange={handleProductChange} placeholder="e.g. Temozolomide 100mg" />
                </div>
                <div>
                  <label className="label">URL Slug</label>
                  <input type="text" className="input" name="slug" required value={productForm.slug} onChange={handleProductChange} placeholder="e.g. temozolomide-100mg" />
                </div>
              </div>
              <div>
                <label className="label">Description / Indication</label>
                <textarea className="input" name="description" rows="3" style={{ resize: 'vertical' }} value={productForm.description} onChange={handleProductChange} placeholder="Describe the therapy usage and indication..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Product Information</label>
                  <textarea
                    className="input"
                    name="product_information"
                    rows="5"
                    style={{ resize: 'vertical', lineHeight: 1.6 }}
                    value={productForm.product_information}
                    onChange={handleProductChange}
                    placeholder="Add product benefits, usage notes, ingredients, or safety information..."
                  />
                </div>
                <div>
                  <label className="label">Packaging</label>
                  <textarea
                    className="input"
                    name="packaging"
                    rows="5"
                    style={{ resize: 'vertical', lineHeight: 1.6 }}
                    value={productForm.packaging}
                    onChange={handleProductChange}
                    placeholder="Add package format, quantity, storage, or dispatch notes..."
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Manufacturer</label>
                  <input type="text" className="input" name="manufacturer" value={productForm.manufacturer} onChange={handleProductChange} placeholder="e.g. Novartis" />
                </div>
                <div>
                  <label className="label">Price (USD)</label>
                  <input type="number" className="input" name="price" required value={productForm.price} onChange={handleProductChange} placeholder="50" />
                </div>
                <div>
                  <label className="label">Stock Level</label>
                  <input type="number" className="input" name="stock" value={productForm.stock} onChange={handleProductChange} placeholder="50" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr auto', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label className="label">Category</label>
                  <div style={{ position: 'relative' }}>
                    <select className="select" name="category_id" value={productForm.category_id} onChange={handleProductChange}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                  </div>
                </div>
                <div>
                  <label className="label">Image URL (optional)</label>
                  <input type="text" className="input" name="image_url" value={productForm.image_url} onChange={handleProductChange} placeholder="https://..." />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '2px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)' }}>
                    <input type="checkbox" name="featured" checked={productForm.featured} onChange={handleProductChange} style={{ accentColor: 'var(--green-800)', width: '16px', height: '16px' }} />
                    Featured
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)' }}>
                    <input type="checkbox" name="active" checked={productForm.active} onChange={handleProductChange} style={{ accentColor: 'var(--green-800)', width: '16px', height: '16px' }} />
                    Active
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {editingProductId && (
                  <button type="button" className="btn-outline" style={{ flex: 1, borderRadius: '12px', padding: '14px' }} onClick={handleCancelProductEdit}>
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={productSaving} style={{ flex: 1, borderRadius: '12px', padding: '14px', gap: '8px' }}>
                  <CheckCircle size={16} />
                  {productSaving ? 'Saving...' : editingProductId ? 'Save Changes' : 'Save to Inventory'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <div className="card-elevated">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>Blog Posts</h2>
              <button className="btn-primary btn-sm" onClick={() => { setEditingBlogId(''); setBlogForm(blankBlogForm); setActiveTab('blog-editor'); }}>
                <PlusCircle size={14} /> Add Blog
              </button>
            </div>
            {blogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No blog posts found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Title</th><th>Author</th><th>Status</th><th>Created</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {blogs.map(blog => (
                    <tr key={blog.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{blog.title}</div>
                        <code style={{ color: 'var(--text-light)', fontSize: '11.5px' }}>{blog.slug}</code>
                      </td>
                      <td>{blog.author_name}</td>
                      <td><StatusPill status={blog.published === false ? 'pending_payment' : 'completed'} /></td>
                      <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {blog.published !== false && (
                            <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm" style={{ borderRadius: '10px', padding: '8px 12px' }}>
                              <ExternalLink size={13} /> View
                            </a>
                          )}
                          <button type="button" className="btn-outline btn-sm" style={{ borderRadius: '10px', padding: '8px 12px' }} onClick={() => handleEditBlog(blog)}>
                            <Pencil size={13} /> Edit
                          </button>
                          <button type="button" className="btn-ghost btn-sm" style={{ borderRadius: '10px', padding: '8px 12px', color: '#b91c1c' }} onClick={() => handleDeleteBlog(blog)} disabled={deletingBlogId === blog.id}>
                            <Trash2 size={13} /> {deletingBlogId === blog.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Blog Editor Tab */}
        {activeTab === 'blog-editor' && (
          <div className="card-elevated" style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="var(--green-700)" />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>{editingBlogId ? 'Edit Blog Post' : 'Add Blog Post'}</h2>
            </div>

            <form onSubmit={handleSaveBlog} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Title</label>
                  <input className="input" name="title" value={blogForm.title} onChange={handleBlogChange} required placeholder="Wellness guide title" />
                </div>
                <div>
                  <label className="label">URL Slug</label>
                  <input className="input" name="slug" value={blogForm.slug} onChange={handleBlogChange} required placeholder="wellness-guide-title" />
                </div>
              </div>
              <div>
                <label className="label">Excerpt</label>
                <textarea className="input" name="excerpt" rows={3} value={blogForm.excerpt} onChange={handleBlogChange} required style={{ resize: 'vertical' }} placeholder="Short summary shown on the blog listing..." />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea className="input" name="content" rows={10} value={blogForm.content} onChange={handleBlogChange} required style={{ resize: 'vertical', lineHeight: 1.7 }} placeholder="Write the full post here..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label className="label">Cover Image URL</label>
                  <input className="input" name="cover_image" value={blogForm.cover_image} onChange={handleBlogChange} placeholder="https://..." />
                </div>
                <div>
                  <label className="label">Author</label>
                  <input className="input" name="author_name" value={blogForm.author_name} onChange={handleBlogChange} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)', paddingBottom: '12px' }}>
                  <input type="checkbox" name="published" checked={blogForm.published} onChange={handleBlogChange} style={{ accentColor: 'var(--green-800)', width: '16px', height: '16px' }} />
                  Published
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {editingBlogId && (
                  <button type="button" className="btn-outline" style={{ flex: 1, borderRadius: '12px', padding: '14px' }} onClick={handleCancelBlogEdit}>
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={blogSaving} style={{ flex: 1, borderRadius: '12px', padding: '14px', gap: '8px' }}>
                  <CheckCircle size={16} />
                  {blogSaving ? 'Saving...' : editingBlogId ? 'Save Changes' : 'Publish Blog'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Checkout Settings Tab */}
        {activeTab === 'checkout-settings' && (
          <div className="card-elevated" style={{ maxWidth: '760px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Settings size={18} color="var(--green-700)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>Checkout Pricing Settings</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: 1.6, marginTop: 0, marginBottom: '22px' }}>
              Control tax and delivery fees used during checkout. Delivery becomes free automatically when the cart subtotal reaches the configured threshold.
            </p>

            <form onSubmit={handleSaveCheckoutSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: 'var(--green-900)' }}>
                <input
                  type="checkbox"
                  name="tax_enabled"
                  checked={Boolean(checkoutSettings.tax_enabled)}
                  onChange={handleCheckoutSettingsChange}
                  style={{ accentColor: 'var(--green-800)', width: '17px', height: '17px' }}
                />
                Enable tax at checkout
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
                <div>
                  <label className="label">Tax Rate (%)</label>
                  <input
                    className="input"
                    type="number"
                    name="tax_rate_percent"
                    min="0"
                    step="0.01"
                    value={checkoutSettings.tax_rate_percent}
                    onChange={handleCheckoutSettingsChange}
                    disabled={!checkoutSettings.tax_enabled}
                  />
                </div>
                <div>
                  <label className="label">Delivery Fee ($)</label>
                  <input
                    className="input"
                    type="number"
                    name="delivery_fee"
                    min="0"
                    step="0.01"
                    value={checkoutSettings.delivery_fee}
                    onChange={handleCheckoutSettingsChange}
                  />
                </div>
                <div>
                  <label className="label">Free Delivery Over ($)</label>
                  <input
                    className="input"
                    type="number"
                    name="free_delivery_threshold"
                    min="0"
                    step="0.01"
                    value={checkoutSettings.free_delivery_threshold}
                    onChange={handleCheckoutSettingsChange}
                  />
                </div>
              </div>

              <div style={{ padding: '14px 16px', border: '1px solid var(--green-100)', borderRadius: '12px', background: 'var(--green-50)', color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                Current rule: customers receive free delivery when their subtotal is at least ${Number(checkoutSettings.free_delivery_threshold || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}.
              </div>

              <button type="submit" className="btn-primary" disabled={checkoutSettingsSaving} style={{ width: 'fit-content', borderRadius: '12px', gap: '8px' }}>
                <Save size={15} />
                {checkoutSettingsSaving ? 'Saving...' : 'Save Checkout Settings'}
              </button>
            </form>
          </div>
        )}

        {/* Email Management Tab */}
        {activeTab === 'email-logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Settings size={18} color="var(--green-700)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>Local Email Settings</h2>
                <StatusPill status={emailConfig.configured ? 'completed' : 'pending_payment'} />
              </div>
              <form onSubmit={handleSaveEmailConfig} style={{ display: 'grid', gridTemplateColumns: '1.2fr 120px 1fr 1fr', gap: '14px', alignItems: 'end' }}>
                <div>
                  <label className="label">SMTP Host</label>
                  <input className="input" name="host" value={emailConfig.host} onChange={handleEmailConfigChange} placeholder="smtp.gmail.com" required />
                </div>
                <div>
                  <label className="label">Port</label>
                  <input className="input" type="number" name="port" value={emailConfig.port} onChange={handleEmailConfigChange} required />
                </div>
                <div>
                  <label className="label">SMTP User</label>
                  <input className="input" name="user" value={emailConfig.user} onChange={handleEmailConfigChange} placeholder="sender@example.com" required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input className="input" type="password" name="pass" value={emailConfig.pass} onChange={handleEmailConfigChange} placeholder={emailConfig.configured ? 'Saved password unchanged' : 'App password'} />
                </div>
                <div>
                  <label className="label">From Email</label>
                  <input className="input" type="email" name="fromEmail" value={emailConfig.fromEmail} onChange={handleEmailConfigChange} placeholder="Customersupport@thewellmanco.com" required />
                </div>
                <div>
                  <label className="label">From Name</label>
                  <input className="input" name="fromName" value={emailConfig.fromName} onChange={handleEmailConfigChange} />
                </div>
                <div>
                  <label className="label">Reply To</label>
                  <input className="input" type="email" name="replyTo" value={emailConfig.replyTo} onChange={handleEmailConfigChange} placeholder="Optional" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" name="secure" checked={emailConfig.secure} onChange={handleEmailConfigChange} style={{ accentColor: 'var(--green-800)', width: '16px', height: '16px' }} />
                    SSL/TLS
                  </label>
                  <button type="submit" className="btn-primary btn-sm" disabled={emailConfigSaving} style={{ borderRadius: '10px', gap: '7px' }}>
                    <Save size={14} /> {emailConfigSaving ? 'Saving...' : 'Save'}
                  </button>
                  {emailConfig.configured && (
                    <button type="button" className="btn-ghost btn-sm" disabled={emailConfigSaving} onClick={handleClearEmailConfig} style={{ borderRadius: '10px', gap: '7px', color: '#b91c1c' }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)', gap: '24px', alignItems: 'start' }}>
              <div className="card-elevated">
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', marginBottom: '20px' }}>Email Dispatcher</h2>
              <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">Recipient Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="customer@example.com"
                    value={emailForm.recipient}
                    onChange={e => setEmailForm(prev => ({ ...prev, recipient: e.target.value }))}
                    required
                  />
                  {customerOptions.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Quick select:</span>
                      {customerOptions.map(customer => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => setEmailForm(prev => ({ ...prev, recipient: customer.email }))}
                          style={{ background: 'var(--beige-100)', border: '1px solid var(--beige-300)', borderRadius: '6px', padding: '4px 8px', fontSize: '11.5px', cursor: 'pointer', color: 'var(--text-dark)' }}
                        >
                          {customer.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Email Template</label>
                  <select className="select" value={emailForm.template} onChange={e => handleTemplateChange(e.target.value)}>
                    <option value="payment_link">Share Payment Link</option>
                    <option value="order_confirmation">Order Confirmation</option>
                    <option value="shipping_notification">Shipping Dispatch</option>
                  </select>
                </div>

                {emailForm.template === 'payment_link' && (
                  <div>
                    <label className="label">Payment URL</label>
                    <input
                      className="input"
                      type="url"
                      placeholder={`${window.location.origin}/checkout?order=...`}
                      value={emailForm.paymentLink}
                      onChange={e => handlePaymentLinkChange(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="label">Email Subject</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Subject line"
                    value={emailForm.subject}
                    onChange={e => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="label">Email Body</label>
                  <textarea
                    className="input"
                    placeholder="Type your message here..."
                    rows={8}
                    value={emailForm.message}
                    onChange={e => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                    style={{ resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px' }}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={emailSending} style={{ borderRadius: '10px', justifyContent: 'center', gap: '8px' }}>
                  <Mail size={16} />
                  {emailSending ? 'Sending Email...' : 'Send Email'}
                </button>
              </form>
            </div>

            <div className="card-elevated">
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', marginBottom: '20px' }}>Delivery Logs</h2>
              {emailLogs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No email logs yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Recipient</th><th>Template</th><th>Status</th><th>Details</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    {emailLogs.map(log => (
                      <tr key={log.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{log.user_email || log.recipient}</div>
                          {log.subject && <div style={{ color: 'var(--text-light)', fontSize: '11.5px', marginTop: '2px' }}>{log.subject}</div>}
                        </td>
                        <td>{String(log.email_type || log.template || '').replace('_', ' ').toUpperCase()}</td>
                        <td><StatusPill status={String(log.status || '').toLowerCase()} /></td>
                        <td style={{ maxWidth: '200px', fontSize: '12px', color: log.status === 'failed' ? '#b91c1c' : 'var(--text-muted)' }}>
                          {log.error || (log.status === 'sent' ? 'Delivered successfully' : 'N/A')}
                        </td>
                        <td>{new Date(log.sent_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          </div>
        )}

        {/* Offers & Coupons Tab */}
        {activeTab === 'coupons' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
            {/* Create / Edit Coupon Form */}
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Tag size={18} color="var(--green-700)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>
                  {editingCouponId ? 'Edit Coupon' : 'Create Offer Coupon'}
                </h2>
              </div>
              <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">Coupon Code (e.g. SAVE20)</label>
                  <input
                    type="text"
                    className="input"
                    name="code"
                    required
                    value={couponForm.code}
                    onChange={e => handleCouponChange({ target: { name: 'code', value: e.target.value.toUpperCase() } })}
                    placeholder="SAVE20"
                    disabled={!!editingCouponId}
                  />
                </div>
                <div>
                  <label className="label">Offer Title</label>
                  <input
                    type="text"
                    className="input"
                    name="title"
                    required
                    value={couponForm.title}
                    onChange={handleCouponChange}
                    placeholder="20% Off Summer Sale"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label">Discount Type</label>
                    <select
                      className="select"
                      name="discount_type"
                      value={couponForm.discount_type}
                      onChange={handleCouponChange}
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="flat">Flat Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Discount Value</label>
                    <input
                      type="number"
                      className="input"
                      name="discount_value"
                      required
                      min="0.01"
                      step="any"
                      value={couponForm.discount_value}
                      onChange={handleCouponChange}
                      placeholder="20"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label">Min Order ($)</label>
                    <input
                      type="number"
                      className="input"
                      name="min_order_amount"
                      min="0"
                      step="any"
                      value={couponForm.min_order_amount}
                      onChange={handleCouponChange}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label">Max Redemptions</label>
                    <input
                      type="number"
                      className="input"
                      name="max_uses"
                      min="1"
                      value={couponForm.max_uses}
                      onChange={handleCouponChange}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Expiry Date</label>
                  <input
                    type="datetime-local"
                    className="input"
                    name="expires_at"
                    value={couponForm.expires_at}
                    onChange={handleCouponChange}
                  />
                </div>
                <div>
                  <label className="label">Promo Banner Text (Public)</label>
                  <input
                    type="text"
                    className="input"
                    name="banner_text"
                    value={couponForm.banner_text}
                    onChange={handleCouponChange}
                    placeholder="Summer Sale! Get 20% off with code SAVE20"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="active"
                      checked={couponForm.active}
                      onChange={handleCouponChange}
                      style={{ accentColor: 'var(--green-800)', width: '16px', height: '16px' }}
                    />
                    Active / Live
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  {editingCouponId && (
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ flex: 1, borderRadius: '12px', padding: '10px' }}
                      onClick={handleCancelCouponEdit}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={couponSaving}
                    style={{ flex: 1, borderRadius: '12px', padding: '10px', justifyContent: 'center' }}
                  >
                    {couponSaving ? 'Saving...' : editingCouponId ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>

            {/* Coupons List Table */}
            <div className="card-elevated">
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)', marginBottom: '20px' }}>Active & Past Coupons</h2>
              {coupons.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No coupon offers created yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Coupon Info</th>
                      <th>Type</th>
                      <th>Redemptions</th>
                      <th>Min Order</th>
                      <th>Status</th>
                      <th>Expiry</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(coupon => {
                      const now = new Date();
                      const expired = coupon.expires_at && new Date(coupon.expires_at) < now;
                      const limitReached = coupon.max_uses !== null && coupon.max_uses !== undefined && (coupon.used_count || 0) >= coupon.max_uses;
                      
                      let statusClass = 'completed'; // Active
                      let statusLabel = 'Active';
                      if (!coupon.active) {
                        statusClass = 'cancelled'; // Suspended / Ended
                        statusLabel = 'Ended';
                      } else if (expired) {
                        statusClass = 'pending_payment'; // Expired
                        statusLabel = 'Expired';
                      } else if (limitReached) {
                        statusClass = 'processing'; // Redeemed limit
                        statusLabel = 'Filled';
                      }

                      return (
                        <tr key={coupon.id}>
                          <td>
                            <div style={{ fontWeight: 700 }}><code>{coupon.code}</code></div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '2px' }}>{coupon.title}</div>
                          </td>
                          <td>
                            <strong>
                              {coupon.discount_type === 'percent' 
                                ? `${coupon.discount_value}%` 
                                : `$${Number(coupon.discount_value).toFixed(2)}`}
                            </strong>
                          </td>
                          <td>
                            {coupon.used_count || 0} / {coupon.max_uses || '∞'}
                          </td>
                          <td>
                            ${Number(coupon.min_order_amount || 0).toFixed(2)}
                          </td>
                          <td>
                            <span className={`status-pill status-${statusClass}`}>{statusLabel}</span>
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="btn-outline btn-sm"
                                style={{ borderRadius: '8px', padding: '6px 10px' }}
                                onClick={() => handleEditCoupon(coupon)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-outline btn-sm"
                                style={{ borderRadius: '8px', padding: '6px 10px', color: coupon.active ? '#b91c1c' : 'var(--green-700)' }}
                                onClick={() => handleToggleCouponActive(coupon)}
                              >
                                {coupon.active ? 'End' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                className="btn-ghost btn-sm"
                                style={{ borderRadius: '8px', padding: '6px 10px', color: '#b91c1c' }}
                                onClick={() => handleDeleteCoupon(coupon)}
                                disabled={deletingCouponId === coupon.id}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
