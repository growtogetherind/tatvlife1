import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, LogOut, LayoutDashboard, Zap, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { setIsCartOpen, cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path) => location.pathname === path;

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* Promo Bar */}
      <div className="promo-bar" style={{
        background: 'var(--green-950)',
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        padding: '9px 24px',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <Zap size={11} color="var(--green-300)" />
        <span>Free DHL Express Shipping on specialty orders over $250</span>
      </div>

      <header style={{
        background: 'var(--green-900)',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 20px rgba(5,20,9,0.15)',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          height: '76px',
          gap: '20px',
        }}>

          {/* Left: Navigation Menu */}
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }} className="hidden-mobile">
            <Link 
              to="/shop" 
              style={{
                color: 'white',
                fontSize: '13.5px',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                opacity: 0.9,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.9}
            >
              Shop <ChevronDown size={11} />
            </Link>
            
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span 
                style={{
                  color: 'white',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: 0.9,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.9}
              >
                Collections <ChevronDown size={11} />
              </span>
            </div>

            <Link 
              to="/shop?category=skin-care" 
              style={{
                color: 'white',
                fontSize: '13.5px',
                fontWeight: 500,
                textDecoration: 'none',
                opacity: 0.9,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.9}
            >
              Skin Care
            </Link>

            <Link 
              to="/shop?category=hair-loss" 
              style={{
                color: 'white',
                fontSize: '13.5px',
                fontWeight: 500,
                textDecoration: 'none',
                opacity: 0.9,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.9}
            >
              Hair Loss
            </Link>

            <Link 
              to="/blog" 
              style={{
                color: 'white',
                fontSize: '13.5px',
                fontWeight: 500,
                textDecoration: 'none',
                opacity: 0.9,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.9}
            >
              Blog
            </Link>
          </nav>

          {/* Centered: Logo */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '26px',
                fontWeight: 400,
                color: 'white',
                letterSpacing: '0.04em',
                textTransform: 'lowercase'
              }}>tatvalife</span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'flex-end' }}>
            
            {/* Search Input Bar */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className="hidden-mobile">
              <Search size={14} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
              <input 
                type="text" 
                placeholder="What are you looking for?" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  padding: '7px 16px 7px 34px',
                  color: 'white',
                  fontSize: '12.5px',
                  outline: 'none',
                  width: '180px',
                  transition: 'width 0.2s, background 0.2s, border-color 0.2s'
                }}
                onFocus={e => {
                  e.currentTarget.style.width = '220px';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onBlur={e => {
                  e.currentTarget.style.width = '180px';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              />
            </div>

            {/* Admin Dashboard Control */}
            {isAdmin && (
              <Link to="/admin" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: 'white', fontSize: '12.5px', fontWeight: 600,
                textDecoration: 'none', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '6px 14px', borderRadius: '9999px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <LayoutDashboard size={13} />
                <span className="hidden-mobile">Admin</span>
              </Link>
            )}

            {/* Profile / Sign-in */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/dashboard" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                title="Go to Dashboard"
                >
                  <User size={15} />
                </Link>
                <button
                  onClick={logout}
                  style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)',
                    cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link to="/login" style={{
                color: 'white', textDecoration: 'none', fontSize: '13.5px', fontWeight: 500,
                opacity: 0.9, transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.9}
              >Sign In</Link>
            )}

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                padding: '6px',
                transition: 'transform 0.2s',
                opacity: 0.9,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.opacity = 1; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = 0.9; }}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '0px', right: '0px',
                  background: '#22c55e', color: 'white',
                  fontSize: '9px', fontWeight: 700,
                  width: '15px', height: '15px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid var(--green-900)',
                  lineHeight: 1,
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
