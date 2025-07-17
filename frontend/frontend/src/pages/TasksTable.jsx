import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
const TYPE_OPTIONS = [
  'Story Image',
  'Animated Story',
  'Post',
  'Reel',
  'Landscape Video',
  'Cover Photo',
];

const STATUS_OPTIONS = [
  'To Do',
  'In Progress',
  'In Review',
  'Approved',
  'Rejected',
  'Published',
];

const TasksTable = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState({});
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    status: '',
    dueDate: '',
    users: [],
  });
  const { user , loading } = useAuth();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  useEffect(() => {
      console.log(projectId)
    if (projectId) fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/projects/get/${projectId}`);
      setProject(res.data);
    } catch (err) {
      console.error('Error fetching project:', err);
      setProject({});
    }
  };

  const fetchTasks = async () => {
    const res = await axios.get(`http://localhost:5000/tasks/project/${projectId}`);

    setTasks(res.data);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/users/read/${projectId}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  }

  const handleCreate = () => {
    setFormData({
      title: '',
      type: '',
      status: '',
      dueDate: '',
      users: [],
    });
    setShowForm(true);
  };

  const handleEdit = (task) => {
    setFormData({
      ...task,
      users: task.users?.map(u => (typeof u === 'object' ? u._id : u)) || [],
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`http://localhost:5000/tasks/${formData._id}`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.post(
          `http://localhost:5000/tasks/create/${projectId}`,
          { ...formData, project: projectId },
          { withCredentials: true }
        );
      }
      fetchTasks();
      setShowForm(false);
    } catch (err) {
      console.error('Submit error:', err);
    }
  };



  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };

  const getUserNames = (users) => {
    if (Array.isArray(users) && users.length > 0) {
      return users
        .map(user => (typeof user === 'object' ? user.name || user.email : users.find(u => u._id === user)?.name))
        .filter(Boolean)
        .join(", ");
    }
    return "No users assigned";
  };
  
  return (
    <div className="flex min-h-screen">
      <Sidebar role="user" />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📋 Task Management</h1>
          <button className="btn btn-primary" onClick={handleCreate}>
            ➕ Add Task
          </button>
        </div>

        <div className="mb-4 space-y-1">
          <span className="text-lg">Project Name: <strong>{project.name}</strong></span>
          <br />
          <span className="text-lg">Project ID: <strong>{project.id}</strong></span>
        </div>

        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Created At</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <tr key={task._id}>
                  <td>{String(index + 1).padStart(4, '0')}</td>
                  <td>{task.title}</td>
                  <td>{task.type}</td>
                  <td>{task.status}</td>
                  <td>{task.dueDate?.split('T')[0]}</td>
                  <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                  <td>{getUserNames(task.users)}</td>
                  <td className="flex gap-2">
                  {user.role === 'admin' && (<button className="btn btn-sm btn-info" onClick={() => handleEdit(task)}>
                      ✏️ Edit
                    </button>)}
                    {user.role === 'admin' && ( <button className="btn btn-sm btn-error" onClick={() => handleDelete(task._id)}>
                      🗑️ Delete
                    </button>)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4">No tasks found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">
                {formData._id ? 'Edit Task' : 'Create New Task'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  className="input input-bordered w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />

                <textarea
                    placeholder="Description"
                    className="textarea textarea-bordered w-full"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    />

                <select
                  className="select select-bordered w-full"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="">Select Type</option>
                  {TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  className="select select-bordered w-full"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="">Select Status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  <button type="button" onClick={() => setShowForm(false)} className="btn">
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

export default TasksTable;

