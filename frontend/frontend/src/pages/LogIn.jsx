import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router'; 

function LogIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', formData,{
        withCredentials: true 
      }); 
      setMessage(response.data.message);
      const userRole = response.data.role;

      if (userRole === 'user') {
        navigate('/userhome');
      } 
      else {
        navigate('/adminhome');
      }

    }
     catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="w-full max-w-md bg-base-100 p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">Log In</h2>

        {message && (
          <div className="text-center text-red-500 mb-2">{message}</div>
        )}

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
