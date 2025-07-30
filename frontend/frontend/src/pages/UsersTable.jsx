import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import toast, { Toaster } from 'react-hot-toast';


const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '',  role: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5000/users/read');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivation = async (id, currentState) => {
    const action = currentState ? 'deactivate' : 'reactivate';
  
    toast.custom((t) => (
      <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col gap-3 w-72 border border-gray-200">
        <p className="text-sm font-medium text-gray-800">
          Are you sure you want to <strong>{action}</strong> this user?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="btn btn-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id); // Dismiss the confirm toast
              try {
                const response = await axios.put(
                  `http://localhost:5000/users/${id}/activate`,
                  { activate: !currentState },
                  { withCredentials: true }
                );
                toast.success(response.data.message || `User successfully ${action}d.`);
                fetchUsers();
              } catch (err) {
                console.error('Activation error:', err);
                toast.error(err.response?.data?.message || `Failed to ${action} user. Please try again.`);
              }
            }}
            className="btn btn-sm btn-warning"
          >
            Confirm
          </button>
        </div>
      </div>
    ));
  };
  
  

  const handleEdit = (user) => {
    setFormData({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      
    });
    setShowForm(true);
  };

  const handleCreate = () => {
    setFormData({ name: '', email: '', role: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

if (!emailRegex.test(formData.email)) {
        toast.error("Email must be a valid address.");
        return;
      }
      

      const payload = {
        name: formData.name,
        email: formData.email,
        
        role: formData.role,
      };

      if (formData.id) {
        const response=await axios.put(`http://localhost:5000/users/${formData.id}`, payload, {
          withCredentials: true,
        });
                toast.success(response.data.message || "User updated successfully");
      } else {
        const response=await axios.post(`http://localhost:5000/users/create`, payload, {
          withCredentials: true,
        });
        toast.success(response.data.message || "User created successfully");
      }

      setShowForm(false);
      fetchUsers();
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message ||"Failed to submit User. Please try again.");
    }

    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
     <Toaster position="top-center" reverseOrder={false} />

      <Sidebar role="user" />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button className="btn btn-primary" onClick={handleCreate}>
            ➕ Create User
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
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
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

            <div className="bg-white p-6 rounded-lg w-full max-w-md">
            

              <h2 className="text-lg font-bold mb-4">
                {formData.id ? 'Edit User' : 'Create New User'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-bold">Name<span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    className="input input-bordered w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-bold">Email<span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="Email"
                    className="input input-bordered w-full"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-bold">Role<span className="text-red-500">*</span></span>
                  </label>
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
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={isSubmitting}>
                    {isSubmitting && <span className="loading loading-spinner loading-sm" />}
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
