import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router'; 
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

function LogIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  const {setUser}=useAuth()
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', formData,{
        withCredentials: true 
      }); 
    
      const userRole = response.data.role;
      setUser(response.data)
      
      if (userRole === 'user') {

        toast.success(response.data.message ||'Login successful', {
          duration: 700 // 1 seconde
        });
        setTimeout(() => {
          navigate('/projects');
        }, 800);
      } 
      else {

        toast.success(response.data.message ||'Login successful', {
          duration:700 
        });
        
        setTimeout(() => {
          navigate('/projects');
        }, 800);
      }

    }
     catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
          <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md bg-base-100 p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">Log In</h2>



        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input input-bordered input-primary w-full"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input input-bordered input-primary w-full"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn btn-primary w-full">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default LogIn;
