// src/routes/UserRoute.jsx
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

const UserRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/UserHome" replace />;

  if (user.role !== 'user') return <Navigate to="/adminhome" replace />;

  return <Outlet />;
};

export default UserRoute;
