import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FileUp, ShieldCheck, ArrowRight, Lock, MapPin, CheckCircle, Clock } from 'lucide-react';
import { validateCoupon, createOrder, incrementCouponUse, getCheckoutSettings, defaultCheckoutSettings } from '../lib/firestoreService';
import AddressAutocomplete from '../components/AddressAutocomplete';
import MapAddressPickerModal from '../components/MapAddressPickerModal';

const countriesList = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'India',
  'Germany',
  'France',
  'Japan',
  'Brazil',
  'Mexico',
  'South Africa',
  'New Zealand',
  'Singapore',
  'Spain',
  'Italy',
  'Netherlands',
];

const SearchableCountrySelect = ({ value, onChange, error, autofillFlash }) => {
  const [search, setSearch] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  useEffect(() => {
    if (autofillFlash) {
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 1200);
      return () => clearTimeout(t);
    }
  }, [autofillFlash]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCountries = countriesList.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (c) => {
    setSearch(c);
    onChange({ name: 'country', value: c });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <label className="label">Country <span style={{ color: '#e53e3e' }}>*</span></label>
      <input
        type="text"
        className="input animate-fade-in"
        name="country"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange({ name: 'country', value: e.target.value });
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search country..."
        required
        style={{
          borderColor: error ? '#e53e3e' : flashing ? 'var(--green-500)' : undefined,
          boxShadow: flashing
            ? '0 0 0 3px rgba(72, 187, 120, 0.25)'
            : error
            ? '0 0 0 3px rgba(229, 62, 62, 0.15)'
            : undefined,
          background: flashing ? 'rgba(72, 187, 120, 0.04)' : undefined,
          transition: 'border-color 0.3s, box-shadow 0.4s, background 0.4s',
        }}
      />
      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--white)',
            border: '1px solid #E5E5E2',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            listStyle: 'none',
            margin: '4px 0 0',
            padding: '4px',
          }}
        >
          {filteredCountries.length === 0 ? (
            <li style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No countries found
            </li>
          ) : (
            filteredCountries.map(c => (
              <li
                key={c}
                onMouseDown={() => handleSelect(c)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  color: 'var(--text-dark)',
                  background: search.toLowerCase() === c.toLowerCase() ? 'var(--green-50)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--green-50)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = search.toLowerCase() === c.toLowerCase() ? 'var(--green-50)' : 'transparent';
                }}
              >
                {c}
              </li>
            ))
          )}
        </ul>
      )}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '12px', color: '#c53030', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

