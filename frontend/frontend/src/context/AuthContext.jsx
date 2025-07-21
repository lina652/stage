// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      // Stocke les infos utilisateur, y compris le rôle
  const [loading, setLoading] = useState(false); // Pour éviter un affichage prématuré

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.post('http://localhost:5000/auth/get', {}, {
          withCredentials: true,
        });
        
        setUser(res.data);
      } catch (err) {
        setUser(null); // Pas connecté ou erreur
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé
export const useAuth = () => useContext(AuthContext);
