import React, { useState } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router';

const SignUp = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/auth/register', formData);
      setMessage(res.data.message); 
      navigate('/login'); 
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="w-full max-w-md bg-base-100 p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">Create Account</h2>

        {message && <p className="text-center mb-4 text-red-500">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
        
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="input input-bordered input-primary w-full"
            value={formData.name}
            onChange={handleChange}
            required
          />
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
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="">Select a role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="btn btn-primary w-full">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
