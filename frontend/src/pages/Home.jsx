import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Truck, Star, ChevronDown, ChevronUp,
  Activity, Microscope, Leaf, Zap, Award, Clock, Globe, ShoppingBag, Plus, Minus
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProducts } from '../lib/firestoreService';

const faqs = [
  { q: 'Are the products on Tatvalife genuine?', a: 'Yes. Every treatment is sourced from licensed manufacturers with full batch traceability and certified compliance. We enforce strict verification to ensure that every customer receives authentic, high-quality treatments.' },
  { q: 'How does the crypto payment process work?', a: 'Once your order details are verified by our administration team, you will receive a secure crypto checkout link. Pay directly from your wallet using Bitcoin, Ethereum, USDT, or USDC. Once confirmed on-chain, your order is instantly processed.' },
  { q: 'Do you ship worldwide?', a: 'Yes. We deliver to over 150 countries. All shipments are fully insured and shipped via global priority express carriers with active tracking numbers.' },
  { q: 'How are the products packaged?', a: 'All items are shipped in discreet, sturdy, unbranded packaging with no product names listed on the exterior to preserve your absolute privacy.' },
  { q: 'Do I need a doctor prescription?', a: 'No. All wellness, skin care, and performance products listed on our platform are available without a medical prescription.' },
  { q: 'What is your refund policy if delivery is delayed?', a: 'If your order is damaged, incorrect, or lost in transit, we offer a full refund or immediate replacement dispatch. Contact our customer care team to initiate your claim.' },
];

const testimonials = [
  {
    name: 'Marcus T.',
    role: 'Self-Care Advocate',
    rating: 5,
    text: 'I was skeptical about sourcing specialized hair loss and performance treatments online, but Tatvalife was incredibly professional. The verification process was straightforward, and the package arrived on time and completely discreet.',
  },
  {
    name: 'Daniel R.',
    role: 'Fitness Enthusiast',
    rating: 5,
    text: 'Finding a reliable source for muscle recovery and skin care products was tough until I found Tatvalife. The ordering process was simple, and shipping was incredibly fast.',
  },
  {
    name: 'Liam K.',
    role: 'Wellness Customer',
    rating: 5,
    text: 'Their customer support is world-class. They guided me through the crypto payment process, which went through instantly, and kept me updated at every step of the international shipping process.',
  },
];

