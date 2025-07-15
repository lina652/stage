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
    users: [], 
    tasks: [] 
  });
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchAllUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/projects/get', {
        params: { populate: 'users,tasks' }
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/users/read');
      console.log(res.data)
      setAllUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      _id: project._id,
      name: project.name,
      client: project.client,
      users: [],
      tasks: project.tasks || []
    });
    setShowForm(true);
  };

  const handleCreate = () => {
    setFormData({ name: '', client: '', users: [], tasks: [] });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        users: Array.isArray(formData.users) ? formData.users : [],
        tasks: Array.isArray(formData.tasks) ? formData.tasks : []
      };

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
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Assign Users</span>
                  </label>
                  <select
                    multiple
                    className="select select-bordered h-auto min-h-[3rem]"
                    value={formData.users}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                      setFormData({...formData, users: selected});
                    }}
                  >
                    {allUsers.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
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