const Checkout = () => {
  const { cartItems, cartSubtotal, requiresPrescription, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(() => {
    const saved = localStorage.getItem('checkout_address');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          fullName: parsed.fullName ?? (user?.full_name || ''),
          email: parsed.email ?? (user?.email || ''),
          addressLine: parsed.addressLine ?? '',
          city: parsed.city ?? '',
          state: parsed.state ?? '',
          postalCode: parsed.postalCode ?? '',
          country: parsed.country ?? 'United States',
          landmark: parsed.landmark ?? '',
          latitude: parsed.latitude ?? null,
          longitude: parsed.longitude ?? null,
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      fullName: user?.full_name || '',
      email: user?.email || '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      landmark: '',
      latitude: null,
      longitude: null,
    };
  });

  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    email: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [autofillHighlight, setAutofillHighlight] = useState({
    addressLine: false,
    city: false,
    state: false,
    postalCode: false,
    country: false,
  });
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapSelectionDetails, setMapSelectionDetails] = useState(null);

  const streetAddressRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('checkout_address', JSON.stringify(address));
  }, [address]);

  // Sync user values if they load later
  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        fullName: prev.fullName || user.full_name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [prescription, setPrescription] = useState({ name: '', base64: '' });
  const [paymentGateway, setPaymentGateway] = useState('usdt');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasAcceptedAgreement, setHasAcceptedAgreement] = useState(false);
  const [checkoutSettings, setCheckoutSettings] = useState(defaultCheckoutSettings);

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const discountAmount = appliedCoupon?.discount_amount || 0;
  const freeDeliveryThreshold = Number(checkoutSettings.free_delivery_threshold) || 100;
  const configuredDeliveryFee = Number(checkoutSettings.delivery_fee) || 0;
  const deliveryFee = cartSubtotal >= freeDeliveryThreshold || cartSubtotal === 0 ? 0 : configuredDeliveryFee;
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const taxRatePercent = checkoutSettings.tax_enabled ? Number(checkoutSettings.tax_rate_percent) || 0 : 0;
  const taxAmount = Math.round((taxableAmount * taxRatePercent / 100) * 100) / 100;
  const finalTotal = Math.max(0.01, taxableAmount + deliveryFee + taxAmount);

  useEffect(() => {
    const loadCheckoutSettings = async () => {
      try {
        setCheckoutSettings(await getCheckoutSettings());
      } catch (err) {
        console.error('Failed to load checkout settings:', err);
      }
    };
    loadCheckoutSettings();
  }, []);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    setValidatingCoupon(true);
    try {
      const data = await validateCoupon(couponCodeInput.trim().toUpperCase(), cartSubtotal);
      setAppliedCoupon(data);
      setCouponSuccess(`Coupon "${data.code}" applied: $${Number(data.discount_amount).toFixed(2)} off!`);
    } catch (err) {
      setCouponError(err.message || 'Failed to validate coupon.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleInputChange = e => {
    let name, value;
    if (e.target) {
      name = e.target.name;
      value = e.target.value;
    } else {
      name = e.name;
      value = e.value;
    }
    setAddress(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      streetAddressRef.current?.focus();
    }
  };

  const handleAddressSelect = (selected) => {
    setAddress(prev => ({
      ...prev,
      addressLine: selected.street || prev.addressLine,
      city: selected.city || prev.city,
      state: selected.state || prev.state,
      country: selected.country || prev.country,
      postalCode: selected.postalCode || prev.postalCode,
      landmark: selected.landmark || prev.landmark,
    }));

    const highlights = {
      addressLine: !!selected.street,
      city: !!selected.city,
      state: !!selected.state,
      country: !!selected.country,
      postalCode: !!selected.postalCode,
    };
    setAutofillHighlight(highlights);

    setTimeout(() => {
      setAutofillHighlight({
        addressLine: false,
        city: false,
        state: false,
        postalCode: false,
        country: false,
      });
    }, 1500);

    // Clear validation errors for filled fields
    setValidationErrors(prev => {
      const next = { ...prev };
      if (selected.street) next.addressLine = '';
      if (selected.city) next.city = '';
      if (selected.state) next.state = '';
      if (selected.country) next.country = '';
      if (selected.postalCode) next.postalCode = '';
      return next;
    });

    if (!selected.postalCode) {
      setTimeout(() => {
        document.getElementsByName('postalCode')[0]?.focus();
      }, 50);
    }
  };

  const handleMapSelectionConfirm = (selection) => {
    setAddress(prev => ({
      ...prev,
      addressLine: selection.street || prev.addressLine,
      city: selection.city || prev.city,
      state: selection.state || prev.state,
      country: selection.country || prev.country,
      postalCode: selection.postalCode || prev.postalCode,
      landmark: selection.landmark || prev.landmark,
      latitude: selection.latitude ?? prev.latitude,
      longitude: selection.longitude ?? prev.longitude,
    }));
    setMapSelectionDetails(selection);
    setAutofillHighlight({
      addressLine: !!selection.street,
      city: !!selection.city,
      state: !!selection.state,
      country: !!selection.country,
      postalCode: !!selection.postalCode,
    });
    setTimeout(() => {
      setAutofillHighlight({
        addressLine: false,
        city: false,
        state: false,
        postalCode: false,
        country: false,
      });
    }, 1500);
    setValidationErrors(prev => ({
      ...prev,
      addressLine: selection.street ? '' : prev.addressLine,
      city: selection.city ? '' : prev.city,
      state: selection.state ? '' : prev.state,
      country: selection.country ? '' : prev.country,
      postalCode: selection.postalCode ? '' : prev.postalCode,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!address.fullName.trim()) {
      newErrors.fullName = 'Receiver Full Name is required';
      isValid = false;
    }
    if (!address.email.trim()) {
      newErrors.email = 'Email Address is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    if (!address.addressLine.trim()) {
      newErrors.addressLine = 'Street Address is required';
      isValid = false;
    }
    if (!address.city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    }
    if (!address.state.trim()) {
      newErrors.state = 'State / Province is required';
      isValid = false;
    }
    if (!address.country.trim()) {
      newErrors.country = 'Country is required';
      isValid = false;
    }
    if (!address.postalCode.trim()) {
      newErrors.postalCode = 'ZIP / Postal Code is required';
      isValid = false;
    } else if (address.postalCode.trim().length < 3) {
      newErrors.postalCode = 'ZIP / Postal Code must be at least 3 characters';
      isValid = false;
    }

    setValidationErrors(newErrors);
    return isValid;
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
    if (!user) { navigate('/login?redirect=checkout'); return; }
    if (requiresPrescription && !prescription.base64) {
      setError('A valid prescription document is required for specialty medications.');
      return;
    }
    if (!validateForm()) {
      setError('Please complete all required fields correctly.');
      return;
    }
    if (!hasAcceptedAgreement) {
      setError('Please read and agree to the Terms of Service and Health Disclaimer before proceeding to payment.');
      return;
    }

    try {
      setSubmitting(true);
      await createOrder({
        user_id: user.id,
        user_email: user.email,
        items: cartItems.map(i => ({ product_id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })),
        total_amount: finalTotal,
        subtotal_amount: cartSubtotal,
        delivery_fee: deliveryFee,
        tax_amount: taxAmount,
        tax_rate_percent: taxRatePercent,
        free_delivery_threshold: freeDeliveryThreshold,
        shipping_address: {
          ...address,
          landmark: address.landmark || '',
          latitude: address.latitude ?? null,
          longitude: address.longitude ?? null,
        },
        prescription_name: prescription.name || null,
        prescription_data: prescription.base64 || null,
        payment_status: 'unpaid',
        order_status: 'pending_payment',
        payment_link: '',
        transaction_hash: '',
        payment_method: paymentGateway,
        coupon_code: appliedCoupon?.code || null,
        discount_amount: appliedCoupon ? Number(discountAmount).toFixed(2) : 0,
      });
      if (appliedCoupon?.code) {
        await incrementCouponUse(appliedCoupon.code);
      }
      localStorage.removeItem('checkout_address');
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



  const CryptoIcon = ({ symbol, isSelected }) => {
    const color = isSelected ? '#1E3F35' : 'var(--text-light)';
    switch (symbol) {
      case 'btc':
        return <span style={{ fontSize: '22px', fontWeight: 'bold', color: isSelected ? '#F7931A' : color }}>₿</span>;
      case 'eth':
        return <span style={{ fontSize: '20px', fontWeight: 'bold', color: isSelected ? '#627EEA' : color }}>Ξ</span>;
      case 'usdt':
        return <span style={{ fontSize: '20px', fontWeight: 'bold', color: isSelected ? '#26A17B' : color }}>₮</span>;
      case 'usdc':
        return <span style={{ fontSize: '20px', fontWeight: 'bold', color: isSelected ? '#2775CA' : color }}>Ⓢ</span>;
      case 'dai_usds':
        return <span style={{ fontSize: '18px', fontWeight: 'bold', color: isSelected ? '#F4B731' : color }}>◈</span>;
      case 'usd1':
        return <span style={{ fontSize: '18px', fontWeight: 'bold', color: isSelected ? '#00c3a6' : color }}>1</span>;
      case 'usde':
        return <span style={{ fontSize: '18px', fontWeight: 'bold', color: isSelected ? '#ff5a00' : color }}>e</span>;
      case 'usdg':
        return <span style={{ fontSize: '18px', fontWeight: 'bold', color: isSelected ? '#4f46e5' : color }}>G</span>;
      case 'usdd':
        return <span style={{ fontSize: '18px', fontWeight: 'bold', color: isSelected ? '#0369a1' : color }}>D</span>;
      default:
        return <span style={{ fontSize: '18px', fontWeight: 'bold' }}>$</span>;
    }
  };

  const PaymentOption = ({ value, label }) => {
    const isSelected = paymentGateway === value;
    return (
      <div
        onClick={() => setPaymentGateway(value)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px 12px',
          border: isSelected ? '1.5px solid #1E3F35' : '1.5px solid #E5E5E2',
          borderRadius: '16px',
          background: isSelected ? '#EBF2F0' : 'var(--white)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          textAlign: 'center',
          flex: 1,
          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CryptoIcon symbol={value} isSelected={isSelected} />
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: isSelected ? '#1E3F35' : 'var(--text-dark)',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '80vh', padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>

        <div style={{ marginBottom: '36px' }}>
          <h1 className="font-serif" style={{ fontSize: '32px', fontWeight: 500, marginBottom: '6px' }}>Secure Checkout</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Review your order and complete your details below.</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }} aria-live="assertive">
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '40px', alignItems: 'start' }}>

          {/* Left: Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Address */}
            <div className="card-elevated animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={15} color="var(--green-700)" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>Shipping Address</h3>
              </div>
              <div className="shipping-form-grid">
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Receiver Full Name <span style={{ color: '#e53e3e' }}>*</span></label>
                  <input
                    type="text"
                    className="input"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    style={{
                      borderColor: validationErrors.fullName ? '#e53e3e' : undefined,
                    }}
                  />
                  {validationErrors.fullName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '12px', color: '#c53030', fontWeight: 500 }}>
                      ⚠️ {validationErrors.fullName}
                    </div>
                  )}
                </div>

                <div className="form-col-email">
                  <label className="label">Email Address <span style={{ color: '#e53e3e' }}>*</span></label>
                  <input
                    type="email"
                    className="input"
                    name="email"
                    value={address.email}
                    onChange={handleInputChange}
                    onKeyDown={handleEmailKeyDown}
                    placeholder="john.doe@example.com"
                    required
                    style={{
                      borderColor: validationErrors.email ? '#e53e3e' : undefined,
                    }}
                  />
                  {validationErrors.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '12px', color: '#c53030', fontWeight: 500 }}>
                      ⚠️ {validationErrors.email}
                    </div>
                  )}
                </div>

                <div className="form-col-country">
                  <SearchableCountrySelect
                    value={address.country}
                    onChange={handleInputChange}
                    error={validationErrors.country}
                    autofillFlash={autofillHighlight.country}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <label className="label">Street Address <span style={{ color: '#e53e3e' }}>*</span></label>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      style={{ border: '1px solid #d8d2c4', background: 'white', color: 'var(--green-700)', padding: '7px 10px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MapPin size={14} />
                      Select on Map
                    </button>
                  </div>
                  <AddressAutocomplete
                    ref={streetAddressRef}
                    value={address.addressLine}
                    onChange={handleInputChange}
                    onSelect={handleAddressSelect}
                    error={validationErrors.addressLine}
                    autofillFlash={autofillHighlight.addressLine}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Landmark / Nearby Place</label>
                  <input
                    type="text"
                    className="input"
                    name="landmark"
                    value={address.landmark || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Near City Hospital, Opposite Metro Station"
                  />
                </div>

                <div className="form-col-city">
                  <label className="label">City <span style={{ color: '#e53e3e' }}>*</span></label>
                  <input
                    type="text"
                    className="input"
                    name="city"
                    value={address.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                    style={{
                      borderColor: validationErrors.city ? '#e53e3e' : autofillHighlight.city ? 'var(--green-500)' : undefined,
                      boxShadow: autofillHighlight.city ? '0 0 0 3px rgba(72, 187, 120, 0.25)' : undefined,
                      background: autofillHighlight.city ? 'rgba(72, 187, 120, 0.04)' : undefined,
                      transition: 'border-color 0.3s, box-shadow 0.4s, background 0.4s',
                    }}
                  />
                  {validationErrors.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '12px', color: '#c53030', fontWeight: 500 }}>
                      ⚠️ {validationErrors.city}
                    </div>
                  )}
                </div>

                <div className="form-col-state">
                  <label className="label">State / Province <span style={{ color: '#e53e3e' }}>*</span></label>
                  <input
                    type="text"
                    className="input"
                    name="state"
                    value={address.state}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                    style={{
                      borderColor: validationErrors.state ? '#e53e3e' : autofillHighlight.state ? 'var(--green-500)' : undefined,
                      boxShadow: autofillHighlight.state ? '0 0 0 3px rgba(72, 187, 120, 0.25)' : undefined,
                      background: autofillHighlight.state ? 'rgba(72, 187, 120, 0.04)' : undefined,
                      transition: 'border-color 0.3s, box-shadow 0.4s, background 0.4s',
                    }}
                  />
                  {validationErrors.state && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '12px', color: '#c53030', fontWeight: 500 }}>
                      ⚠️ {validationErrors.state}
                    </div>
                  )}
                </div>

                <div className="form-col-zip" style={{ gridColumn: 'span 2' }}>
                  <label className="label">ZIP / Postal Code <span style={{ color: '#e53e3e' }}>*</span></label>
                  <input
                    type="text"
                    className="input"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    required
                    style={{
                      borderColor: validationErrors.postalCode ? '#e53e3e' : autofillHighlight.postalCode ? 'var(--green-500)' : undefined,
                      boxShadow: autofillHighlight.postalCode ? '0 0 0 3px rgba(72, 187, 120, 0.25)' : undefined,
                      background: autofillHighlight.postalCode ? 'rgba(72, 187, 120, 0.04)' : undefined,
                      transition: 'border-color 0.3s, box-shadow 0.4s, background 0.4s',
                    }}
                  />
                  {validationErrors.postalCode && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '12px', color: '#c53030', fontWeight: 500 }}>
                      ⚠️ {validationErrors.postalCode}
                    </div>
                  )}
                </div>
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
            <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 className="font-serif" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '4px' }}>Confirm Order & Pay</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                  We will process your order and generate a secure cryptocurrency payment link.
                </p>
              </div>

              <div className="payment-grid">
                <PaymentOption value="btc" label="BTC" />
                <PaymentOption value="eth" label="ETH" />
                <PaymentOption value="usdt" label="USDT" />
                <PaymentOption value="usdc" label="USDC" />
                <PaymentOption value="dai_usds" label="DAI / USDS" />
                <PaymentOption value="usd1" label="USD1" />
                <PaymentOption value="usde" label="USDe" />
                <PaymentOption value="usdg" label="USDG" />
                <PaymentOption value="usdd" label="USDD" />
              </div>

              {/* Callout Card 1: Payment Link Info */}
              <div style={{
                background: '#0B2D24',
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
              }}>
                <Clock size={20} color="#EBF2F0" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ fontSize: '14px', color: 'var(--white)', fontWeight: 600 }}>Payment Link via Email</strong>
                  <p style={{ fontSize: '12.5px', color: '#EBF2F0', margin: 0, lineHeight: 1.45 }}>
                    A secure cryptocurrency payment link for <strong>{Number(finalTotal).toFixed(6)} {paymentGateway === 'dai_usds' ? 'DAI / USDS' : paymentGateway.toUpperCase()}</strong> will be automatically emailed to you once you place this order.
                  </p>
                </div>
              </div>

              {/* Callout Card 2: Shipping Notice */}
              <div style={{
                background: '#F7F6F2',
                border: '1px solid #EAE8E2',
                borderRadius: '16px',
                padding: '16px 20px',
              }}>
                <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-dark)', margin: 0 }}>
                  📦 <strong>Order Packing & Shipping:</strong> Once the payment transaction is completed, our team will immediately pack, inspect, and dispatch your order. Tracking details will be updated in your dashboard.
                </p>
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
                      alt={item.product.name}
                      loading="lazy"
                      decoding="async"
                      width="56"
                      height="56"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', background: 'var(--beige-100)', flexShrink: 0 }}
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

              {/* Coupon Field */}
              <div style={{ padding: '16px 0', borderBottom: '1px solid var(--beige-100)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="input"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', textTransform: 'uppercase', height: '40px', fontSize: '13px' }}
                    placeholder="Enter Coupon Code"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon || validatingCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="btn-ghost"
                      style={{ padding: '0 16px', borderRadius: '10px', height: '40px', border: '1px solid #b91c1c', color: '#b91c1c', fontSize: '13px', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="btn-primary"
                      disabled={validatingCoupon || !couponCodeInput}
                      style={{ padding: '0 16px', borderRadius: '10px', height: '40px', fontSize: '13px', fontWeight: 600 }}
                    >
                      {validatingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && (
                  <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                    ⚠️ {couponError}
                  </div>
                )}
                {couponSuccess && (
                  <div style={{ color: 'var(--green-700)', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>
                    ✓ {couponSuccess}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--beige-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span><span>${cartSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: 'var(--green-700)', fontWeight: 600 }}>
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-${Number(appliedCoupon.discount_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                  <span style={{ color: deliveryFee === 0 ? 'var(--green-600)' : 'var(--text-dark)', fontWeight: 600 }}>
                    {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tax</span>
                  <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                    ${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green-900)' }}>Total</span>
                <strong style={{ fontSize: '24px', fontWeight: 800, color: 'var(--green-900)', letterSpacing: '-0.03em' }}>
                  ${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <label className="checkout-agreement">
                <input
                  type="checkbox"
                  checked={hasAcceptedAgreement}
                  onChange={event => setHasAcceptedAgreement(event.target.checked)}
                  required
                />
                <span>
                  I have read and agree to the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/disclaimer" target="_blank" rel="noopener noreferrer">Health Disclaimer</a>.
                </span>
              </label>

              <button type="submit" disabled={submitting || !hasAcceptedAgreement} className="btn-primary" style={{ width: '100%', borderRadius: '12px', padding: '15px', gap: '8px' }}>
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
                Your cryptocurrency payment invoice link for <strong>{Number(finalTotal).toFixed(6)} {paymentGateway === 'dai_usds' ? 'DAI / USDS' : paymentGateway.toUpperCase()}</strong> will be sent to your email. Your order will be confirmed within 24 hours of payment.
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

      <MapAddressPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirm={handleMapSelectionConfirm}
        initialCountry={address.country}
        initialAddress={address}
      />

      <style>{`
        .payment-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 600px) {
          .payment-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 400px) {
          .payment-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 992px) {
          .checkout-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }

        .shipping-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-col-email {
          grid-column: span 1;
        }
        .form-col-country {
          grid-column: span 1;
        }
        .form-col-city {
          grid-column: span 1;
        }
        .form-col-state {
          grid-column: span 1;
        }
        .form-col-zip {
          grid-column: span 2;
        }
        @media (max-width: 600px) {
          .shipping-form-grid {
            grid-template-columns: 1fr !important;
          }
          .shipping-form-grid > div {
            grid-column: span 1 !important;
          }
          .form-col-email,
          .form-col-country,
          .form-col-city,
          .form-col-state,
          .form-col-zip {
            grid-column: span 1 !important;
          }
        }
        @keyframes highlight-fade {
          0% {
            background-color: rgba(72, 187, 120, 0.15);
            border-color: var(--green-500);
          }
          100% {
            background-color: transparent;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
