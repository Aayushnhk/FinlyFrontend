import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  const login = (authData) => {
    setUser(authData.user);
    setToken(authData.token);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('authUser', JSON.stringify(authData.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // Do not navigate here. Let the Navbar handle navigation after the alert.
    // window.location.href = '/auth?mode=login';
  };

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'authToken') {
        setToken(localStorage.getItem('authToken') || null);
        setIsAuthenticated(!!localStorage.getItem('authToken'));
      }
      if (event.key === 'authUser') {
        const storedUser = localStorage.getItem('authUser');
        setUser(storedUser ? JSON.parse(storedUser) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && !user) {
      setToken(storedToken);
      axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
        withCredentials: true,
      })
      .then(response => {
        setUser(response.data);
        setIsAuthenticated(true);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      });
    } else if (!storedToken) {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};