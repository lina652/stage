import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router'; 
import LoadingSpinner from '../components/LoadingSpinner';
import toast, { Toaster } from 'react-hot-toast';

const ProjectsTable = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    users: [],

  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await fetchProjects();
      await fetchUsers();
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    const res = await axios.get('http://localhost:5000/projects/get', {
      withCredentials: true,
      params: { populate: 'users,tasks' },
    });
    setProjects(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/users/read', {
      withCredentials: true,
    });
    setUsers(res.data);
  };

  const handleEdit = (project) => {
    setTimeout(() => {
      setFormData({
        _id: project._id,
        name: project.name,
        client: project.client,
        users: project.users?.map((u) => u._id) || [],
      });
      setShowForm(true);
    }, 500); // simulate delay
  };



  const generateClientId = (lastId, client) => {
    const padded = (lastId + 1).toString().padStart(4, '0');
    const sanitizedClient = client.trim().replace(/\s+/g, '-'); // Supprime les espaces
    return `${padded}-${sanitizedClient}`;
  };
  const handleCreate = () => {
    setFormData({ name: '', client: '', users: [] ,id:""});
    setShowForm(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        id: generateClientId(projects.length, formData.client),
        name: formData.name,
        client: formData.client,
        users: Array.isArray(formData.users) ? formData.users : [],
      };

      if (formData._id) {
        const response = await axios.put(
          `http://localhost:5000/projects/${formData._id}`,
          payload,
          { withCredentials: true }
        );
        toast.success(response.data.message || 'Project updated successfully');
      } else {
        const response = await axios.post(
          'http://localhost:5000/projects/add',
          payload,
          { withCredentials: true }
        );
        toast.success(response.data.message || 'Project created successfully');
      }

      setShowForm(false);
      setFormData({ name: '', client: '', users: [] });
      await fetchProjects();
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Error creating project');
    }
    finally {
      setIsSubmitting(false);
    }
  };

 

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      <Sidebar role="admin" />
  
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            
            <LoadingSpinner />
          </div>
        ) : (
          <>
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
  
            {/* FORM MODAL */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h2 className="text-lg font-bold mb-4">
                    {formData._id ? 'Edit Project' : 'Create New Project'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="label">
                        <span className="label-text font-bold">
                          Project Name<span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Name"
                        className="input input-bordered w-full"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
  
                    {/* Client */}
                    <div>
                      <label className="label">
                        <span className="label-text font-bold">
                          Client Name<span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Client"
                        className="input input-bordered w-full"
                        value={formData.client}
                        onChange={(e) =>
                          setFormData({ ...formData, client: e.target.value })
                        }
                        required
                      />
                    </div>
  
                    {/* Users */}
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text font-bold">
                          Assign Users<span className="text-red-500">*</span>
                        </span>
                      </label>
                      <div className="form-control w-full max-h-60 h-48 p-3 overflow-y-auto bg-base-100 border border-base-300 rounded-md">
                        {users.map((user) => (
                          <label
                            key={user._id}
                            className="flex items-center gap-2 py-1 px-2 cursor-pointer"
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
                            {user.name}{' '}
                            <span className="text-gray-500 text-xs">
                              ({user.email})
                            </span>
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
                      <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={isSubmitting}>
                        {isSubmitting && <span className="loading loading-spinner loading-sm" />}
                        {formData._id ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
  
};

export default ProjectsTable;
