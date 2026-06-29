import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BadgeCheck, Headphones, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProducts } from '../lib/firestoreService';

const heroImage = 'https://i.ibb.co/x8XLvzSZ/upscalemedia-transformed.png';

const categories = [
  {
    title: 'Sexual Health',
    to: '/shop?category=sexual-health',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLsvFiPBnaRt0MrQ34iEJ9xjstdIH1TCFOum1nQrViM4aD3O9u4oExEdqUuSbU0pojkzQPNpaczFUpWuncoLUwtCgjz7EGJ3dFLqdJ2g2pcqLkKGZSYuKnTnZw_sWLBYgR4d4-mB8QZz0cH8ntsD4U7kzfk9LHrz-4pZMCTj9-D2bUbKqkUb_UXYCEN0lBpEFGbe32mN9cK-UyqlLWfx_xqDcl9hUpAYb-s1DqSSR7xHNif8WdaX6UOQtg',
  },
  {
    title: 'Hair Care',
    to: '/shop?category=hair-loss',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLv2rmJS1ysNnm1Dn1z5Q73EQIrBcF0PZSp13rapeKcVu_f2jkh1iXwcixdfGqEgFjv3SZa4_8ybBkBldZ9hpudvnvo6vkng6PwrvJctWDnlYMcVR83J9Yh_cR-bv712oWfTg3XmqXzH8DbBQ6hEpGmCPBEMqAti7Q8VgwhMElDLuXFOqhw_4t4rODQBw49emfFV3uDjOB4ZIrDRi3LaC94mSC_xy2KN8LB2T8UnE1aYYQZab5NuH47nfQ',
  },
  {
    title: 'Skin Care',
    to: '/shop?category=skin-care',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvciJwhALWOst8w1ZWkygyqurDAEPHqpEOkLpkMOvIWq_urPikedmbvVDSDzNfSfA9itkHFxu-nBW-IzKhhDEBJP8LQcA4dR-APa3Rv1FgEqUdKi1HrCkFR-_-ZCTKBd2zOjGYMxaTxLKOLzihglPUDL0Kp1hTk7z1nXm4QOF4Y4R0WLFpOMcnY2OY3kCGgfAys-i0t65Z4fH5EeQImmYme4lhJkfABtfWsFxh0xEO_9H_qpcblG2IR-ao',
  },
  {
    title: 'Muscle Growth',
    to: '/shop?category=muscle-growth',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvPNxWhB64a651xQcdQsGWcnRR3SB2bw3RsarNNOXijO1_lPoWap8OichUkRMlEZRzNZCjd4SeaIq3LibOvhTqW98a_PS_wsTo3NS5jnWM8iNejLeJLSe0Mj096ByWDCweh6h1Ur-VHBEytVZ6Vqx0jim_dLbwUPZOO4J9Gd8lAV3blyaXyqr54LA3DwzPnAJqGEjlvET5biz11RsKEtFrfHBElrT-fCW7VbE2o1lyR4nPv0nlOpnviwdc',
  },
];

const trustSignals = [
  { icon: Truck, label: 'Free Shipping on All Plans' },
  { icon: Headphones, label: 'Unlimited Follow-ups' },
  { icon: ShieldCheck, label: 'Clinical Authority' },
  { icon: BadgeCheck, label: 'FDA Cleared' },
];

const Home = () => {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await getProducts();
        const activeProducts = products.filter(product => product.active !== false);
        const featured = activeProducts.filter(product => product.featured);
        setFeaturedProducts((featured.length ? featured : activeProducts).slice(0, 8));
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
          <p>Elevate your routine with our premium collection of clinically backed wellness solutions.</p>
          <Link to="/shop" className="stitch-primary-button">Explore Collection</Link>
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

      <section className="stitch-section">
        <div className="container">
          <div className="stitch-section-heading">
            <h2>Featured Products</h2>
            <span />
            <p>Discover our most sought-after formulations, engineered for performance and precision.</p>
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
            <p className="stitch-products-empty">Featured products will appear here once products are added.</p>
          )}
        </div>
      </section>

      <section className="stitch-testimonial-band" aria-label="Customer testimonial">
        <div className="container">
          <div className="stitch-testimonial-content">
            <div className="stitch-testimonial-mark" aria-hidden="true">”</div>
            <blockquote>
              “The WellMan Co didn’t just give me supplements, they gave me a roadmap to peak performance without the clinical coldness.”
            </blockquote>
            <div className="stitch-testimonial-author">
              <span className="stitch-testimonial-avatar" aria-hidden="true">JD</span>
              <div>
                <strong>Jonathan D.</strong>
                <span>Verified Member since 2023</span>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default Home;
