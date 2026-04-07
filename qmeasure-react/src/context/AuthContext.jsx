import React, { createContext, useContext, useState, useCallback } from 'react';
import { signIn as apiSignIn, signUp as apiSignUp, googleAuth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      token,
      email:        localStorage.getItem('email')        || '',
      fullName:     localStorage.getItem('fullName')     || 'User',
      role:         localStorage.getItem('role')         || 'User',
      authProvider: localStorage.getItem('authProvider') || 'Local',
      picture:      localStorage.getItem('picture')      || '',
    };
  });

  const persist = useCallback((data, provider = 'Local') => {
    localStorage.setItem('token',        data.token);
    localStorage.setItem('email',        data.email);
    localStorage.setItem('fullName',     data.fullName);
    localStorage.setItem('role',         data.role || 'User');
    localStorage.setItem('authProvider', provider);
    if (data.picture) localStorage.setItem('picture', data.picture);
    setUser({
      token:        data.token,
      email:        data.email,
      fullName:     data.fullName,
      role:         data.role || 'User',
      authProvider: provider,
      picture:      data.picture || '',
    });
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiSignIn(email, password);
    persist(res.data, 'Local');
    return res.data;
  }, [persist]);

  const register = useCallback(async (formData) => {
    const res = await apiSignUp(formData);
    return res.data;
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const res = await googleAuth(idToken);
    persist(res.data, 'Google');
    return res.data;
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
