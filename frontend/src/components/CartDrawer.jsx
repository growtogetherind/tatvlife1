import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShieldAlert, ArrowRight, Package } from 'lucide-react';

const CartDrawer = () => {
  const {
    cartItems, isCartOpen, setIsCartOpen,
    removeItem, updateQuantity, cartSubtotal, requiresPrescription,
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />

      <div className="cart-drawer">
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--beige-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px',
              background: 'var(--green-50)',
              borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--green-100)',
            }}>
              <Package size={16} color="var(--green-700)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
                Your Cart
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)' }}>
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} item{cartItems.reduce((acc, i) => acc + i.quantity, 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Prescription Notice */}
        {requiresPrescription && (
          <div style={{
            borderBottom: '1px solid var(--beige-200)',
            padding: '12px 24px',
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            background: 'var(--green-50)',
          }}>
            <ShieldAlert size={15} color="var(--green-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '12px', color: 'var(--green-800)', lineHeight: '1.5', margin: 0 }}>
              <strong>Prescription required</strong> — One or more items in your cart require a valid prescription at checkout.
            </p>
          </div>
        )}

        {/* Items */}
        <div style={{
          flexGrow: 1, overflowY: 'auto', padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              textAlign: 'center', margin: 'auto 0', padding: '48px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: 'var(--beige-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Package size={24} color="var(--text-light)" />
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Your cart is empty</p>
              <button
                onClick={() => { setIsCartOpen(false); navigate('/shop'); }}
                className="btn-primary btn-sm"
              >Browse Catalog</button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product.id} style={{
                display: 'flex', gap: '14px', alignItems: 'flex-start',
                paddingBottom: '16px', borderBottom: '1px solid var(--beige-100)',
              }}>
                <img
                  src={item.product.image_url || `https://picsum.photos/seed/${item.product.slug}/80/80`}
                  alt={item.product.name}
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', background: 'var(--beige-100)', flexShrink: 0 }}
                  onError={e => { e.target.src = `https://picsum.photos/seed/${item.product.id}/80/80`; }}
                />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '3px', lineHeight: '1.3' }}>
                    {item.product.name}
                  </h4>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green-800)', marginBottom: '10px' }}>
                    ${item.product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'var(--beige-100)', borderRadius: '9999px', padding: '3px',
                    }}>
                      <button className="qty-btn" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <Minus size={11} />
                      </button>
                      <span style={{ fontSize: '13px', fontWeight: 700, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-light)', transition: 'color 0.15s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-light)'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '20px 24px', borderTop: '1px solid var(--beige-200)',
            background: 'var(--warm-white)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: '16px',
            }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Subtotal</span>
              <strong style={{ fontSize: '18px', color: 'var(--green-900)', letterSpacing: '-0.02em' }}>
                ${cartSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <button
              onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
              className="btn-primary"
              style={{ width: '100%', borderRadius: '12px', padding: '14px', gap: '8px' }}
            >
              Proceed to Checkout
              <ArrowRight size={15} />
            </button>
            <p style={{ textAlign: 'center', fontSize: '11.5px', color: 'var(--text-light)', marginTop: '10px' }}>
              Insured delivery included
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
