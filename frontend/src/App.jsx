import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SEO from './components/SEO';

// Pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Blog = lazy(() => import('./pages/Blog'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const HealthSafetyDisclaimer = lazy(() => import('./pages/HealthSafetyDisclaimer'));

// Styles
import './styles/globals.css';

function LoadingScreen() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="spinner" aria-label="Loading content" />
    </div>
  );
}

function AppWrapper() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <SEO path={location.pathname} />
      {!isAdminRoute && <Navbar />}

      <main id="main-content" style={{ flexGrow: 1 }}>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/disclaimer" element={<HealthSafetyDisclaimer />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <CartDrawer />}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppWrapper />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
