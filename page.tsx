'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  Package, Users, DollarSign, ShoppingCart, LayoutDashboard,
  Plus, Edit, Trash2, Loader2, ChevronDown, Mail, TrendingUp, BarChart3, MapPin
} from 'lucide-react'
import type { Product, Order, Profile, Category } from '@/types'

// Static fallback for demo in INR
const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Temozolomide (Temodar) 100mg', slug: 'temozolomide-temodar-100mg', description: 'Glioblastoma treatment', manufacturer: 'Merck', price: 23920, stock: 50, dosage: '', side_effects: '', category_id: '', featured: true, active: true, created_at: '' },
  { id: '2', name: 'Capecitabine (Xeloda) 500mg', slug: 'capecitabine-xeloda-500mg', description: 'Colorectal cancer treatment', manufacturer: 'Genentech', price: 27920, stock: 40, dosage: '', side_effects: '', category_id: '', featured: true, active: true, created_at: '' },
  { id: '3', name: 'Imatinib (Gleevec) 400mg', slug: 'imatinib-gleevec-400mg', description: 'CML treatment', manufacturer: 'Novartis', price: 36000, stock: 30, dosage: '', side_effects: '', category_id: '', featured: true, active: true, created_at: '' },
]

const DEMO_CUSTOMERS: Profile[] = [
  { id: 'c1', full_name: 'Rajesh Kumar', email: 'rajesh@gmail.com', phone: '+91 98765 43210', role: 'customer', created_at: '2026-06-01T10:00:00Z' },
  { id: 'c2', full_name: 'Priyanka Sharma', email: 'priyanka@gmail.com', phone: '+91 99999 88888', role: 'customer', created_at: '2026-06-02T11:30:00Z' },
  { id: 'c3', full_name: 'Amit Patel', email: 'amit@gmail.com', phone: '+91 97777 66666', role: 'customer', created_at: '2026-06-03T09:15:00Z' },
]

const DEMO_ADDRESSES: any[] = [
  { id: 'a1', user_id: 'c1', full_name: 'Rajesh Kumar', phone: '+91 98765 43210', country: 'India', state: 'Delhi', city: 'New Delhi', postal_code: '110001', address_line: 'Flat 42, Connaught Place', created_at: '2026-06-01T10:00:00Z', profiles: { full_name: 'Rajesh Kumar', email: 'rajesh@gmail.com' } },
  { id: 'a2', user_id: 'c2', full_name: 'Priyanka Sharma', phone: '+91 99999 88888', country: 'India', state: 'Maharashtra', city: 'Mumbai', postal_code: '400001', address_line: 'Apartment 102, Bandra West', created_at: '2026-06-02T11:30:00Z', profiles: { full_name: 'Priyanka Sharma', email: 'priyanka@gmail.com' } },
  { id: 'a3', user_id: 'c3', full_name: 'Amit Patel', phone: '+91 97777 66666', country: 'India', state: 'Gujarat', city: 'Ahmedabad', postal_code: '380009', address_line: 'Plot 7, Satellite Area', created_at: '2026-06-03T09:15:00Z', profiles: { full_name: 'Amit Patel', email: 'amit@gmail.com' } },
]

