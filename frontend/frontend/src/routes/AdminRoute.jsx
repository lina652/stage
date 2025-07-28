// src/routes/AdminRoute.jsx
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user && user == null ) return <Navigate to="/login" replace />;

  if (!user) return <Navigate to="/AdminHome" replace />;


  if (user.role !== 'admin') return <Navigate to="/userhome" replace />;


  return <Outlet />;
};

export default AdminRoute;
