import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import TaskDetailsModal from '../components/TaskDetailsModal';

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
  'Completed',
];

const FREQUENCY_OPTIONS = ['daily', 'weekly', 'monthly'];

const TasksTable = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState({});
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    status: '',
    dueDate: '',
    users: [],
    isRecurring: false,
    recurrence: {
      frequency: '',
      interval: 1,
      endDate: '',
    },
  });
  const { user, loading } = useAuth();

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchTasks();
      fetchUsers();
    }
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
    try {
      const res = await axios.get(`http://localhost:5000/tasks/project/${projectId}`);
      const sorted = res.data.sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return 0;
      });
      setTasks(sorted);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/users/read/${projectId}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      status: '',
      dueDate: '',
      users: [],
      isRecurring: false,
      recurrence: {
        frequency: '',
        interval: 1,
        endDate: '',
      },
    });
    setShowForm(true);
  };

  const handleEdit = (task) => {
    setFormData({
      ...task,
      users: task.users?.map(u => (typeof u === 'object' ? u._id : u)) || [],
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      isRecurring: task.isRecurring || false,
      recurrence: {
        frequency: task.recurrence?.frequency || '',
        interval: task.recurrence?.interval || 1,
        endDate: task.recurrence?.endDate ? task.recurrence.endDate.split('T')[0] : '',
      },
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
        const payload = {
          ...formData,
          project: projectId,
          users: user.role === 'admin' ? formData.users : [user._id],
        };
        await axios.post(`http://localhost:5000/tasks/create/${projectId}`, payload, { 
          withCredentials: true 
        });
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

  const getUserNames = (taskUsers) => {
    if (Array.isArray(taskUsers) && taskUsers.length > 0) {
      return taskUsers
        .map(user => {
          if (typeof user === 'object') {
            return user.name || user.email;
          } else {
            const foundUser = users.find(u => u._id === user);
            return foundUser?.name || foundUser?.email;
          }
        })
        .filter(Boolean)
        .join(", ");
    }
    return "No users assigned";
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/tasks/tasks/${taskId}/status`, {
        status: newStatus,
      }, {
        withCredentials: true,
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleCommentSubmit = async (commentText) => {
    if (!selectedTask) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/tasks/${selectedTask._id}/comments`,
        { text: commentText },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      console.error('Failed to submit comment:', error);
      throw error;
    }
  };

  const handleSeeMore = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

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
          <span className="text-lg">Project Name: <strong>{project.name || 'Loading...'}</strong></span><br />
          <span className="text-lg">Project ID: <strong>{project.id || projectId}</strong></span>
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
              <th>Users</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task, index) => {
                const isCompleted = task.status === 'Completed';
                return (
                  <tr key={task._id} className={isCompleted ? 'opacity-60' : ''}>
                    <td className={isCompleted ? 'line-through' : ''}>{String(index + 1).padStart(4, '0')}</td>
                    <td className={isCompleted ? 'line-through' : ''}>{task.title}</td>
                    <td className={isCompleted ? 'line-through' : ''}>{task.type}</td>
                    <td className={isCompleted ? 'line-through' : ''}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="select select-bordered select-sm w-full max-w-xs"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className={isCompleted ? 'line-through' : ''}>{task.dueDate?.split('T')[0]}</td>
                    <td className={isCompleted ? 'line-through' : ''}>{task.createdAt?.split('T')[0]}</td>
                    <td className={isCompleted ? 'line-through' : ''}>{getUserNames(task.users)}</td>
                    <td className="flex gap-2 items-center">
                      <button
                        className="btn btn-xs btn-info"
                        onClick={() => handleSeeMore(task)}
                      >
                        See More
                      </button>
                      {user.role === 'admin' && (
                        <button className="btn btn-xs btn-warning" onClick={() => handleEdit(task)}>
                          ✏️ Edit
                        </button>
                      )}
                      {user.role === 'admin' && (
                        <button className="btn btn-xs btn-error" onClick={() => handleDelete(task._id)}>
                          🗑️ Delete
                        </button>
                      )}
                      {isCompleted && <span className="text-green-600 text-lg">✔️</span>}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4">No tasks found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md overflow-auto max-h-[90vh]">
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

                {/* Recurring Task Section */}
                <div className="form-control">
                  <label className="cursor-pointer label flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({
                        ...formData,
                        isRecurring: e.target.checked,
                        recurrence: e.target.checked ? formData.recurrence : { frequency: '', interval: 1, endDate: '' }
                      })}
                    />
                    <span className="label-text font-medium">Is Recurring?</span>
                  </label>

                  {formData.isRecurring && (
                    <div className="space-y-2 mt-2">
                      <label className="label">
                        <span className="label-text">Frequency</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={formData.recurrence.frequency}
                        onChange={(e) => setFormData({
                          ...formData,
                          recurrence: {
                            ...formData.recurrence,
                            frequency: e.target.value,
                          }
                        })}
                        required
                      >
                        <option value="">Select Frequency</option>
                        {FREQUENCY_OPTIONS.map((freq) => (
                          <option key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</option>
                        ))}
                      </select>

                      <label className="label">
                        <span className="label-text">Interval (every n {formData.recurrence.frequency || 'days'})</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        className="input input-bordered w-full"
                        value={formData.recurrence.interval}
                        onChange={(e) => setFormData({
                          ...formData,
                          recurrence: {
                            ...formData.recurrence,
                            interval: parseInt(e.target.value, 10) || 1,
                          }
                        })}
                        required
                      />

                      <label className="label">
                        <span className="label-text">Recurrence End Date (optional)</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={formData.recurrence.endDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          recurrence: {
                            ...formData.recurrence,
                            endDate: e.target.value,
                          }
                        })}
                      />
                    </div>
                  )}
                </div>

                {/* Assign Users only for admin */}
                {user.role === 'admin' && (
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Assign Users</span>
                    </label>
                    <div className="input input-bordered w-full bg-base-100 max-h-60 h-48 p-3 overflow-y-auto">
                      {users.map((userData) => (
                        <label
                          key={userData._id}
                          className="flex items-center gap-2 py-1 px-2 cursor-pointer text-sm text-base-content"
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            value={userData._id}
                            checked={formData.users.includes(userData._id)}
                            onChange={(e) => {
                              const value = e.target.value;
                              const updated = e.target.checked
                                ? [...formData.users, value]
                                : formData.users.filter((id) => id !== value);
                              setFormData({ ...formData, users: updated });
                            }}
                          />
                          {userData.name} <span className="text-gray-500 text-xs">({userData.email})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

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

        {showModal && selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => setShowModal(false)}
            onCommentSubmit={handleCommentSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default TasksTable;