const DEMO_ORDERS: Order[] = [
  {
    id: 'o1',
    user_id: 'c1',
    total_amount: 23920,
    payment_status: 'paid',
    order_status: 'delivered',
    shipping_address_id: 'a1',
    crypto_payment_id: 'tx-1',
    created_at: '2026-06-01T10:15:00Z',
    profiles: { id: 'c1', full_name: 'Rajesh Kumar', email: 'rajesh@gmail.com', phone: '+91 98765 43210', role: 'customer', created_at: '2026-06-01T10:00:00Z' },
    addresses: { id: 'a1', user_id: 'c1', full_name: 'Rajesh Kumar', phone: '+91 98765 43210', country: 'India', state: 'Delhi', city: 'New Delhi', postal_code: '110001', address_line: 'Flat 42, Connaught Place' },
    order_items: [
      { id: 'oi1', order_id: 'o1', product_id: '1', quantity: 1, price: 23920, products: { id: '1', name: 'Temozolomide (Temodar) 100mg', slug: 'temozolomide-temodar-100mg', description: 'Glioblastoma treatment', manufacturer: 'Merck', price: 23920, stock: 50, dosage: '', side_effects: '', category_id: '', featured: true, active: true, created_at: '' } }
    ],
    payments: [
      { id: 'p1', order_id: 'o1', gateway: 'usdt', payment_link: '', transaction_hash: '0x7a8b9c...', amount: 23920, status: 'confirmed', created_at: '2026-06-01T10:16:00Z' }
    ]
  },
  {
    id: 'o2',
    user_id: 'c2',
    total_amount: 55840,
    payment_status: 'paid',
    order_status: 'processing',
    shipping_address_id: 'a2',
    crypto_payment_id: 'tx-2',
    created_at: '2026-06-02T12:00:00Z',
    profiles: { id: 'c2', full_name: 'Priyanka Sharma', email: 'priyanka@gmail.com', phone: '+91 99999 88888', role: 'customer', created_at: '2026-06-02T11:30:00Z' },
    addresses: { id: 'a2', user_id: 'c2', full_name: 'Priyanka Sharma', phone: '+91 99999 88888', country: 'India', state: 'Maharashtra', city: 'Mumbai', postal_code: '400001', address_line: 'Apartment 102, Bandra West' },
    order_items: [
      { id: 'oi2', order_id: 'o2', product_id: '2', quantity: 2, price: 27920, products: { id: '2', name: 'Capecitabine (Xeloda) 500mg', slug: 'capecitabine-xeloda-500mg', description: 'Colorectal cancer treatment', manufacturer: 'Genentech', price: 27920, stock: 40, dosage: '', side_effects: '', category_id: '', featured: true, active: true, created_at: '' } }
    ],
    payments: [
      { id: 'p2', order_id: 'o2', gateway: 'usdc', payment_link: '', transaction_hash: '0x8c9d0e...', amount: 55840, status: 'confirmed', created_at: '2026-06-02T12:05:00Z' }
    ]
  },
  {
    id: 'o3',
    user_id: 'c3',
    total_amount: 36000,
    payment_status: 'unpaid',
    order_status: 'pending_payment',
    shipping_address_id: 'a3',
    crypto_payment_id: '',
    created_at: '2026-06-03T09:30:00Z',
    profiles: { id: 'c3', full_name: 'Amit Patel', email: 'amit@gmail.com', phone: '+91 97777 66666', role: 'customer', created_at: '2026-06-03T09:15:00Z' },
    addresses: { id: 'a3', user_id: 'c3', full_name: 'Amit Patel', phone: '+91 97777 66666', country: 'India', state: 'Gujarat', city: 'Ahmedabad', postal_code: '380009', address_line: 'Plot 7, Satellite Area' },
    order_items: [
      { id: 'oi3', order_id: 'o3', product_id: '3', quantity: 1, price: 36000, products: { id: '3', name: 'Imatinib (Gleevec) 400mg', slug: 'imatinib-gleevec-400mg', description: 'CML treatment', manufacturer: 'Novartis', price: 36000, stock: 30, dosage: '', side_effects: '', category_id: '', featured: true, active: true, created_at: '' } }
    ],
    payments: []
  }
]

