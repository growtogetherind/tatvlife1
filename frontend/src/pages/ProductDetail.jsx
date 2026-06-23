import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, Star, ShoppingBag, Plus, Minus, AlertTriangle, ClipboardList, Building2, PackageCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductBySlug } from '../lib/firestoreService';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('dosage');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const product = await getProductBySlug(slug);
        setProduct(product || null);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [slug]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading product details...</p>
    </div>
  );

  if (!product) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--beige-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <AlertTriangle size={28} color="var(--text-light)" />
      </div>
      <h2 style={{ marginBottom: '10px', fontWeight: 700 }}>Product Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>This product may have been removed or the URL is incorrect.</p>
      <Link to="/shop" className="btn-primary">Back to Catalog</Link>
    </div>
  );

  const img = product.image_url || `https://picsum.photos/seed/${product.slug}/500/500`;
  const tabs = [
    { id: 'dosage', label: 'Dosage', icon: ClipboardList },
    { id: 'side_effects', label: 'Side Effects', icon: AlertTriangle },
    { id: 'manufacturer', label: 'Manufacturer', icon: Building2 },
  ];

  return (
    <div style={{ background: 'var(--cream)', minHeight: '80vh', padding: '36px 0 80px' }}>
      <div className="container">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--white)', border: '1px solid var(--beige-200)',
              borderRadius: '9999px', padding: '8px 16px',
              color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--beige-300)'; e.currentTarget.style.background = 'var(--beige-100)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--beige-200)'; e.currentTarget.style.background = 'var(--white)'; }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span style={{ color: 'var(--beige-400)', fontSize: '14px' }}>/</span>
          <Link to="/shop" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Treatments</Link>
          <span style={{ color: 'var(--beige-400)', fontSize: '14px' }}>/</span>
          <span style={{ color: 'var(--text-dark)', fontSize: '13px', fontWeight: 500, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
        </div>

        {/* Main Grid */}
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '56px', alignItems: 'start' }}>

          {/* Image */}
          <div>
            <div style={{
              background: 'var(--white)', borderRadius: '24px',
              border: '1px solid var(--beige-200)', overflow: 'hidden',
              padding: '20px', boxShadow: 'var(--shadow-md)',
              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={img} alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
                onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/500/500`; }}
              />
            </div>

            {/* Trust badges under image */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              {[
                { icon: ShieldCheck, label: 'Quality Assured', sub: '100% genuine sourced' },
                { icon: Truck, label: 'Insured Delivery', sub: 'Fast & tracked shipping' },
                { icon: PackageCheck, label: 'Batch Traceable', sub: 'Full transparency' },
                { icon: Building2, label: product.manufacturer || 'Certified Partner', sub: 'Verified source' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} style={{
                  background: 'var(--white)', border: '1px solid var(--beige-200)',
                  borderRadius: '12px', padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={13} color="var(--green-700)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '1px' }}>{label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {product.categories && <span className="badge badge-green">{product.categories.name}</span>}
              {product.featured && <span className="badge badge-purple">Featured</span>}
              <span className="badge" style={{ background: 'var(--beige-100)', color: 'var(--text-muted)', border: '1px solid var(--beige-200)' }}>
                {product.manufacturer}
              </span>
            </div>

            <h1 className="font-serif" style={{
              fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 500,
              lineHeight: 1.15, color: 'var(--green-900)', marginBottom: '14px',
            }}>
              {product.name}
            </h1>

            {/* Ratings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? '#f59e0b' : 'none'} color={i < 4 ? '#f59e0b' : '#d1d5db'} />)}
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-dark)' }}>4.0</span>
              <span style={{ color: 'var(--beige-300)', fontSize: '14px' }}>|</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Verified Reviews</span>
            </div>

            {/* Price + Stock */}
            <div style={{
              background: 'var(--white)', border: '1px solid var(--beige-200)',
              borderRadius: '16px', padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '28px', boxShadow: 'var(--shadow-xs)',
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                  Price (Express Delivery Included)
                </span>
                <span style={{ fontSize: '30px', fontWeight: 800, color: 'var(--green-900)', letterSpacing: '-0.03em' }}>
                  ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <span style={{
                padding: '5px 13px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700,
                background: product.stock > 0 ? '#f0fdf4' : '#fef2f2',
                color: product.stock > 0 ? '#15803d' : '#b91c1c',
                border: `1px solid ${product.stock > 0 ? '#bbf7d0' : '#fecaca'}`,
              }}>
                {product.stock > 0 ? `In Stock — ${product.stock} units` : 'Out of Stock'}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '28px' }}>
              {product.description}
            </p>

            {/* Info Tabs */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '0', background: 'var(--beige-100)', borderRadius: '12px', padding: '4px', marginBottom: '16px' }}>
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    style={{
                      flex: 1, padding: '9px', border: 'none', cursor: 'pointer',
                      borderRadius: '9px', fontSize: '13px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      background: activeTab === id ? 'var(--white)' : 'transparent',
                      color: activeTab === id ? 'var(--green-900)' : 'var(--text-muted)',
                      boxShadow: activeTab === id ? 'var(--shadow-xs)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>

              <div style={{
                background: 'var(--white)', border: '1px solid var(--beige-200)',
                borderRadius: '12px', padding: '18px 20px',
                fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65,
                minHeight: '80px',
              }}>
                {activeTab === 'dosage' && (product.dosage || 'Follow guidelines specified on the product packaging.')}
                {activeTab === 'side_effects' && (product.side_effects || 'Standard tolerances apply. Consult a wellness practitioner if needed.')}
                {activeTab === 'manufacturer' && (
                  <div>
                    <strong style={{ color: 'var(--text-dark)' }}>{product.manufacturer}</strong>
                    <br />Certified wellness and specialty pharmacy partner operating under strict quality standards.
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Qty Picker */}
              <div style={{
                display: 'flex', alignItems: 'center',
                background: 'var(--white)', border: '1.5px solid var(--beige-200)',
                borderRadius: '12px', overflow: 'hidden',
              }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: '44px', height: '48px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--beige-100)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Minus size={15} />
                </button>
                <span style={{ width: '36px', textAlign: 'center', fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  style={{ width: '44px', height: '48px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--beige-100)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Plus size={15} />
                </button>
              </div>

              <button
                onClick={() => addItem(product, quantity)}
                disabled={product.stock <= 0}
                className="btn-primary"
                style={{
                  flex: 1, borderRadius: '12px', padding: '14px 24px',
                  gap: '8px', fontSize: '15px',
                  opacity: product.stock <= 0 ? 0.5 : 1,
                  cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <ShoppingBag size={18} />
                Add {quantity} to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .detail-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
