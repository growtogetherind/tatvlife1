import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { API_BASE } from '../lib/api';
import { auth, googleProvider, hasFirebaseConfig } from '../lib/firebase';

const AuthContext = createContext();

const readJsonResponse = async (res, fallbackMessage) => {
  const body = await res.text();
  let data = {};

  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      data = { error: body };
    }
  }

  if (!res.ok) {
    throw new Error(data.error || `${fallbackMessage} (${res.status})`);
  }

  return data;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tatvalife_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('tatvalife_token', token);
      fetchUserProfile(token);
    } else {
      localStorage.removeItem('tatvalife_token');
      localStorage.removeItem('tatvalife_user');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async (authToken) => {
    try {
      // Decode user data from JWT token (for demo purposes) or verify with server
      // Here, since the token encodes user info in the routes, we can parse it 
      // or retrieve the user object stored in localStorage on login.
      const savedUser = localStorage.getItem('tatvalife_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Fallback
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password, phone) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email, password, phone })
    });
    
    const data = await readJsonResponse(res, 'Registration failed');
    
    localStorage.setItem('tatvalife_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await readJsonResponse(res, 'Login failed');
    
    localStorage.setItem('tatvalife_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async () => {
    if (!hasFirebaseConfig || !auth || !googleProvider) {
      throw new Error('Firebase Google authentication is not configured. Add the VITE_FIREBASE_* settings first.');
    }

    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const data = await readJsonResponse(res, 'Google sign-in failed');

    localStorage.setItem('tatvalife_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    if (auth) {
      try { await firebaseSignOut(auth); } catch (error) { console.warn('Firebase sign-out failed:', error); }
    }
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
