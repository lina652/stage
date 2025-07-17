import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router';

const ProjectsTable = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    
    name: '', 
    client: '', 
    users: [] 
    
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/projects/get', {
        withCredentials: true,
      }, {
        params: { populate: 'users,tasks' }
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users/read", {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }

  const handleEdit = (project) => {
    setFormData({
      _id: project._id,
      name: project.name,
      client: project.client,
      users: project.users?.map(u => u._id) || [],
      
    });
    setShowForm(true);
  };

  const handleCreate = () => {
    setFormData({ name: '', client: '', users: []});
    setShowForm(true);
  };

  const generateClientId = (lastId) => {
    const number = lastId + 1;
    const padded = number.toString().padStart(4, '0');
    return `${padded}-Client`;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id : generateClientId(projects.length),
        name: formData.name,
        client: formData.client,
        users: Array.isArray(formData.users) ? formData.users : [],
        
      };
      console.log('Submitting payload:', payload);

      if (formData._id) {
        await axios.put(`http://localhost:5000/projects/${formData._id}`, payload, { 
          withCredentials: true 
        });
      } else {
        await axios.post('http://localhost:5000/projects/add', payload, { 
          withCredentials: true 
        });
      }
      setShowForm(false);
      setFormData({ name: '', client: '', users: [] });
      fetchProjects();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Project Management</h1>
          <button className="btn btn-primary" onClick={handleCreate}>
            ➕ Create Project
          </button>
        </div>

        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Client</th>
              <th>Members</th>
              <th>Tasks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project._id}>
                <td>{String(index + 1).padStart(4, '0')}</td>
                <td>{project.name}</td>
                <td>{project.client}</td>
                <td>{project.users?.length || 0}</td>
                <td>{project.tasks?.length || 0}</td>
                <td className="flex gap-2">
                  <button 
                    className="btn btn-sm btn-info" 
                    onClick={() => handleEdit(project)}
                  >
                    ✏️ Edit
                  </button>
                  <Link 
                    to={`/tasksmanagement/${project._id}`}
                    className="btn btn-sm btn-success"
                  >
                    ✅ Tasks
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">
                {formData._id ? 'Edit Project' : 'Create New Project'}
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
                  placeholder="Client"
                  className="input input-bordered w-full"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  required
                />
                
                <div className=" form-control w-full">
  <label className="label">
    <span className="label-text font-medium">Assign Users</span>
  </label>
  <div className="input input-bordered w-full  text-white max-h-60 h-48 p-3 overflow-y-auto">
    {users.map((user) => (
      <label
        key={user._id}
        className="flex items-center gap-2 py-1 px-2  cursor-pointer text-sm"
      >
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          value={user._id}
          checked={formData.users.includes(user._id)}
          onChange={(e) => {
            const value = e.target.value;
            const updated = e.target.checked
              ? [...formData.users, value]
              : formData.users.filter((id) => id !== value);
            setFormData({ ...formData, users: updated });
          }}
        />
        {user.name} <span className="text-gray-500 text-xs">({user.email})</span>
      </label>
    ))}
  </div>
</div>


                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {formData._id ? 'Update' : 'Create'}
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

export default ProjectsTable;