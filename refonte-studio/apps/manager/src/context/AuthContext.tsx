import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import api from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  avatar?: string;
  blogTheme?: string;
  hasBlog?: boolean;
  hasCarnet?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
const [user, setUser] = useState<User | null>(null);
const [token, setToken] = useState<string | null>(null);
const [loading, setLoading] = useState(true); // Commence à TRUE

useEffect(() => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (storedToken && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
    } catch (error) {
      console.error("Erreur parsing user", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  setLoading(false); // Passe à FALSE une fois fini
}, []);

// ... reste du code ...

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // CORRECTION: On utilise window.location au lieu de navigate
  const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        // MODIFICATION : On redirige vers la Landing Page (/) au lieu de /login
        window.location.href = '/';
    };

  const isAdmin = user?.isAdmin || false;

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
