import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, Mail, User, Phone, Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  const { user, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate(redirect); }, [user]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isLogin) await login(formData.email, formData.password);
      else await register(formData.fullName, formData.email, formData.password, formData.phone);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setError(''); setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally { setLoading(false); }
  };

  const loadQuick = (email, password) => {
    setFormData({ fullName: email === 'admin@gmail.com' ? 'System Admin' : 'John Doe', email, phone: '9999999999', password });
    setIsLogin(true); setError('');
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '85vh', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '460px' }}>

        {/* Logo mark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', background: 'var(--green-800)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(13,34,24,0.2)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.5 2 5 5 5 9C5 13 8 15.5 12 22C16 15.5 19 13 19 9C19 5 15.5 2 12 2Z" fill="white" opacity="0.9"/>
            </svg>
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '36px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--beige-100)', borderRadius: '12px', padding: '4px', marginBottom: '28px', gap: '4px' }}>
            {[
              { label: 'Sign In', value: true },
              { label: 'Create Account', value: false },
            ].map(tab => (
              <button
                key={tab.label}
                onClick={() => { setIsLogin(tab.value); setError(''); }}
                style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                  borderRadius: '9px', fontSize: '14px', fontWeight: 600,
                  transition: 'all 0.2s',
                  background: isLogin === tab.value ? 'var(--white)' : 'transparent',
                  color: isLogin === tab.value ? 'var(--green-900)' : 'var(--text-muted)',
                  boxShadow: isLogin === tab.value ? 'var(--shadow-sm)' : 'none',
                }}
              >{tab.label}</button>
            ))}
          </div>

          <h2 style={{ fontSize: '21px', fontWeight: 600, textAlign: 'center', marginBottom: '24px', color: 'var(--green-900)' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <Shield size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {!isLogin && (
              <div>
                <label className="label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input type="text" name="fullName" className="input" style={{ paddingLeft: '42px' }} value={formData.fullName} onChange={handleChange} required placeholder="John Doe" />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input type="email" name="email" className="input" style={{ paddingLeft: '42px' }} value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="label">Phone Number <span style={{ textTransform: 'none', fontSize: '11px', color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span></label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input type="tel" name="phone" className="input" style={{ paddingLeft: '42px' }} value={formData.phone} onChange={handleChange} placeholder="+91 9000000000" />
                </div>
              </div>
            )}

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" className="input" style={{ paddingLeft: '42px', paddingRight: '44px' }} value={formData.password} onChange={handleChange} required placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', borderRadius: '12px', padding: '14px', marginTop: '8px', fontSize: '15px' }}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--beige-200)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--beige-200)' }} />
          </div>

          <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="btn-outline" style={{ width: '100%', borderRadius: '12px', padding: '13px', justifyContent: 'center', gap: '10px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', display: 'inline-grid', placeItems: 'center', border: '1px solid var(--beige-300)', fontWeight: 800, fontSize: '12px', color: '#4285f4', background: 'white' }}>G</span>
            Continue with Google
          </button>

          {/* Demo Credentials */}
          {isLogin && (
            <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--beige-200)' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', marginBottom: '12px' }}>
                Demo Access
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Customer Account', email: 'customer@gmail.com', icon: User },
                  { label: 'Admin Account', email: 'admin@gmail.com', icon: Shield },
                ].map(({ label, email, icon: Icon }) => (
                  <button
                    key={email}
                    onClick={() => loadQuick(email, 'password1234')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 16px', borderRadius: '10px',
                      border: '1px solid var(--beige-200)', background: 'var(--white)',
                      fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-300)'; e.currentTarget.style.background = 'var(--green-50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--beige-200)'; e.currentTarget.style.background = 'var(--white)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={13} color="var(--green-700)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{label}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{email}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--green-700)' }}>Use →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
