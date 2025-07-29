import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner'; // Add your spinner component
import toast, { Toaster } from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [lastId, setLastId] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", client: "", users: [] });

  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchProjects(), fetchUsers()]);
    setIsLoading(false);
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/projects/get', {
        withCredentials: true,
      });
      setProjects(res.data);

      if (res.data.length > 0) {
        const maxId = Math.max(...res.data.map(p => {
          const idNum = parseInt(p.id?.split('-')[0]);
          return isNaN(idNum) ? 0 : idNum;
        }));
        setLastId(maxId);
      }
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
  };

  const generateClientId = (lastId) => {
    const padded = (lastId + 1).toString().padStart(4, '0');
    return `${padded}-Client`;
  };

  const handleCreate = () => {
    const newClientId = generateClientId(lastId);
    setLastId(lastId + 1);
    setFormData({ name: "", id: newClientId, client: "", users: [] });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/projects/add', {
        id: formData.id,
        name: formData.name,
        client: formData.client,
        users: formData.users,
      }, { withCredentials: true });

      setShowForm(false);
      toast.success(response.data.message ||'Project created successfully', 
        )
      await fetchProjects();
    } catch (err) {
      console.error('submit error:', err);
      toast.error(err.response?.data?.message || 'Error creating project');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ name: "", client: "", users: [] });
  };

  if (loading || isLoading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      {user && <Sidebar />}

      <div className="flex-1 p-6">
        
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Projects</h1>
            {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={handleCreate}>
              ➕ Create Project
            </button>)}
          </div>
        

        {/* Project Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
              <h2 className="text-xl font-bold mb-4">Create New Project</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Client</label>
                  <input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Assign Users</span>
                  </label>
                  <div className="input input-bordered w-full text-white max-h-60 h-48 p-3 overflow-y-auto">
                    {users.filter((user) => user.isActive === true).map((user) => (
                      <label key={user._id} className="flex items-center gap-2 py-1 text-sm">
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

                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={handleCancel} className="btn btn-outline btn-error">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {projects.map((project, index) => (
            <div key={index} className="card bg-base-100 shadow-xl border border-gray-200">
              <div className="card-body">
                <h2 className="card-title text-lg font-semibold text-primary">📁 {project.name}</h2>
                <p>🆔 ID: {project.id}</p>
                <p>👤 Client: {project.client}</p>
                <p>👥 Members: {project.users?.length || 0}</p>
                <p>📋 Tasks: {project.tasks?.length || 0}</p>
                <Link to={`/tasksmanagement/${project._id}`} className="btn btn-sm btn-info">
                  📋 View Tasks
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
