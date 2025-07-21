import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

const Sidebar = () => {
  const { user, setUser } = useAuth(); 
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
      navigate('/login');
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };






  return (
    <div className="w-64 min-h-screen bg-base-200 p-6">
      <h2 className="text-xl font-bold mb-6 text-primary">Dashboard</h2>

      <ul className="menu space-y-2">
        
        <li><Link to="/projects">📁 Projects</Link></li>
        <li><Link to="/tasks">✅ My Tasks</Link></li>
      </ul>

      {user?.role === 'admin' ? (
        <details className="menu-dropdown">
          <summary className="menu ml-4 px-1 pl-2 py-2 rounded-[0.50rem] dark:hover:bg-neutral">
            🛠️ Administration
          </summary>
          <ul className="menu ml-6">
            <li><Link to="/usersmanagement">👥 User Management</Link></li>
            <li><Link to="/projectsmanagement">📋 Project Management</Link></li>
          </ul>
        </details>
      ):null}

      <ul className="menu space-y-2">
        <li className="mt-auto">
          <a onClick={handleLogout} className="cursor-pointer px-4 py-2 rounded hover:bg-base-300">
            🚪 Log out
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
