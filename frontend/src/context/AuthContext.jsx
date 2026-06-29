import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, hasFirebaseConfig } from '../lib/firebase';
import { getOrCreateUser, getUserDoc } from '../lib/firestoreService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let profile = await getUserDoc(firebaseUser.uid);
          if (!profile) {
            profile = await getOrCreateUser(firebaseUser);
          }
          setUser(profile);
        } catch {
          const profile = await getOrCreateUser(firebaseUser);
          setUser(profile || { id: firebaseUser.uid, email: firebaseUser.email, role: 'customer', full_name: firebaseUser.displayName || '' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (fullName, email, password, phone) => {
    if (!auth) {
      throw new Error('Authentication is currently unavailable.');
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const profile = await getOrCreateUser(credential.user, { full_name: fullName, phone });
    setUser(profile);
    return profile;
  };

  const login = async (email, password) => {
    if (!auth) {
      throw new Error('Authentication is currently unavailable.');
    }

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getOrCreateUser(credential.user);
    setUser(profile);
    return profile;
  };

  const loginWithGoogle = async () => {
    if (!hasFirebaseConfig || !auth || !googleProvider) {
      throw new Error('Firebase Google authentication is not configured.');
    }

    const result = await signInWithPopup(auth, googleProvider);
    const profile = await getOrCreateUser(result.user);
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('Sign-out error:', e);
      }
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        isAdmin: user?.role === 'admin',
        token: null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
