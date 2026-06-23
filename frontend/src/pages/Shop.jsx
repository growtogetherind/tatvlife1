import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingBag, Star, SlidersHorizontal, ChevronDown, Tag, Filter } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../lib/api';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const img = product.image_url || `https://picsum.photos/seed/${product.slug}/400/400`;

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="product-image-wrap">
          <img
            src={img} alt={product.name}
            onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/400/400`; }}
          />
          {product.featured && (
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: 'var(--green-800)', color: 'white',
              padding: '3px 10px', borderRadius: 9999, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
            }}>FEATURED</div>
          )}
          {product.stock < 20 && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(4px)',
              color: 'white', padding: '3px 10px', borderRadius: 9999, fontSize: 10.5, fontWeight: 700,
            }}>LOW STOCK</div>
          )}
        </div>
        <div style={{ padding: '18px 18px 12px' }}>
          {product.categories && (
            <span className="badge badge-green" style={{ marginBottom: 10 }}>
              {product.categories.name}
            </span>
          )}
          <h3 style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-dark)', marginBottom: 6, lineHeight: 1.35 }}>
            {product.name}
          </h3>
          <p style={{
            color: 'var(--text-muted)', fontSize: 12.5, lineHeight: 1.55, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 4 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < 4 ? '#f59e0b' : 'none'} color={i < 4 ? '#f59e0b' : '#d1d5db'} />)}
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginLeft: 4 }}>(4.0)</span>
          </div>
        </div>
      </Link>
      <div style={{ padding: '12px 18px 18px', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTop: '1px solid var(--beige-100)' }}>
        <span className="price-tag">${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/product/${product.slug}`} style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '8px 14px', borderRadius: 9999,
            border: '1.5px solid var(--beige-300)', color: 'var(--text-muted)',
            fontSize: 12.5, fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--beige-400)'; e.currentTarget.style.background = 'var(--beige-100)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--beige-300)'; e.currentTarget.style.background = 'transparent'; }}
          >
            Details
          </Link>
          <button onClick={() => addItem(product)} className="btn-primary btn-sm" style={{ gap: 5 }}>
            <ShoppingBag size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [sort, setSort] = useState('featured');
  const [priceMax, setPriceMax] = useState(100);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    setSelectedCat(cat);
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pRes, cRes, coupRes] = await Promise.all([
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/coupons/active`),
        ]);
        if (pRes.ok && cRes.ok) {
          setProducts(await pRes.json());
          setCategories(await cRes.json());
        }
        if (coupRes.ok) {
          setActiveCoupons(await coupRes.json());
        }
      } catch (err) {
        console.error('Failed to fetch shop data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (slug) => {
    setSelectedCat(slug);
    if (slug === 'all') searchParams.delete('category');
    else searchParams.set('category', slug);
    setSearchParams(searchParams);
  };

  const filtered = products
    .filter(p => selectedCat === 'all' || p.category_id === selectedCat || p.categories?.slug === selectedCat)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    .filter(p => p.price <= priceMax)
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Page Header */}
      <div style={{ background: 'var(--green-900)', padding: '48px 0 44px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Tag size={13} color="rgba(255,255,255,0.5)" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Catalog
            </span>
          </div>
          <h1 className="font-serif" style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 500, color: 'white', marginBottom: '10px' }}>
            Shop Specialty Medications
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', maxWidth: '460px', margin: 0, lineHeight: 1.55 }}>
            Browse our curated catalog of genuine specialty and wellness medications.
          </p>
        </div>
      </div>

      <div className="container" style={{ flex: 1, padding: '36px 28px 60px' }}>

        {/* Active Promo Banner */}
        {!dismissedBanner && activeCoupons.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-950) 100%)',
            borderRadius: '16px',
            padding: '16px 24px',
            marginBottom: '28px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 10px 25px -5px rgba(22, 101, 52, 0.15), 0 8px 10px -6px rgba(22, 101, 52, 0.15)',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background design elements */}
            <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-50%', left: '20%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }}>
                <Tag size={18} color="white" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 700, letterSpacing: '0.01em' }}>
                  {activeCoupons[0].title}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
                  {activeCoupons[0].banner_text || `Use code ${activeCoupons[0].code} at checkout to claim your discount.`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ background: 'white', color: 'var(--green-950)', padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, fontFamily: 'ui-monospace, monospace', border: '1px solid rgba(255,255,255,0.25)' }}>
                {activeCoupons[0].code}
              </div>
              <button 
                onClick={() => setDismissedBanner(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '20px',
                  lineHeight: '1',
                  padding: '4px',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none' }} />
            <input
              className="input" style={{ paddingLeft: '42px' }}
              placeholder="Search medications..." value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-outline btn-sm" onClick={() => setShowSidebar(!showSidebar)} style={{ gap: 6, flexShrink: 0 }}>
            <Filter size={14} />
            <span>Filters</span>
          </button>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select className="select" style={{ minWidth: '170px' }} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Category Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {[{ id: 'all', name: 'All Treatments', slug: 'all' }, ...categories].map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug || 'all')}
              style={{
                padding: '7px 16px', borderRadius: '9999px', border: '1.5px solid',
                borderColor: selectedCat === (cat.slug || 'all') ? 'var(--green-700)' : 'var(--beige-300)',
                background: selectedCat === (cat.slug || 'all') ? 'var(--green-800)' : 'var(--white)',
                color: selectedCat === (cat.slug || 'all') ? 'white' : 'var(--text-muted)',
                cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
              }}
            >{cat.name}</button>
          ))}
        </div>

        {/* Layout */}
        <div className="shop-layout" style={{ display: 'grid', gridTemplateColumns: showSidebar ? '224px 1fr' : '1fr', gap: '32px' }}>

          {/* Sidebar */}
          {showSidebar && (
            <aside style={{ borderRight: '1px solid var(--beige-200)', paddingRight: '24px' }} className="hidden-mobile">
              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Categories
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {[{ id: 'all', name: 'All Treatments', slug: 'all' }, ...categories].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug || 'all')}
                      style={{
                        textAlign: 'left', padding: '9px 12px', borderRadius: '8px', border: 'none',
                        background: selectedCat === (cat.slug || 'all') ? 'var(--green-50)' : 'transparent',
                        color: selectedCat === (cat.slug || 'all') ? 'var(--green-800)' : 'var(--text-muted)',
                        cursor: 'pointer', fontWeight: selectedCat === (cat.slug || 'all') ? 700 : 500,
                        fontSize: '13.5px', transition: 'all 0.15s', borderLeft: `2px solid ${selectedCat === (cat.slug || 'all') ? 'var(--green-600)' : 'transparent'}`,
                      }}
                    >{cat.name}</button>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Max Price: ${priceMax.toLocaleString('en-US')}
                </h4>
                <input
                  type="range" min={5} max={100} step={5} value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--green-600)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-light)', marginTop: '6px' }}>
                  <span>$5</span><span>$100</span>
                </div>
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading catalog...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--beige-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Search size={22} color="var(--text-light)" />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>No products match your criteria</p>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', fontWeight: 500 }}>
                  {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '24px' }}>
                  {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .shop-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default Shop;
