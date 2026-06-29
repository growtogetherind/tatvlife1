import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem('thewellmanco_cart') || '[]');
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('thewellmanco_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => () => {
    toastTimers.current.forEach(clearTimeout);
  }, []);

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    const timer = window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
    toastTimers.current.push(timer);
  };

  const addItem = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
    showToast(`${product.name} added to cart`);
    setIsCartOpen(true);
  };

  const removeItem = (productId) => {
    setCartItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCartItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const requiresPrescription = false;

  return (
    <CartContext.Provider value={{
      cartItems, isCartOpen, setIsCartOpen,
      addItem, removeItem, updateQuantity, clearCart,
      cartCount, cartSubtotal, requiresPrescription, toasts,
    }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            <CheckCircle size={15} color="var(--green-300)" />
            <span style={{ flex: 1 }}>{toast.message}</span>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
