import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';

const navItems = [
  { label: 'Hair', to: '/shop?category=hair-loss' },
  { label: 'Skin', to: '/shop?category=skin-care' },
  { label: 'Sexual Health', to: '/shop?category=sexual-health' },
  { label: 'Muscle', to: '/shop?category=muscle-growth' },
];

const Navbar = () => {
  const { setIsCartOpen, cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (item) => {
    if (item.to.includes('?')) {
      return `${location.pathname}${location.search}` === item.to;
    }

    return location.pathname === item.to;
  };

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      event.preventDefault();
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="site-header">
        <div className="container site-nav-shell">
          <button
            type="button"
            className="site-icon-button site-menu-button"
            onClick={() => setIsMenuOpen(value => !value)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="site-brand" onClick={closeMenu}>
            <BrandLogo className="site-brand-logo" />
          </Link>

          <nav className="site-nav-links hidden-mobile" aria-label="Primary navigation">
            {navItems.map(item => (
              <Link
                key={item.label}
                to={item.to}
                className={`site-nav-link ${isActive(item) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-actions">
            <Link to="/shop" className="site-icon-button hidden-mobile" aria-label="Search products">
              <Search size={15} />
            </Link>

            {isAdmin && (
              <Link to="/admin" className="site-admin-link">
                <LayoutDashboard size={13} />
                <span className="hidden-mobile">Admin</span>
              </Link>
            )}

            {user ? (
              <div className="site-user-actions">
                <Link to="/dashboard" className="site-icon-button" title="Go to dashboard" aria-label="Go to dashboard">
                  <User size={15} />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Sign out"
                  className="site-icon-button site-icon-button-subtle"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="site-icon-button" aria-label="Sign in">
                <User size={16} />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
              className="site-icon-button site-cart-button"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="site-cart-count">{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="site-mobile-panel">
            <div className="container">
              <div className="site-mobile-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search wellness"
                  aria-label="Search wellness products"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  onKeyDown={handleSearchSubmit}
                />
              </div>

              <nav className="site-mobile-links" aria-label="Mobile navigation">
                {navItems.map(item => (
                  <Link key={item.label} to={item.to} onClick={closeMenu}>
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link to="/admin" onClick={closeMenu}>
                    Admin
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
