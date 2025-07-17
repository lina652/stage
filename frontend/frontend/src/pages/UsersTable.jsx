import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password:'', role:''  });


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/users/read');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const toggleActivation = async (id, currentState) => {
    const action = currentState ? 'inactivate' : 'reactivate';
    const confirmMsg = `Are you sure you want to ${action} this user?`;
  
    if (!window.confirm(confirmMsg)) return;
  
    try {
      await axios.put(
        `http://localhost:5000/users/${id}/activate`,
        { activate: !currentState },
        { withCredentials: true }
      );
  
      alert(`User successfully ${!currentState ? 'reactivated' : 'deactivated'}.`);
      fetchUsers();
    } catch (err) {
      console.error('Activation error:', err);
      alert(`Failed to ${action} user. Please try again.`);
    }
  };
  

  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email, role: user.role , password:user.password  });
    setShowForm(true);
  };

  const handleCreate = () => {
    setFormData({ name: '', email: ''  ,role: '' , password:''  });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`http://localhost:5000/users/${formData.id}`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role : formData.role,
        }, { withCredentials: true });
      } else {
        await axios.post(`http://localhost:5000/users/create`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role : formData.role,
        }, { withCredentials: true });
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="user" />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button className="btn btn-primary" onClick={handleCreate}>
            ➕ Create User
          </button>
        </div>

        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                
                <td>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td className="flex gap-2">
                  <button className="btn btn-sm btn-info" onClick={() => handleEdit(user)}>
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => toggleActivation(user._id, user.isActive)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">
                {formData.id ? 'Edit User' : 'Create New User'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
              
              <input
                  type="text"
                  placeholder="Name"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="email"
                  className="input input-bordered w-full"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Password"
                  className="input input-bordered w-full"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
               
                <select 
                  className="select select-bordered w-full"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {formData.id ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTable;
