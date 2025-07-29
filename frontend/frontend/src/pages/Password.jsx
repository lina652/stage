import React, { useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';

const Password = () => {
  const { id } = useParams();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return toast.error("Password required");

    try {
      await axios.post(`http://localhost:5000/users/set-password/${id}`, { password });
      toast.success("Password set successfully! You can now log in.");
      setPassword('');
    } catch (err) {
      toast.error("Failed to set password");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Définir votre mot de passe</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          className="input input-bordered w-full mb-4"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-primary w-full">Valider</button>
      </form>
    </div>
  );
};

export default Password;
