import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BadgeCheck, Headphones, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProducts } from '../lib/firestoreService';

const heroImage = 'https://i.ibb.co/3yrBKmT8/hero.webp';

const categories = [
  {
    title: 'Sexual Health',
    to: '/shop?category=sexual-health',
    image: 'https://i.ibb.co/9BSbL4K/man.webp',
  },
  {
    title: 'Hair Care',
    to: '/shop?category=hair-loss',
    image: 'https://i.ibb.co/zqQDT7Q/hair.webp',
  },
  {
    title: 'Skin Care',
    to: '/shop?category=skin-care',
    image: 'https://i.ibb.co/VY6g4CKW/Skin.webp',
  },
  {
    title: 'Muscle Growth',
    to: '/shop?category=muscle-growth',
    image: 'https://i.ibb.co/Dfw4ZWch/grow.webp',
  },
];

const trustSignals = [
  { icon: BadgeCheck, label: 'Clinically Proven Products' },
  { icon: PackageCheck, label: 'Discreet Billing & Shipping' },
  { icon: Headphones, label: 'Reliable Customer Support' },
];

const featureHighlights = [
  { icon: Truck, title: 'Free Delivery Over $100', text: 'Orders above $100 qualify for complimentary delivery.' },
  { icon: BadgeCheck, title: 'Clinically Proven Products', text: 'Curated formulations selected for quality and performance.' },
  { icon: PackageCheck, title: 'Discreet Billing & Shipping', text: 'Plain packaging and privacy-minded order handling.' },
  { icon: Headphones, title: 'Reliable Customer Support', text: 'Helpful support for orders, product questions, and delivery.' },
];

const requestedFeaturedNames = [
  'Minoxidil + Finasteride Forte Dual Action Solution',
  'Tretinoin 0.05% Cream',
  'Sildenafil + Dapoxetine Oral Jelly (Super Kamagra Brand)',
  'Anavar (Oxandrolone)',
];

const uniqueProducts = (products) => {
  const seen = new Set();
  return products.filter(product => {
    if (!product?.id || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
};

const Home = () => {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await getProducts();
        const activeProducts = products.filter(product => product.active !== false);
        const requested = requestedFeaturedNames
          .map(name => activeProducts.find(product => product.name?.trim().toLowerCase() === name.toLowerCase()))
          .filter(Boolean);
        const adminFeatured = activeProducts.filter(product => product.featured);
        const featured = uniqueProducts([...requested, ...adminFeatured]).slice(0, 4);
        setFeaturedProducts(featured);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        setFeaturedProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="stitch-home">
      <section className="stitch-hero">
        <img src={heroImage} alt="The WellMan Co wellness hero" />
        <div className="stitch-hero-shade" />
        <div className="stitch-hero-content">
          <h1>Active Vitality</h1>
          <p>Maximize your performance and aesthetic appeal with our clinically proven solutions.</p>
          <div className="stitch-hero-actions">
            <Link to="/shop" className="stitch-primary-button">Explore Collection</Link>
            <p className="stitch-hero-note">Free Shipping on all orders above $100</p>
          </div>
        </div>
      </section>

      <section className="stitch-trust-bar" aria-label="Trust signals">
        <div className="stitch-trust-track">
          {[0, 1].map(group => (
            <div className="stitch-trust-group" aria-hidden={group === 1} key={group}>
              {trustSignals.map(({ icon: Icon, label }) => (
                <div className="stitch-trust-item" key={`${group}-${label}`}>
                  <Icon size={24} strokeWidth={1.8} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="stitch-section stitch-category-section">
        <div className="container">
          <div className="stitch-section-heading">
            <h2>Shop by Category</h2>
            <span />
          </div>

          <div className="stitch-category-grid">
            {categories.map(category => (
              <Link className="stitch-category-card" to={category.to} key={category.title}>
                <img src={category.image} alt={category.title} loading="lazy" decoding="async" />
                <div className="stitch-category-overlay" />
                <div className="stitch-category-copy">
                  <h3>{category.title}</h3>
                  <span>Explore</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="stitch-section">
        <div className="container">
          <div className="stitch-section-heading">
            <h2>Explore our clinically proven formulations to meet your vitality goals.</h2>
            <span />
          </div>

          {productsLoading ? (
            <p className="stitch-products-empty">Loading featured products...</p>
          ) : featuredProducts.length > 0 ? (
            <div className="stitch-products-grid">
              {featuredProducts.map(product => (
                <article className="stitch-product-card" key={product.id}>
                  <Link to={`/product/${product.slug}`} className="stitch-product-image">
                    <img
                      src={product.image_url || `https://picsum.photos/seed/${product.slug}/400/400`}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      onError={event => { event.currentTarget.src = `https://picsum.photos/seed/${product.id}/400/400`; }}
                    />
                  </Link>
                  <div className="stitch-product-body">
                    <h3>{product.name}</h3>
                    <p>${Number(product.price || 0).toFixed(2)}</p>
                    <button type="button" onClick={() => addItem(product)}>
                      <ShoppingBag size={15} />
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="stitch-products-empty">Requested featured products will appear here once they are available in the product database.</p>
          )}
        </div>
      </section>

      <section className="stitch-feature-icons" aria-label="Service highlights">
        <div className="container">
          <div className="stitch-feature-grid">
            {featureHighlights.map(({ icon: Icon, title, text }) => (
              <article className="stitch-feature-card" key={title}>
                <div className="stitch-feature-icon">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
