import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('nexabot_client');
    const token = localStorage.getItem('nexabot_token');
    if (saved && token) {
      setClient(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = (token, clientData) => {
    localStorage.setItem('nexabot_token', token);
    localStorage.setItem('nexabot_client', JSON.stringify(clientData));
    setClient(clientData);
    
  };

  const logout = () => {
    localStorage.removeItem('nexabot_token');
    localStorage.removeItem('nexabot_client');
    setClient(null);
  };

  return (
    <AuthContext.Provider value={{ client, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);