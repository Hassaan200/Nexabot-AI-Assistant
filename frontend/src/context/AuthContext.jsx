import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('Veloxa_client');
    const token = localStorage.getItem('Veloxa_token');
    if (saved && token) {
      setClient(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = (token, clientData) => {
    localStorage.setItem('Veloxa_token', token);
    localStorage.setItem('Veloxa_client', JSON.stringify(clientData));
    setClient(clientData);
    
  };

  const logout = () => {
    localStorage.removeItem('Veloxa_token');
    localStorage.removeItem('Veloxa_client');
    setClient(null);
  };

  return (
    <AuthContext.Provider value={{ client, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);