import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FileUp, ShieldCheck, ArrowRight, Lock, MapPin, Phone, User, Globe, CheckCircle, CreditCard, Bitcoin } from 'lucide-react';
import { API_BASE } from '../lib/api';

const Checkout = () => {
  const { cartItems, cartSubtotal, requiresPrescription, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.full_name || '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [prescription, setPrescription] = useState({ name: '', base64: '' });
  const [paymentGateway, setPaymentGateway] = useState('crypto');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPrescription({ name: file.name, base64: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!user || !token) { navigate('/login?redirect=checkout'); return; }
    if (requiresPrescription && !prescription.base64) {
      setError('A valid prescription document is required for specialty medications.');
      return;
    }
    const required = ['fullName', 'phone', 'addressLine', 'city', 'state', 'postalCode'];
    if (required.some(k => !address[k])) {
      setError('Please complete all shipping address fields.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          items: cartItems.map(i => ({ product_id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })),
          totalAmount: cartSubtotal,
          shippingAddress: address,
          prescriptionName: prescription.name,
          prescriptionData: prescription.base64,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit order');
      clearCart();
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !showSuccessModal) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--beige-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShieldCheck size={28} color="var(--text-light)" />
        </div>
        <h2 style={{ marginBottom: '12px', fontWeight: 700 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add treatments to your cart before checking out.</p>
        <Link to="/shop" className="btn-primary">Browse Catalog</Link>
      </div>
    );
  }

  const inputRow = (label, name, type = 'text', placeholder = '', colSpan = false) => (
    <div style={{ gridColumn: colSpan ? 'span 2' : 'span 1' }}>
      <label className="label">{label}</label>
      <input type={type} className="input" name={name} value={address[name]} onChange={handleInputChange} placeholder={placeholder} required />
    </div>
  );

  const PaymentOption = ({ value, icon: Icon, title, subtitle }) => (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 18px',
      border: '1.5px solid', borderRadius: '14px',
      borderColor: paymentGateway === value ? 'var(--green-500)' : 'var(--beige-200)',
      background: paymentGateway === value ? 'var(--green-50)' : 'var(--white)',
      cursor: 'pointer', transition: 'all 0.2s',
    }}>
      <input type="radio" name="paymentGateway" value={value}
        checked={paymentGateway === value} onChange={() => setPaymentGateway(value)}
        style={{ accentColor: 'var(--green-800)', marginTop: '2px', flexShrink: 0 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: paymentGateway === value ? 'var(--green-100)' : 'var(--beige-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'background 0.2s',
        }}>
          <Icon size={18} color={paymentGateway === value ? 'var(--green-700)' : 'var(--text-muted)'} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--green-900)' }}>{title}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>
        </div>
      </div>
    </label>
  );

  return (
    <div style={{ background: 'var(--cream)', minHeight: '80vh', padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>

        <div style={{ marginBottom: '36px' }}>
          <h1 className="font-serif" style={{ fontSize: '32px', fontWeight: 500, marginBottom: '6px' }}>Secure Checkout</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Review your order and complete your details below.</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '40px', alignItems: 'start' }}>

          {/* Left: Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Address */}
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={15} color="var(--green-700)" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>Shipping Address</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {inputRow('Receiver Full Name', 'fullName', 'text', 'John Doe', true)}
                {inputRow('Phone Number', 'phone', 'tel', '+1 (555) 019-2834')}
                {inputRow('Country', 'country', 'text', 'United States')}
                {inputRow('Street Address', 'addressLine', 'text', 'House no., Street, Landmark', true)}
                {inputRow('City', 'city')}
                {inputRow('State', 'state')}
                {inputRow('PIN Code', 'postalCode')}
              </div>
            </div>

            {/* Prescription */}
            {requiresPrescription && (
              <div className="card-elevated" style={{ border: '2px dashed var(--green-300)', background: 'var(--green-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileUp size={15} color="var(--green-700)" />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>Upload Prescription</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '16px' }}>
                  This order contains specialty products that require a prescription from your healthcare provider.
                </p>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'white', border: '1.5px dashed var(--green-300)', borderRadius: '12px',
                  padding: '28px 20px', cursor: 'pointer', position: 'relative', textAlign: 'center',
                  transition: 'border-color 0.2s',
                }}>
                  <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} required />
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: '1px solid var(--green-200)' }}>
                    <FileUp size={20} color="var(--green-700)" />
                  </div>
                  {prescription.name ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} color="var(--green-600)" />
                      <strong style={{ fontSize: '13.5px', color: 'var(--green-900)' }}>{prescription.name}</strong>
                    </div>
                  ) : (
                    <>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-dark)', display: 'block', marginBottom: '4px' }}>Click to upload prescription</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>PDF, PNG, JPG — Max 5MB</span>
                    </>
                  )}
                </label>
              </div>
            )}

            {/* Payment */}
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bitcoin size={15} color="var(--green-700)" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>Payment Method</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <PaymentOption value="crypto" icon={Bitcoin} title="Cryptocurrency (USDT / USDC / BTC)" subtitle="Secure on-chain payment — safest for international orders" />
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="card-elevated">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green-900)', marginBottom: '20px' }}>Order Summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--beige-100)' }}>
                {cartItems.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img
                      src={item.product.image_url || `https://picsum.photos/seed/${item.product.slug}/56/56`}
                      alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', background: 'var(--beige-100)', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, lineHeight: 1.3, color: 'var(--text-dark)' }}>{item.product.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Qty: {item.quantity}</p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--green-900)', flexShrink: 0 }}>
                      ${(item.product.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--beige-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span><span>${cartSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>Free Express</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green-900)' }}>Total</span>
                <strong style={{ fontSize: '24px', fontWeight: 800, color: 'var(--green-900)', letterSpacing: '-0.03em' }}>
                  ${cartSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', borderRadius: '12px', padding: '15px', gap: '8px' }}>
                <Lock size={15} />
                <span>{submitting ? 'Processing...' : 'Place Secure Order'}</span>
                <ArrowRight size={15} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginTop: '14px', color: 'var(--text-light)', fontSize: '12px' }}>
                <ShieldCheck size={14} color="var(--green-500)" />
                <span>256-bit SSL encrypted transaction</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(18, 38, 32, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="card-elevated" style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            padding: '40px 32px',
            background: 'var(--white)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--green-50)',
              border: '1px solid var(--green-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle size={28} color="var(--green-700)" />
            </div>
            <div>
              <h2 className="font-serif" style={{ fontSize: '24px', fontWeight: 500, color: 'var(--green-900)', marginBottom: '12px' }}>
                Order Placed Successfully!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
                Your cryptocurrency payment invoice link will be sent to your email. Your order will be confirmed within 24 hours of payment.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
              style={{ width: '100%', borderRadius: '12px', padding: '14px', justifyContent: 'center' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 992px) {
          .checkout-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