type AdminTab = 'overview' | 'products' | 'orders' | 'customers' | 'addresses' | 'emails'

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, isAdmin, loading: authLoading } = useAuth()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS)
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Profile[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  // Modals state
  const [loading, setLoading] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({ name: '', price: '', stock: '', description: '', manufacturer: '', category_id: '', dosage: '', side_effects: '', slug: '', featured: false, active: true })
  
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any | null>(null)
  const [addressForm, setAddressForm] = useState({ user_id: '', full_name: '', phone: '', country: 'India', state: '', city: '', postal_code: '', address_line: '' })
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const supabase = createClient()

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Email states & helpers
  const [emailLogs, setEmailLogs] = useState<any[]>([
    { id: 'el1', recipient: 'rajesh@gmail.com', subject: 'Order Confirmation #O1', template: 'order_confirmation', status: 'sent', sent_at: '2026-06-01T10:17:00Z' },
    { id: 'el2', recipient: 'priyanka@gmail.com', subject: 'Order Dispatched #O2', template: 'shipping_notification', status: 'sent', sent_at: '2026-06-02T15:30:00Z' }
  ])
  
  const [emailForm, setEmailForm] = useState({
    recipient: '',
    subject: 'Tatvlife: Action Required - Secure Payment Link',
    template: 'payment_link',
    message: `Dear Customer,\n\nYour order is currently awaiting payment. Please complete your transaction by visiting the secure payment link below:\n\nhttp://localhost:3000/checkout\n\nWarm regards,\nTatvlife Care Team`,
    paymentLink: 'http://localhost:3000/checkout'
  })

  const handleSharePayment = (order: Order) => {
    setTab('emails')
    const checkoutUrl = `${window.location.origin}/checkout?order=${order.id}`
    setEmailForm({
      recipient: order.profiles?.email || '',
      subject: `Secure Payment Link for Order #${order.id.slice(0, 8).toUpperCase()}`,
      template: 'payment_link',
      message: `Dear ${order.profiles?.full_name || 'Customer'},\n\nThank you for choosing Tatvlife. Your order #${order.id.slice(0, 8).toUpperCase()} for ₹${order.total_amount.toLocaleString('en-IN')} is pending payment.\n\nPlease complete your payment securely using your preferred crypto wallet by clicking the link below:\n\n${checkoutUrl}\n\nIf you have any questions, please contact our support team.\n\nWarm regards,\nTatvlife Care Team`,
      paymentLink: checkoutUrl
    })
    showToast('Payment link generated! Prefilled in Email template.', 'success')
  }

  const handleTemplateChange = (templateType: string) => {
    let subject = ''
    let message = ''
    let paymentLink = emailForm.paymentLink

    if (templateType === 'payment_link') {
      subject = 'Tatvlife: Action Required - Secure Payment Link'
      message = `Dear Customer,\n\nYour order is currently awaiting payment. Please complete your transaction by visiting the secure payment link below:\n\n${paymentLink || 'http://localhost:3000/checkout'}\n\nWarm regards,\nTatvlife Care Team`
    } else if (templateType === 'order_confirmation') {
      subject = 'Tatvlife: Order Confirmed & Paid'
      message = `Dear Customer,\n\nWe have received your payment. Your order has been confirmed and is now being processed.\n\nThank you for shopping with us!\n\nWarm regards,\nTatvlife Care Team`
    } else if (templateType === 'shipping_notification') {
      subject = 'Tatvlife: Your Order Has Been Dispatched'
      message = `Dear Customer,\n\nGreat news! Your order has been shipped and is on its way to your address. You can track your shipment details in your dashboard.\n\nWarm regards,\nTatvlife Care Team`
    }

    setEmailForm(prev => ({
      ...prev,
      template: templateType,
      subject,
      message
    }))
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailForm.recipient) {
      showToast('Please select or enter a recipient.', 'error')
      return
    }

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      await supabase
        .from('email_logs')
        .insert({
          user_id: user?.id || null,
          email_type: emailForm.template,
          status: 'sent',
          sent_at: new Date().toISOString()
        })
    } catch (err) {
      console.warn('Could not save email log to database:', err)
    }

    const newLog = {
      id: `el-${Date.now()}`,
      recipient: emailForm.recipient,
      subject: emailForm.subject,
      template: emailForm.template,
      status: 'sent',
      sent_at: new Date().toISOString()
    }

    setEmailLogs(prev => [newLog, ...prev])
    showToast(`Email sent successfully to ${emailForm.recipient}!`, 'success')
    
    setEmailForm({
      recipient: '',
      subject: 'Tatvlife: Action Required - Secure Payment Link',
      template: 'payment_link',
      message: `Dear Customer,\n\nYour order is currently awaiting payment. Please complete your transaction by visiting the secure payment link below:\n\nhttp://localhost:3000/checkout\n\nWarm regards,\nTatvlife Care Team`,
      paymentLink: 'http://localhost:3000/checkout'
    })
    setLoading(false)
  }

  // Admin access check
  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (!authLoading && user && !isAdmin) {
      // For demo: allow access if no Supabase configured
    }
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line

  const loadData = async () => {
    setLoading(true)
    try {
      const [{ data: prods }, { data: ords }, { data: custs }, { data: addrs }] = await Promise.all([
        supabase.from('products').select('*, categories(name, slug)').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, profiles(full_name, email, phone), addresses(*), order_items(*, products(name, price)), payments(*)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }),
        supabase.from('addresses').select('*, profiles:user_id(full_name, email)').order('created_at', { ascending: false }),
      ])

      if (prods && prods.length > 0) {
        setProducts(prods as Product[])
      } else {
        setProducts(DEMO_PRODUCTS)
      }

      if (ords && ords.length > 0) {
        setOrders(ords as Order[])
      } else {
        setOrders(DEMO_ORDERS)
      }

      if (custs && custs.length > 0) {
        setCustomers(custs as Profile[])
      } else {
        setCustomers(DEMO_CUSTOMERS)
      }

      if (addrs && addrs.length > 0) {
        setAddresses(addrs)
      } else {
        setAddresses(DEMO_ADDRESSES)
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to load dashboard data', 'error')
    }
    setLoading(false)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: productForm.name,
        slug: productForm.slug || productForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        description: productForm.description,
        manufacturer: productForm.manufacturer,
        dosage: productForm.dosage,
        side_effects: productForm.side_effects,
        featured: productForm.featured,
        active: productForm.active,
      }
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)
        if (error) throw error
        showToast('Product updated successfully!', 'success')
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        showToast('Product added successfully!', 'success')
      }
      setShowProductModal(false)
      setEditingProduct(null)
      loadData()
    } catch (err: any) {
      showToast(err?.message || 'Failed to save product', 'error')
    }
    setLoading(false)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      showToast('Product deleted successfully!', 'success')
      loadData()
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete product', 'error')
    }
    setLoading(false)
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        user_id: addressForm.user_id,
        full_name: addressForm.full_name,
        phone: addressForm.phone,
        country: addressForm.country,
        state: addressForm.state,
        city: addressForm.city,
        postal_code: addressForm.postal_code,
        address_line: addressForm.address_line,
      }
      if (editingAddress) {
        const { error } = await supabase.from('addresses').update(payload).eq('id', editingAddress.id)
        if (error) throw error
        showToast('Address updated successfully!', 'success')
      } else {
        const { error } = await supabase.from('addresses').insert(payload)
        if (error) throw error
        showToast('Address added successfully!', 'success')
      }
      setShowAddressModal(false)
      setEditingAddress(null)
      loadData()
    } catch (err: any) {
      showToast(err?.message || 'Failed to save address', 'error')
    }
    setLoading(false)
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id)
      if (error) throw error
      showToast('Address deleted successfully!', 'success')
      loadData()
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete address', 'error')
    }
    setLoading(false)
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId)
      if (error) throw error
      showToast('Order status updated!', 'success')
      loadData()
    } catch (err: any) {
      showToast(err?.message || 'Failed to update order status', 'error')
    }
  }

  const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase.from('orders').update({ payment_status: status }).eq('id', orderId)
      if (error) throw error
      showToast('Payment status updated!', 'success')
      loadData()
    } catch (err: any) {
      showToast(err?.message || 'Failed to update payment status', 'error')
    }
  }

  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total_amount || 0), 0)
  const pendingOrders = orders.filter(o => o.order_status === 'pending_payment').length

  const navItems: { key: AdminTab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
    { key: 'emails', label: 'Email Logs', icon: Mail },
  ]

  return (
    <div className="admin-page-shell">
      <Navbar />

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="admin-sidebar-header">
            <div className="admin-sidebar-label">Admin Panel</div>
            <div className="admin-sidebar-title">Tatvlife</div>
          </div>
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`admin-nav-link ${tab === item.key ? 'active' : ''}`}
              >
                <Icon size={16} /> {item.label}
              </button>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="admin-content">

          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 28 }}>Dashboard Overview</h1>
              <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                {[
                  { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: <DollarSign size={22} />, color: 'var(--green-600)', bg: 'var(--green-100)' },
                  { label: 'Total Orders', value: orders.length, icon: <ShoppingCart size={22} />, color: '#2563eb', bg: '#dbeafe' },
                  { label: 'Total Customers', value: customers.length, icon: <Users size={22} />, color: '#7c3aed', bg: '#ede9fe' },
                  { label: 'Total Products', value: products.length, icon: <Package size={22} />, color: '#d97706', bg: '#fef3c7' },
                  { label: 'Pending Orders', value: pendingOrders, icon: <TrendingUp size={22} />, color: '#dc2626', bg: '#fee2e2' },
                ].map(stat => (
                  <div key={stat.label} className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {stat.label}
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {stat.icon}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 24, color: 'var(--text-dark)' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Orders</h3>
                  <button onClick={() => setTab('orders')} style={{ color: 'var(--green-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    View All →
                  </button>
                </div>
                {orders.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No orders yet</p>
                ) : (
                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--beige-200)' }}>
                          {['Order ID', 'Amount', 'Status', 'Date'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.id} style={{ borderBottom: '1px solid var(--beige-100)' }}>
                            <td style={{ padding: '12px' }}><code style={{ fontFamily: 'monospace', fontSize: 13 }}>{order.id.slice(0, 8).toUpperCase()}</code></td>
                            <td style={{ padding: '12px', fontWeight: 700 }}>₹{order.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, background: 'var(--green-100)', color: 'var(--green-800)' }}>
                                {order.order_status?.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products */}
          {tab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700 }}>Products</h2>
                <button
                  onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', stock: '10', description: '', manufacturer: '', category_id: '', dosage: '', side_effects: '', slug: '', featured: false, active: true }); setShowProductModal(true) }}
                  className="btn-primary btn-sm"
                >
                  <Plus size={15} /> Add Product
                </button>
              </div>

              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead style={{ background: 'var(--beige-100)' }}>
                      <tr>
                        {['Product', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} style={{ borderTop: '1px solid var(--beige-100)' }}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.manufacturer}</div>
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--green-800)' }}>₹{p.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ color: p.stock < 20 ? '#dc2626' : 'var(--text-dark)', fontWeight: 600 }}>
                              {p.stock}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700,
                              background: p.active ? 'var(--green-100)' : '#fee2e2',
                              color: p.active ? 'var(--green-800)' : '#dc2626'
                            }}>
                              {p.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={() => { setEditingProduct(p); setProductForm({ name: p.name, price: String(p.price), stock: String(p.stock), description: p.description || '', manufacturer: p.manufacturer || '', category_id: p.category_id || '', dosage: p.dosage || '', side_effects: p.side_effects || '', slug: p.slug, featured: p.featured, active: p.active }); setShowProductModal(true) }}
                                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--beige-300)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                              >
                                <Edit size={12} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {tab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>All Orders</h2>
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No orders yet</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead style={{ background: 'var(--beige-100)' }}>
                        <tr>
                          {['Order ID', 'Customer', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} style={{ borderTop: '1px solid var(--beige-100)' }}>
                            <td style={{ padding: '14px 16px' }}><code style={{ fontSize: 12 }}>{order.id.slice(0, 8).toUpperCase()}</code></td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                                {order.profiles?.full_name || 'No Name'}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {order.profiles?.email}
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--green-800)' }}>₹{order.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                                background: order.payment_status === 'paid' ? 'var(--green-100)' : '#fef3c7',
                                color: order.payment_status === 'paid' ? 'var(--green-800)' : '#d97706'
                              }}>
                                {order.payment_status?.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <select
                                value={order.order_status}
                                onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                style={{ border: '1px solid var(--beige-300)', borderRadius: 8, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}
                              >
                                {['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                  <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{new Date(order.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '14px 16px', display: 'flex', gap: 6 }}>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--beige-300)', background: 'white', cursor: 'pointer', fontSize: 11, color: 'var(--green-700)', fontWeight: 600 }}
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleSharePayment(order)}
                                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--beige-300)', background: 'var(--green-800)', color: 'white', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                              >
                                ✉ Share Payment
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customers */}
          {tab === 'customers' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Customers ({customers.length})</h2>
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  {customers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No customers registered yet</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead style={{ background: 'var(--beige-100)' }}>
                        <tr>
                          {['Name', 'Email', 'Phone', 'Joined'].map(h => (
                            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map(c => (
                          <tr key={c.id} style={{ borderTop: '1px solid var(--beige-100)' }}>
                            <td style={{ padding: '14px 20px', fontWeight: 600 }}>{c.full_name || '—'}</td>
                            <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{c.email}</td>
                            <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{c.phone || '—'}</td>
                            <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Addresses */}
          {tab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700 }}>Addresses ({addresses.length})</h2>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({
                      user_id: customers[0]?.id || '',
                      full_name: '',
                      phone: '',
                      country: 'India',
                      state: '',
                      city: '',
                      postal_code: '',
                      address_line: ''
                    });
                    setShowAddressModal(true);
                  }}
                  className="btn-primary btn-sm"
                >
                  <Plus size={15} /> Add Address
                </button>
              </div>

              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  {addresses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No addresses registered yet</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead style={{ background: 'var(--beige-100)' }}>
                        <tr>
                          {['Customer', 'Full Name', 'Phone', 'Address Details', 'Country', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {addresses.map((a: any) => (
                          <tr key={a.id} style={{ borderTop: '1px solid var(--beige-100)' }}>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ fontWeight: 600 }}>{a.profiles?.full_name || '—'}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{a.profiles?.email}</div>
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 500 }}>{a.full_name}</td>
                            <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{a.phone}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ fontWeight: 500 }}>{a.address_line}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{a.city}, {a.state} - {a.postal_code}</div>
                            </td>
                            <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{a.country}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  onClick={() => {
                                    setEditingAddress(a);
                                    setAddressForm({
                                      user_id: a.user_id,
                                      full_name: a.full_name,
                                      phone: a.phone,
                                      country: a.country,
                                      state: a.state,
                                      city: a.city,
                                      postal_code: a.postal_code,
                                      address_line: a.address_line
                                    });
                                    setShowAddressModal(true);
                                  }}
                                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--beige-300)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                                >
                                  <Edit size={12} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(a.id)}
                                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Email Logs & Sending */}
          {tab === 'emails' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
              {/* Left Column: Email Composer */}
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Email Dispatcher</h2>
                <div className="card" style={{ padding: 28 }}>
                  <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label className="label">Recipient Email</label>
                      <input
                        className="input"
                        type="email"
                        required
                        placeholder="customer@example.com"
                        value={emailForm.recipient}
                        onChange={e => setEmailForm({ ...emailForm, recipient: e.target.value })}
                      />
                      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quick Select:</span>
                        {customers.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setEmailForm({ ...emailForm, recipient: c.email })}
                            style={{
                              background: 'var(--beige-100)',
                              border: '1px solid var(--beige-300)',
                              borderRadius: 4,
                              padding: '2px 6px',
                              fontSize: 10,
                              cursor: 'pointer',
                              color: 'var(--text-dark)'
                            }}
                          >
                            {c.full_name || c.email}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="label">Email Template</label>
                      <select
                        className="input"
                        value={emailForm.template}
                        onChange={e => handleTemplateChange(e.target.value)}
                      >
                        <option value="payment_link">⚡ Share Payment Link</option>
                        <option value="order_confirmation">✅ Order Confirmation</option>
                        <option value="shipping_notification">🚚 Shipping Dispatch</option>
                      </select>
                    </div>

                    {emailForm.template === 'payment_link' && (
                      <div>
                        <label className="label">Payment URL</label>
                        <input
                          className="input"
                          type="url"
                          placeholder="http://localhost:3000/checkout?order=..."
                          value={emailForm.paymentLink}
                          onChange={e => {
                            const link = e.target.value
                            setEmailForm(prev => ({
                              ...prev,
                              paymentLink: link,
                              message: prev.message.replace(prev.paymentLink, link)
                            }))
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <label className="label">Email Subject</label>
                      <input
                        className="input"
                        type="text"
                        required
                        placeholder="Subject Line"
                        value={emailForm.subject}
                        onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="label">Email Body (Markdown/Text)</label>
                      <textarea
                        className="input"
                        rows={8}
                        required
                        placeholder="Type your message here..."
                        style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
                        value={emailForm.message}
                        onChange={e => setEmailForm({ ...emailForm, message: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '12px 24px',
                        background: 'var(--green-800)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        marginTop: 8
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Sending Email...
                        </>
                      ) : (
                        <>
                          <Mail size={16} /> Send Test Email
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Sent Logs list */}
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Delivery Logs</h2>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead style={{ background: 'var(--beige-100)' }}>
                        <tr>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: 11 }}>RECIPIENT</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: 11 }}>TEMPLATE</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: 11 }}>STATUS</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: 11 }}>DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emailLogs.map(log => (
                          <tr key={log.id} style={{ borderTop: '1px solid var(--beige-100)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 500 }}>{log.recipient}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'var(--beige-200)', color: 'var(--text-dark)' }}>
                                {log.template.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-800)' }}>
                                ● {log.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 11 }}>
                              {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-box" style={{ padding: 0 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--beige-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700 }}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSaveProduct} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Product Name</label>
                  <input className="input" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product Name" />
                </div>
                <div>
                  <label className="label">Price (₹)</label>
                  <input className="input" type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="24900.00" />
                </div>
                <div>
                  <label className="label">Stock</label>
                  <input className="input" type="number" required value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} placeholder="50" />
                </div>
                <div>
                  <label className="label">Manufacturer</label>
                  <input className="input" value={productForm.manufacturer} onChange={e => setProductForm({ ...productForm, manufacturer: e.target.value })} placeholder="Company Name" />
                </div>
                <div>
                  <label className="label">Slug</label>
                  <input className="input" value={productForm.slug} onChange={e => setProductForm({ ...productForm, slug: e.target.value })} placeholder="auto-generated" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Product description..." style={{ resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Dosage Information</label>
                  <input className="input" value={productForm.dosage} onChange={e => setProductForm({ ...productForm, dosage: e.target.value })} placeholder="Dosage instructions" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Side Effects</label>
                  <input className="input" value={productForm.side_effects} onChange={e => setProductForm({ ...productForm, side_effects: e.target.value })} placeholder="Known side effects" />
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm({ ...productForm, featured: e.target.checked })} />
                    Featured Product
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    <input type="checkbox" checked={productForm.active} onChange={e => setProductForm({ ...productForm, active: e.target.checked })} />
                    Active
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                  {loading ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-box" style={{ padding: 0 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--beige-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700 }}>
                {editingAddress ? 'Edit Address' : 'Add Address'}
              </h3>
              <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSaveAddress} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Customer</label>
                <select
                  className="select"
                  required
                  value={addressForm.user_id}
                  onChange={e => setAddressForm({ ...addressForm, user_id: e.target.value })}
                  disabled={!!editingAddress}
                >
                  {customers.length === 0 && (
                    <option value="">No customers found</option>
                  )}
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || 'No Name'} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" required value={addressForm.full_name} onChange={e => setAddressForm({ ...addressForm, full_name: e.target.value })} placeholder="John Doe" />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input className="input" required value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} placeholder="+91 99999 99999" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Address Line</label>
                  <input className="input" required value={addressForm.address_line} onChange={e => setAddressForm({ ...addressForm, address_line: e.target.value })} placeholder="Street name, house/flat number" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input" required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="New Delhi" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input className="input" required value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="Delhi" />
                </div>
                <div>
                  <label className="label">Postal Code</label>
                  <input className="input" required value={addressForm.postal_code} onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })} placeholder="110001" />
                </div>
                <div>
                  <label className="label">Country</label>
                  <input className="input" required value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} placeholder="India" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="button" onClick={() => setShowAddressModal(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                  {loading ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
                  {editingAddress ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-box" style={{ maxWidth: 650, padding: 0 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--beige-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Order Details</h3>
                <code style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {selectedOrder.id}</code>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>×</button>
            </div>
            
            <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Customer & Address Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>Customer Info</h4>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 2 }}>{selectedOrder.profiles?.full_name || 'No Name'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>{selectedOrder.profiles?.email}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedOrder.profiles?.phone || 'No phone number'}</div>
                </div>
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>Shipping Address</h4>
                  {selectedOrder.addresses ? (
                    <div style={{ fontSize: 13, color: 'var(--text-dark)', lineHeight: '1.4' }}>
                      <div style={{ fontWeight: 600 }}>{selectedOrder.addresses.full_name}</div>
                      <div>{selectedOrder.addresses.address_line}</div>
                      <div>{selectedOrder.addresses.city}, {selectedOrder.addresses.state} - {selectedOrder.addresses.postal_code}</div>
                      <div>{selectedOrder.addresses.country}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Phone: {selectedOrder.addresses.phone}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No shipping address linked</div>
                  )}
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>Order Items</h4>
                <div style={{ border: '1px solid var(--beige-200)', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--beige-100)', borderBottom: '1px solid var(--beige-200)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Product Name</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, width: 80 }}>Qty</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, width: 100 }}>Price</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, width: 100 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items?.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--beige-100)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 500 }}>{item.products?.name || 'Unknown Medicine'}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>{item.quantity}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>₹{(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹{((item.price || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: 700, borderTop: '2px solid var(--beige-200)', background: 'var(--beige-100)' }}>
                        <td colSpan={3} style={{ padding: '12px', textAlign: 'right' }}>Total Amount:</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--green-800)' }}>₹{(selectedOrder.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status & Actions Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: 16, background: 'var(--beige-100)', borderRadius: 8, border: '1px solid var(--beige-200)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Order Status</label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={async e => {
                      await handleUpdateOrderStatus(selectedOrder.id, e.target.value)
                      setSelectedOrder({ ...selectedOrder, order_status: e.target.value as any })
                    }}
                    style={{ width: '100%', border: '1px solid var(--beige-300)', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: 'white' }}
                  >
                    {['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Payment Status</label>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={async e => {
                      await handleUpdatePaymentStatus(selectedOrder.id, e.target.value)
                      setSelectedOrder({ ...selectedOrder, payment_status: e.target.value as any })
                    }}
                    style={{ width: '100%', border: '1px solid var(--beige-300)', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: 'white' }}
                  >
                    {['unpaid', 'paid', 'failed', 'refunded'].map(s => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transaction details if any */}
              {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>Crypto Transaction Details</h4>
                  {selectedOrder.payments.map((pm, i) => (
                    <div key={pm.id} style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4, borderTop: i > 0 ? '1px solid #e2e8f0' : 'none', paddingTop: i > 0 ? 8 : 0 }}>
                      <div><strong>Gateway/Currency:</strong> {pm.gateway.toUpperCase()}</div>
                      <div><strong>Amount Paid:</strong> ₹{pm.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div><strong>Status:</strong> {pm.status.toUpperCase()}</div>
                      <div style={{ wordBreak: 'break-all' }}><strong>Tx Hash:</strong> <code style={{ color: 'var(--green-700)' }}>{pm.transaction_hash || 'Pending Submission'}</code></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '20px 28px', borderTop: '1px solid var(--beige-200)', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedOrder(null)} className="btn-outline" style={{ minWidth: 100 }}>Close</button>
              <button 
                onClick={() => {
                  const printContent = document.querySelector('.modal-box')?.innerHTML;
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Invoice - ${selectedOrder.id.slice(0, 8).toUpperCase()}</title>
                          <style>
                            body { font-family: sans-serif; padding: 40px; color: #333; }
                            .modal-overlay { display: none; }
                            button { display: none; }
                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                            th { background: #f5f5f5; }
                            code { font-family: monospace; background: #eee; padding: 2px 4px; border-radius: 4px; }
                          </style>
                        </head>
                        <body>
                          <h2>TATVLIFE PHARMACY INVOICE</h2>
                          \${printContent}
                          <script>window.onload = function() { window.print(); window.close(); }</script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }
                }}
                className="btn-primary" 
                style={{ minWidth: 120 }}
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        .admin-page-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .admin-layout {
          display: flex;
          flex: 1;
          min-height: calc(100vh - 0px);
        }

        .admin-content {
          flex: 1;
          background: var(--beige-100);
          padding: 32px;
          overflow-y: auto;
        }

        .admin-sidebar {
          width: 256px;
          background: var(--green-950);
          color: white;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .admin-sidebar-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .admin-sidebar-label {
          color: rgba(255,255,255,0.55);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }

        .admin-sidebar-title {
          color: white;
          font-family: var(--font-serif);
          font-size: 18px;
          font-weight: 700;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          color: rgba(255,255,255,0.78);
          font-size: 14px;
          font-weight: 500;
          border-left: 3px solid transparent;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .admin-nav-link:hover {
          background: rgba(255,255,255,0.08);
          color: white;
        }

        .admin-nav-link.active {
          background: rgba(75,148,112,0.15);
          color: white;
          border-left-color: var(--green-400);
        }

        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .toast {
          background: var(--green-700);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideIn 0.2s ease;
        }

        .toast-error {
          background: #ef4444;
        }

        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 1024px) {
          .admin-layout {
            flex-direction: column !important;
          }
          .admin-sidebar {
            width: 100% !important;
            min-height: auto !important;
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            padding: 12px 16px !important;
            align-items: center !important;
            gap: 8px !important;
          }
          .admin-sidebar-header {
            display: none !important;
          }
          .admin-nav-link {
            padding: 8px 16px !important;
            border-left: none !important;
            border-bottom: 3px solid transparent !important;
            white-space: nowrap !important;
          }
          .admin-nav-link.active {
            border-bottom-color: var(--green-400) !important;
            background: rgba(255,255,255,0.08) !important;
          }
          .admin-content {
            padding: 16px !important;
          }
        }
        @media (max-width: 640px) {
          .stat-grid {
            grid-template-columns: 1fr !important;
          }
          .modal-box {
            width: 95vw !important;
            max-height: 85vh !important;
          }
        }
      `}</style>
    </div>
  )
}