const Home = () => {
  const { addItem } = useCart();
  const [openFaq, setOpenFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('best-sellers');
  const [loading, setLoading] = useState(true);

  // Fetch products for "Find your supplement" section
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products on home page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const stats = [
    { icon: Globe, value: '150+', label: 'Countries Served' },
    { icon: Award, value: 'Quality-Assured', label: 'Certified Sources' },
    { icon: Clock, value: '48-72h', label: 'Express Delivery' },
    { icon: ShieldCheck, value: '100%', label: 'Authenticity Guarantee' },
  ];

  const slides = [
    {
      tagline: 'FORMULATIONS',
      headlineFirst: 'Whole body health',
      headlineSecond: 'starts from within.',
      leftImg: 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=1200',
      rightImg: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200'
    },
    {
      tagline: 'SKIN RENEWAL',
      headlineFirst: 'Radiant skin texture',
      headlineSecond: 'starts with science.',
      leftImg: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=1200',
      rightImg: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200'
    },
    {
      tagline: 'VITALITY & FORCE',
      headlineFirst: 'Peak physical strength',
      headlineSecond: 'starts with purity.',
      leftImg: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200',
      rightImg: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200'
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, []);

  // Filter products by tab
  const getTabProducts = () => {
    if (activeTab === 'best-sellers') {
      return products.filter(p => p.featured).slice(0, 4);
    }
    // New arrivals: just slice the last 4 or any other products
    return products.slice().reverse().slice(0, 4);
  };

  const current = slides[currentSlide];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── High-Fidelity Hero Slider ── */}
      <section style={{ position: 'relative', height: '640px', background: 'var(--cream)', overflow: 'hidden' }}>
        {/* Slider Track */}
        <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
          {slides.map((slide, idx) => (
            <div 
              key={idx}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                gridTemplateColumns: '1.05fr 0.95fr',
                opacity: currentSlide === idx ? 1 : 0,
                transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                pointerEvents: currentSlide === idx ? 'all' : 'none',
                zIndex: currentSlide === idx ? 10 : 1
              }}
            >
              {/* Left Column: Hand & Product image with sand overlay */}
              <div style={{ position: 'relative', background: '#eae7e3', overflow: 'hidden' }}>
                <img 
                  src={slide.leftImg} 
                  alt="Wellness Formulation" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(234, 231, 227, 0.15)'
                }} />
              </div>

              {/* Right Column: Close-up Leaf ridges */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={slide.rightImg} 
                  alt="Natural Elements" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Overlaid Center Content */}
        <div 
          className="container"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{ width: '100%', pointerEvents: 'all', position: 'relative' }}>
            <div style={{ maxWidth: '600px', marginLeft: 'auto', marginRight: '64px', color: 'white' }}>
              
              <span style={{ 
                display: 'block', 
                fontSize: '11px', 
                fontWeight: 600, 
                letterSpacing: '0.2em', 
                marginBottom: '16px',
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase'
              }}>
                {current.tagline}
              </span>

              <h1 className="font-serif" style={{
                fontSize: 'clamp(38px, 5vw, 56px)',
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '32px',
                color: 'white'
              }}>
                {current.headlineFirst}<br />
                <span style={{ fontStyle: 'italic' }}>{current.headlineSecond}</span>
              </h1>

              <Link 
                to="/shop" 
                className="btn-primary" 
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'var(--cream)',
                  color: 'var(--green-900)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '12px 28px',
                  gap: '12px',
                  fontWeight: 600,
                  fontSize: '14.5px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                Shop Now
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--green-900)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <ArrowRight size={13} />
                </div>
              </Link>

            </div>
          </div>
        </div>

        {/* Overlaid Bottom Left UI: Pagination & Slider Controls */}
        <div 
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '80px',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            color: 'var(--green-900)'
          }}
        >
          {/* Slide Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green-900)' }}>
              0{currentSlide + 1}
            </span>
            <div style={{ width: '80px', height: '1.5px', background: 'rgba(13,34,24,0.15)', position: 'relative' }}>
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  height: '100%', 
                  background: 'var(--green-900)', 
                  width: `${((currentSlide + 1) / slides.length) * 100}%`,
                  transition: 'width 0.8s ease'
                }} 
              />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(13,34,24,0.4)' }}>
              0{slides.length}
            </span>
          </div>

          {/* Navigation Arrows */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={prevSlide}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: 'var(--green-900)',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                padding: '4px 8px'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
            >
              &lt;
            </button>
            <button 
              onClick={nextSlide}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: 'var(--green-900)',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                padding: '4px 8px'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
            >
              &gt;
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: 'var(--green-900)', padding: '32px 0' }}>
        <div className="container">
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} style={{
                background: 'var(--green-900)', padding: '24px 28px',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} color="var(--green-300)" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{value}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Find Your Supplement (Featured Products) ── */}
      <section style={{ background: 'var(--warm-white)', padding: '96px 0' }}>
        <div className="container">
          
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 48px)', fontWeight: 400, color: 'var(--green-900)', margin: 0 }}>
                Find your supplement
              </h2>
            </div>
            {/* Tabs Selector */}
            <div style={{ display: 'flex', background: 'var(--beige-100)', borderRadius: '9999px', padding: '4px' }}>
              <button 
                onClick={() => setActiveTab('best-sellers')}
                style={{
                  border: 'none',
                  background: activeTab === 'best-sellers' ? 'var(--white)' : 'transparent',
                  color: 'var(--text-dark)',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'best-sellers' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Best Sellers
              </button>
              <button 
                onClick={() => setActiveTab('new-arrivals')}
                style={{
                  border: 'none',
                  background: activeTab === 'new-arrivals' ? 'var(--white)' : 'transparent',
                  color: 'var(--text-dark)',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'new-arrivals' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                New Arrivals
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="treatments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {getTabProducts().map((product) => (
                <div key={product.id} className="wellina-product-card">
                  {/* Image Wrap */}
                  <div className="wellina-product-image-wrap">
                    <Link to={`/product/${product.slug}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={product.image_url || `https://picsum.photos/seed/${product.slug}/400/400`} 
                        alt={product.name}
                        onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/400/400`; }}
                      />
                    </Link>
                    {/* Sale or Best Seller badges */}
                    {product.featured && (
                      <span style={{
                        position: 'absolute', top: '16px', left: '16px',
                        background: 'var(--green-800)', color: 'white',
                        fontSize: '9.5px', fontWeight: 700, padding: '4px 10px',
                        borderRadius: '9999px', letterSpacing: '0.04em'
                      }}>
                        BEST SELLER
                      </span>
                    )}
                    {/* Add to Cart Floating Button */}
                    <button 
                      onClick={() => addItem(product)}
                      className="wellina-cart-btn-floating"
                      title="Add to Cart"
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                  {/* Details */}
                  <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      {product.categories?.name || 'Formulation'}
                    </span>
                    <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                        {product.name}
                      </h3>
                    </Link>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--green-800)' }}>
                      ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Formulations & Collections ── */}
      <section style={{ background: 'var(--cream)', padding: '96px 0 112px' }}>
        <div className="container">
          
          {/* Centered Heading */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green-700)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
              Formulations
            </span>
            <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 48px)', fontWeight: 400, color: 'var(--green-900)', margin: '0 0 16px' }}>
              Science-backed formulations
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15.5px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
              This simple yet powerful collection is here to support your long-term health and specialty wellness goals.
            </p>
          </div>

          {/* Grid Banners */}
          <div className="treatments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { to: '/shop?category=sexual-health', title: 'Sexual Health', subtitle: 'Intimacy & Vitality', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600' },
              { to: '/shop?category=hair-loss', title: 'Hair Loss', subtitle: 'Follicle Care', img: 'https://images.unsplash.com/photo-1626015276681-2b44f2890697?auto=format&fit=crop&q=80&w=600' },
              { to: '/shop?category=skin-care', title: 'Skin Care', subtitle: 'Skin Renewal', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600' },
              { to: '/shop?category=muscle-growth', title: 'Muscle Growth', subtitle: 'Physical Performance', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600' }
            ].map((col) => (
              <Link key={col.title} to={col.to} className="wellina-category-card">
                <img src={col.img} alt={col.title} />
                <div className="wellina-category-overlay" />
                <span className="wellina-category-pill">
                  {col.title}
                </span>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background: 'var(--green-950)', padding: '96px 0 112px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(32px, 4.2vw, 48px)', fontWeight: 500, color: 'white', margin: 0 }}>
              How it works
            </h2>
          </div>

          <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px', marginBottom: '64px' }}>
            {[
              { num: '01', title: 'Answer a few questions.', desc: 'Tell us about your health history, goals, and needs. Takes under 5 minutes.' },
              { num: '02', title: 'Connect with a provider.', desc: 'A certified partner pharmacy and verification team reviews your order to ensure safety and authenticity.' },
              { num: '03', title: 'Receive your treatment.', desc: 'Your order is securely dispensed and shipped directly to your door in unbranded packages.' },
            ].map(step => (
              <div key={step.num} style={{ borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: '24px' }}>
                <span className="font-serif" style={{ fontSize: '44px', fontWeight: 500, color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '16px', lineHeight: 1 }}>
                  {step.num}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'white', marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/shop" className="btn-primary btn-lg" style={{ background: 'var(--warm-white)', color: 'var(--green-900)', border: 'none' }}>
              Start your free visit
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ background: 'var(--cream)', padding: '96px 0', borderBottom: '1px solid var(--beige-200)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', justifyContent: 'center', marginBottom: '12px' }}>
              <Star size={13} fill="var(--green-600)" color="var(--green-600)" />
              <span style={{ color: 'var(--green-700)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reviews</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 500, color: 'var(--green-900)', margin: 0 }}>
              Real results, real people
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                background: 'var(--white)', border: '1px solid var(--beige-200)',
                borderRadius: '20px', padding: '32px',
                display: 'flex', flexDirection: 'column', gap: '20px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(t.rating)].map((_, idx) => <Star key={idx} size={14} fill="var(--green-600)" color="var(--green-600)" />)}
                </div>
                <p style={{ color: 'var(--text-dark)', fontSize: '14.5px', lineHeight: 1.65, fontStyle: 'italic', flex: 1, margin: 0 }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--beige-100)' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--green-700) 0%, var(--green-500) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '14px', color: 'white', flexShrink: 0,
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-dark)' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faqs" style={{ background: 'var(--warm-white)', padding: '96px 0' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 500, color: 'var(--green-900)', margin: 0 }}>
              Frequently asked questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: 'var(--white)', border: '1px solid',
                borderColor: openFaq === i ? 'var(--green-200)' : 'var(--beige-200)',
                borderRadius: '14px', overflow: 'hidden',
                boxShadow: openFaq === i ? 'var(--shadow-sm)' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '20px 24px',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '16px',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--green-900)', lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: openFaq === i ? 'var(--green-800)' : 'var(--beige-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}>
                    {openFaq === i
                      ? <ChevronUp size={15} color="white" />
                      : <ChevronDown size={15} color="var(--text-muted)" />
                    }
                  </div>
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: '0 24px 22px',
                    borderTop: '1px solid var(--beige-100)',
                    paddingTop: '18px',
                    color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: 1.65,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ background: 'var(--green-950)', padding: '96px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginBottom: '24px', padding: '6px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9999px' }}>
            <Leaf size={12} color="var(--green-300)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green-300)', letterSpacing: '0.04em' }}>Total Care. Totally Different.</span>
          </div>
          <h2 className="font-serif" style={{
            fontSize: 'clamp(32px, 4.5vw, 54px)', fontWeight: 500,
            color: 'white', marginBottom: '20px', lineHeight: 1.1, letterSpacing: '-0.02em',
          }}>
            Modern. Private. Secure.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '17px', marginBottom: '40px', maxWidth: '460px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Experience specialty wellness solutions sourced from licensed manufacturers and verified for your peace of mind.
          </p>
          <Link to="/shop" className="btn-primary btn-lg" style={{ background: 'var(--warm-white)', color: 'var(--green-900)', border: 'none' }}>
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .treatments-grid { grid-template-columns: 1fr 1fr 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .how-it-works-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .treatments-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 500px) {
          .treatments-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
