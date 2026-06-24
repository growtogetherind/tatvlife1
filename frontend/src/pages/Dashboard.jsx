import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, ChevronDown, ChevronUp, ExternalLink,
  FileText, AlertCircle, CheckCircle2, Loader, Clock, Hash, MapPin, Package, CreditCard,
} from 'lucide-react';
import { getUserOrders, updateOrder } from '../lib/firestoreService';

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

const StatusPill = ({ status }) => {
  const map = {
    pending_payment: { cls: 'status-pending', label: 'Pending Payment' },
    processing: { cls: 'status-processing', label: 'Processing' },
    completed: { cls: 'status-completed', label: 'Completed' },
    cancelled: { cls: 'status-cancelled', label: 'Cancelled' },
  };
  const { cls, label } = map[status] || { cls: 'status-cancelled', label: status };
  return <span className={`status-pill ${cls}`}>{label}</span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txHashes, setTxHashes] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { if (!user) navigate('/login?redirect=dashboard'); }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const orders = await getUserOrders(user.id);
      setOrders(orders);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.id) fetchOrders(); }, [user?.id]);

  const handleTxSubmit = async (orderId) => {
    const hash = txHashes[orderId];
    if (!hash || hash.trim().length < 10) { setError('Please enter a valid transaction hash (min 10 chars).'); return; }
    setError(''); setSuccess('');
    try {
      await updateOrder(orderId, { transaction_hash: hash, order_status: 'processing' });
      setSuccess('Transaction hash submitted. Your order is now processing.');
      setTxHashes(prev => ({ ...prev, [orderId]: '' }));
      fetchOrders();
    } catch (err) { setError(err.message || 'Error submitting hash.'); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '14px' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '80vh', padding: '40px 0 80px' }}>
      <div className="container">

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '36px', paddingBottom: '28px', borderBottom: '1px solid var(--beige-200)',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Patient Dashboard
            </p>
            <h1 className="font-serif" style={{ fontSize: '28px', fontWeight: 500, marginBottom: '4px' }}>
              Welcome back, {user?.full_name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              Track your order status, review payment instructions, and submit transaction proofs.
            </p>
          </div>
          <Link to="/shop" className="btn-primary btn-sm" style={{ gap: 6 }}>
            <ShoppingBag size={14} /> New Order
          </Link>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}><AlertCircle size={15} style={{ flexShrink: 0 }} /><span>{error}</span></div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}><CheckCircle2 size={15} style={{ flexShrink: 0 }} /><span>{success}</span></div>}

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px 40px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--beige-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Package size={26} color="var(--text-light)" />
            </div>
            <h3 style={{ marginBottom: '8px', fontWeight: 700 }}>No orders yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>You haven&apos;t placed any specialty orders yet.</p>
            <Link to="/shop" className="btn-primary">Browse Treatments</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map(order => (
              <div key={order.id} style={{
                background: 'var(--white)', border: '1px solid',
                borderColor: expanded === order.id ? 'var(--green-200)' : 'var(--beige-200)',
                borderRadius: '18px', overflow: 'hidden',
                boxShadow: expanded === order.id ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}>
                {/* Row */}
                <div
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  style={{
                    padding: '20px 24px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', cursor: 'pointer', flexWrap: 'wrap', gap: '16px',
                    background: expanded === order.id ? 'var(--green-50)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Order ID', value: `#${order.id.slice(0, 12)}...` },
                      { label: 'Date', value: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                      { label: 'Amount', value: `$${order.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, bold: true },
                    ].map(col => (
                      <div key={col.label}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>{col.label}</span>
                        <span style={{ fontSize: '13.5px', color: 'var(--text-dark)', fontWeight: col.bold ? 700 : 500 }}>{col.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <StatusPill status={order.order_status} />
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--beige-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {expanded === order.id ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
                    </div>
                  </div>
                </div>

                {/* Details */}
                {expanded === order.id && (
                  <div style={{ padding: '24px', borderTop: '1px solid var(--beige-100)', background: '#fdfcfb' }}>
                    <div className="order-details-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px' }}>

                      <div>
                        <h4 style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Package size={13} /> Order Items
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', padding: '10px 14px', background: 'var(--white)', borderRadius: '10px', border: '1px solid var(--beige-100)' }}>
                              <span style={{ color: 'var(--text-dark)' }}><strong>{item.quantity}×</strong> {item.name}</span>
                              <strong style={{ color: 'var(--green-900)' }}>${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                            </div>
                          ))}
                        </div>

                        <h4 style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={13} /> Delivery Address
                        </h4>
                        <div style={{ fontSize: '13.5px', color: 'var(--text-dark)', lineHeight: 1.6, padding: '14px 18px', background: 'var(--white)', borderRadius: '10px', border: '1px solid var(--beige-100)' }}>
                          <strong>{order.shipping_address.fullName}</strong><br />
                          {order.shipping_address.addressLine}<br />
                          {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.postalCode}<br />
                          {order.shipping_address.country}
                        </div>

                        <h4 style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginTop: '20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CreditCard size={13} /> Payment Method
                        </h4>
                        <div style={{ fontSize: '13.5px', color: 'var(--text-dark)', padding: '14px 18px', background: 'var(--white)', borderRadius: '10px', border: '1px solid var(--beige-100)' }}>
                          {paymentMethodLabels[order.payment_method] || order.payment_method || 'Cryptocurrency (USDT / USDC / BTC)'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Prescription */}
                        {order.prescription_name && (
                          <div style={{ background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--beige-200)', padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: order.prescription_data ? '12px' : 0 }}>
                              <FileText size={15} color="var(--green-700)" />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block' }}>Prescription</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '180px' }}>{order.prescription_name}</span>
                              </div>
                              {order.prescription_data && (
                                <button onClick={() => { const w = window.open(); w.document.write(`<iframe src="${order.prescription_data}" frameborder="0" style="width:100%;height:100%;border:0"></iframe>`); }}
                                  className="btn-outline btn-sm" style={{ fontSize: '11.5px', padding: '5px 12px', borderRadius: '8px', flexShrink: 0 }}>View</button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Payment Panel */}
                        <div style={{ background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--beige-200)', padding: '18px' }}>
                          <h4 style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--green-800)', marginBottom: '14px' }}>
                            Payment Status
                          </h4>

                          {order.order_status === 'pending_payment' && !order.payment_link && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <Clock size={15} color="var(--green-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                                {order.payment_method === 'card' && 'Our team is reviewing your order. Once approved, your secure card payment link will appear here.'}
                                {order.payment_method === 'paypal' && 'Our team is reviewing your order. Once approved, your PayPal payment link will appear here.'}
                                {order.payment_method === 'bank' && 'Our team is reviewing your order. Once approved, your bank wire details will appear here.'}
                                {(['btc', 'eth', 'usdt', 'usdc', 'dai_usds', 'usd1', 'usde', 'usdg', 'usdd', 'crypto'].includes(order.payment_method) || !order.payment_method) && 'Our team is reviewing your order. Once approved, your crypto payment link will appear here.'}
                              </p>
                            </div>
                          )}

                          {order.order_status === 'pending_payment' && order.payment_link && (
                            <div>
                              <p style={{ fontSize: '13px', color: 'var(--text-dark)', marginBottom: '14px', lineHeight: 1.5 }}>
                                {order.payment_method === 'card' && 'Your secure card payment link is ready.'}
                                {order.payment_method === 'paypal' && 'Your secure PayPal payment link is ready.'}
                                {order.payment_method === 'bank' && 'Your Bank Wire / ACH instructions document link is ready.'}
                                {(['btc', 'eth', 'usdt', 'usdc', 'dai_usds', 'usd1', 'usde', 'usdg', 'usdd', 'crypto'].includes(order.payment_method) || !order.payment_method) && `Your cryptocurrency payment invoice link is ready. Pay using ${order.payment_method === 'dai_usds' ? 'DAI / USDS' : (order.payment_method || 'usdt').toUpperCase()}.`}
                              </p>
                              <a href={order.payment_link} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', marginBottom: '16px', borderRadius: '10px', gap: 6 }}>
                                {order.payment_method === 'card' && 'Proceed to Secure Payment'}
                                {order.payment_method === 'paypal' && 'Pay with PayPal'}
                                {order.payment_method === 'bank' && 'View Bank Details'}
                                {(['btc', 'eth', 'usdt', 'usdc', 'dai_usds', 'usd1', 'usde', 'usdg', 'usdd', 'crypto'].includes(order.payment_method) || !order.payment_method) && 'Open Crypto Gateway'}
                                <ExternalLink size={13} />
                              </a>
                              <div style={{ borderTop: '1px solid var(--beige-100)', paddingTop: '14px' }}>
                                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Hash size={11} /> {(['btc', 'eth', 'usdt', 'usdc', 'dai_usds', 'usd1', 'usde', 'usdg', 'usdd', 'crypto'].includes(order.payment_method) || !order.payment_method) ? 'Transaction Hash' : 'Reference Number'}
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input type="text" className="input" style={{ fontSize: '13px', borderRadius: '9px' }}
                                    placeholder={(['btc', 'eth', 'usdt', 'usdc', 'dai_usds', 'usd1', 'usde', 'usdg', 'usdd', 'crypto'].includes(order.payment_method) || !order.payment_method) ? '0x...' : 'Ref or Tx receipt number...'}
                                    value={txHashes[order.id] || ''}
                                    onChange={e => setTxHashes(prev => ({ ...prev, [order.id]: e.target.value }))}
                                  />
                                  <button onClick={() => handleTxSubmit(order.id)} className="btn-primary btn-sm" style={{ borderRadius: '9px', flexShrink: 0 }}>
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {order.order_status === 'processing' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <Loader size={15} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                                  {(['btc', 'eth', 'usdt', 'usdc', 'dai_usds', 'usd1', 'usde', 'usdg', 'usdd', 'crypto'].includes(order.payment_method) || !order.payment_method) ? (
                                    <span><strong>Verifying payment</strong> — Your transaction is being validated on the blockchain network.</span>
                                  ) : (
                                    <span><strong>Verifying payment</strong> — Our billing team is verifying your payment reference.</span>
                                  )}
                                </div>
                              </div>
                              {order.transaction_hash && (
                                <code style={{ background: 'var(--beige-100)', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', display: 'block', wordBreak: 'break-all', color: 'var(--text-muted)', border: '1px solid var(--beige-200)' }}>
                                  {order.transaction_hash}
                                </code>
                              )}
                            </div>
                          )}

                          {order.order_status === 'completed' && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <CheckCircle2 size={16} color="#15803d" style={{ flexShrink: 0 }} />
                              <div style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                                <strong>Dispatched</strong> — Your payment was confirmed and your medication has been shipped via insured DHL Express.
                              </div>
                            </div>
                          )}

                          {order.order_status === 'cancelled' && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <AlertCircle size={15} color="#b91c1c" style={{ flexShrink: 0 }} />
                              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                                This order was cancelled. Contact <a href="mailto:Customersupport@thewellmanco.com" style={{ color: 'var(--green-700)' }}>Customersupport@thewellmanco.com</a>.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .order-details-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
