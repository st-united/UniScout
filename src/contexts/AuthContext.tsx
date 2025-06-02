import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('AuthProvider: Rendering');

  useEffect(() => {
    // Simulate fetching user data with mock data
    const mockUser: User = {
      id: 1,
      name: 'Mock User',
      email: 'mockuser@example.com',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate loading time if needed, then set user and loading to false
    // setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    // }, 1000);

    // Original backend fetching logic (commented out)
    // const token = localStorage.getItem('token');
    // if (token) {
    //   api.get('/auth/me')
    //     .then(response => {
    //       setUser(response.data);
    //     })
    //     .catch(() => {
    //       localStorage.removeItem('token');
    //     })
    //     .finally(() => {
    //       setLoading(false);
    //     });
    // } else {
    //   setLoading(false);
    // }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - set mock user
    const mockUser: User = {
      id: 1,
      name: 'Mock User',
      email: email,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(mockUser);
    // Simulate token storage
    // localStorage.setItem('token', 'mock-token');
  };

  const register = async (name: string, email: string, password: string) => {
     // Mock register - set mock user
     const mockUser: User = {
      id: Math.random(), // Simple mock ID
      name: name,
      email: email,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(mockUser);
    // Simulate token storage
    // localStorage.setItem('token', 'mock-token');
  };

  const logout = () => {
    // Mock logout
    localStorage.removeItem('token'); // Still clear any old token
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 