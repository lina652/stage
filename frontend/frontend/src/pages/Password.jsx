import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Password = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validLink, setValidLink] = useState(null); // null = loading, false = invalid, true = valid

  useEffect(() => {
    // Vérifie si le lien est valide
    const checkLink = async () => {
      try {
        await axios.get(`http://localhost:5000/users/validate-reset-token/${id}`);
        setValidLink(true);
      } catch {
        setValidLink(false);
      }
    };

    checkLink();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return toast.error("Password required");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/users/set-password/${id}`, { password });
      toast.success("Password set successfully! You can now log in.");
      setPassword('');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch {
      toast.error("Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  if (validLink === null) {
    return <div>Loading...</div>;
  }

  if (validLink === false) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl text-center">
        <h2 className="text-xl font-semibold mb-4">Link expired or invalid</h2>
        <p>This password reset link has expired or is invalid.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold mb-4">Set your password</h2>
      <form onSubmit={handleSubmit}>
        <label className="text-sm text-gray-600 mb-1 block">
          At least 6 characters!
        </label>
        <input
          type="password"
          className="input input-bordered w-full mb-4"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Valider'}
        </button>
      </form>
    </div>
  );
};

export default Password;
