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

      {user?.role === 'admin' && (
  <details className="group menu-dropdown mt-4 rounded-lg bg-base-100 shadow-md">
    <summary className="flex items-center justify-between cursor-pointer px-4 py-2 text-base  hover:bg-base-300 rounded-t-lg">
      <span>🛠️ Administration</span>
      <svg
        className="w-4 h-4 ml-2 transform transition-transform duration-300 group-open:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </summary>
    <ul className="menu px-4 py-2 space-y-2 bg-base-200 rounded-b-lg">
      <li>
        <Link
          to="/usersmanagement"
          className="block px-3 py-1.5 rounded hover:bg-primary hover:text-white transition"
        >
          👥 User Management
        </Link>
      </li>
      <li>
        <Link
          to="/projectsmanagement"
          className="block px-3 py-1.5 rounded hover:bg-primary hover:text-white transition"
        >
          📋 Project Management
        </Link>
      </li>
    </ul>
  </details>
)}


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
