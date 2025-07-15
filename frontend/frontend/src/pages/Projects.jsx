import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import {Link} from 'react-router';


const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", client: "", user: "" });
  const [lastId, setLastId] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/projects/get');
      setProjects(res.data);

      if (res.data.length > 0) {
        const maxId = Math.max(...res.data.map(p => {
          const idNum = parseInt(p.id.split('-')[0]);
          return isNaN(idNum) ? 0 : idNum;
        }));
        setLastId(maxId);}


    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const generateClientId = (lastId) => {
    const number = lastId + 1;
    const padded = number.toString().padStart(4, '0');
    return `${padded}-Client`;
  };

  const handleCreate = () => {
    const newClientId = generateClientId(lastId);
    setLastId(lastId + 1);
    setFormData({ name: "", id: newClientId , client: "", user:[] });
    setShowForm(true);
    console.log("test")
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };// a voir pourquoi

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/projects/add',
        { 
          id: formData.id,
          name: formData.name,
          client: formData.client,
          user: formData.user,
        },
        { withCredentials: true }
      );
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      console.error('submit error:', err);
      alert('Error creating project. Please try again.');
    }
  };


  

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ name: "", client: "", user: "" });
  };




  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />

      <div className="flex-1 p-6">
        
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Projects</h1>
          <button className="btn btn-primary" onClick={handleCreate}>
            ➕ Create Project
          </button>
        </div>

        
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral p-6 rounded-lg shadow-xl w-96">
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
                    placeholder="Enter project name"
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
                    placeholder="Enter client name"
                    required
                  />
                </div>

                <div className="mb-4">
                <label className="block text-sm font-medium mb-2">User</label>
               <select
  name="user"
  value={formData.user || ""} // Gère le cas où formData.user est undefined
  onChange={handleInputChange}
  className="select select-bordered w-full"
  required
>
  <option value="" disabled>Select a user</option>
  <option value="1">John Doe</option>
  <option value="2">Jane Smith</option>
  <option value="3">Mohammed Ali</option>
  <option value="4">Sarah Johnson</option>
  <option value="5">David Wilson</option>
</select>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-outline btn-error "
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {projects.map((project, index) => (
            <div key={index} className="card bg-base-100 shadow-xl border border-gray-200">
              <div className="card-body">
                <h2 className="card-title text-lg font-semibold text-primary">
                  📁 {project.name}
                </h2>
                <p className="text-gray-">🆔 ID: {project.id}</p> 
                <p className="text-gray">👤 Client: {project.client}</p>
                <p className="text-gray">👤 Members: {project.user?.length || 0} members</p>
                <p className="text-gray">📋 Tasks: {project.task?.length || 0} tasks</p>
                <Link
                  to={`/tasksmanagement/${project._id}`}
                  className="btn btn-sm btn-info"
                >
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