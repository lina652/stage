import { Navigate, Outlet } from 'react-router';
import { useEffect, useState } from 'react';
import axios from 'axios';

const PrivateRoute = () => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get('http://localhost:5000/auth/check', { withCredentials: true });
        setIsAuth(true);
      } catch {
        setIsAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuth === null) return <div>Loading...</div>; // ou un spinner
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
