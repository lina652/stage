import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import TaskDetailsModal from '../components/TaskDetailsModal';
import toast, { Toaster } from 'react-hot-toast';

const TYPE_OPTIONS = ['Story Image', 'Animated Story', 'Post', 'Reel', 'Landscape Video', 'Cover Photo'];
const STATUS_OPTIONS = ['To Do', 'In Progress', 'In Review', 'Approved', 'Rejected', 'Completed'];
const FREQUENCY_OPTIONS = ['daily', 'weekly', 'monthly'];

const TasksTable = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState({});
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dueDateFilter, setDueDateFilter] = useState("");

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    status: '',
    dueDate: '',
    users: [],
    isRecurring: false,
    recurrence: { frequency: '', interval: 1, endDate: '' },
  });

  const { user, loading } = useAuth();

  useEffect(() => {
    if (projectId) {
      const fetchAll = async () => {
        setIsLoading(true);
        try {
          await Promise.all([fetchProject(), fetchTasks(), fetchUsers()]);
        } catch (err) {
          console.error('Error loading data', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAll();
    }
  }, [projectId]);

  const fetchProject = async () => {
    const res = await axios.get(`http://localhost:5000/projects/get/${projectId}`);
    setProject(res.data);
  };

  const fetchTasks = async () => {
    const res = await axios.get(`http://localhost:5000/tasks/project/${projectId}`);
    const sorted = res.data.sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (a.status !== 'Completed' && b.status === 'Completed') return -1;
      return 0;
    });
    setTasks(sorted);
  };

  const fetchUsers = async () => {
    const res = await axios.get(`http://localhost:5000/users/read/${projectId}`);
    setUsers(res.data);
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
      recurrence: { frequency: '', interval: 1, endDate: '' },
    });
    setShowForm(true);
  };

  const handleEdit = (task) => {
    console.log('Editing task:', task);
    console.log('Task isRecurring:', task.isRecurring, typeof task.isRecurring);
    
    setFormData({
      ...task,
      users: task.users?.map((u) => (typeof u === 'object' ? u._id : u)) || [],
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      // Ensure proper boolean conversion
      isRecurring: task.isRecurring === true,
      recurrence: {
        frequency: task.recurrence?.frequency || '',
        interval: task.recurrence?.interval || 1,
        endDate: task.recurrence?.endDate?.split('T')[0] || '',
      },
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        project: projectId,
        users: user.role === 'admin' ? formData.users : [user._id],
        // Ensure boolean conversion
        isRecurring: Boolean(formData.isRecurring),
      };

      // Handle recurrence
      if (Boolean(formData.isRecurring)) {
        payload.recurrence = {
          frequency: formData.recurrence?.frequency || "daily",
          interval: parseInt(formData.recurrence?.interval, 10) || 1,
          endDate: formData.recurrence?.endDate || null,
        };
      } else {
        payload.recurrence = null;
      }

      console.log('Payload being sent:', JSON.stringify(payload, null, 2));

      const response = formData._id
        ? await axios.put(`http://localhost:5000/tasks/${formData._id}`, payload, {
            withCredentials: true,
          })
        : await axios.post(`http://localhost:5000/tasks/create/${projectId}`, payload, {
            withCredentials: true,
          });

      toast.success(response.data.message || "Task saved successfully");

      await fetchTasks();
      setShowForm(false);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.response?.data?.message || "Failed to submit task. Please try again.");
    }
  };

  const handleDelete = (taskId) => {
    toast.custom((t) => (
      <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col gap-3 w-72 border border-gray-200">
        <p className="text-sm font-medium text-gray-800">
          Are you sure you want to <strong>delete</strong> this task?
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
              toast.dismiss(t.id);
              try {
                await axios.delete(`http://localhost:5000/tasks/${taskId}`);
                setTasks((prev) => prev.filter((task) => task._id !== taskId));
                toast.success('Task deleted successfully');
              } catch (err) {
                console.error('Failed to delete task:', err);
                toast.error('Failed to delete task. Please try again.');
              }
            }}
            className="btn btn-sm btn-error"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/tasks/tasks/${taskId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const getUserNames = (taskUsers) => {
    if (!Array.isArray(taskUsers)) return 'No users assigned';
    return taskUsers
      .map((userId) => {
        const u = typeof userId === 'object' ? userId : users.find((x) => x._id === userId);
        return u?.name || u?.email;
      })
      .filter(Boolean)
      .join(', ') || 'No users assigned';
  };

  const handleCommentSubmit = async (text) => {
    if (!selectedTask) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/tasks/${selectedTask._id}/comments`,
        { text },
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      console.error('Comment submit failed:', err);
    }
  };

  const handleSeeMore = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    const matchesDueDate = !dueDateFilter || task.dueDate?.slice(0, 10) === dueDateFilter;
    return matchesStatus && matchesType && matchesDueDate;
  });

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      <Sidebar role="user" />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📋 Task Management</h1>
          <button className="btn btn-primary" onClick={handleCreate}>
            ➕ Add Task
          </button>
        </div>

        <div className="mb-4">
          <div>
            <strong>Project Name:</strong> {project.name || '...'}
          </div>
          <div>
            <strong>Project ID:</strong> {project.id || projectId}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-bordered"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select select-bordered"
          >
            <option value="all">All Types</option>
            <option value="Story Image">Story Image</option>
            <option value="Animated Story">Animated Story</option>
            <option value="Post">Post</option>
            <option value="Reel">Reel</option>
            <option value="Landscape Video">Landscape Video</option>
            <option value="Cover Photo">Cover Photo</option>
          </select>

          <input
            type="date"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            className="input input-bordered"
          />
        </div>

        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Created</th>
              <th>Users</th>
              {/* <th>Recurring</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => {
                const isCompleted = task.status === 'Completed';
                return (
                  <tr key={task._id} className={isCompleted ? 'opacity-60' : ''}>
                    <td className={isCompleted ? 'line-through' : ''}>{String(index + 1).padStart(4, '0')}</td>
                    <td className={isCompleted ? 'line-through' : ''}>{task.title}</td>
                    <td className={isCompleted ? 'line-through' : ''}>{task.description}</td>
                    <td className={isCompleted ? 'line-through' : ''}>
                      <select
                        value={task.status}
                        disabled={isCompleted}
                        className="select select-bordered select-sm w-full max-w-xs"
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={isCompleted ? 'line-through' : ''}>{task.dueDate?.split('T')[0]}</td>
                    <td className={isCompleted ? 'line-through' : ''}>{task.createdAt?.split('T')[0]}</td>
                    <td className={isCompleted ? 'line-through' : ''}>{getUserNames(task.users)}</td>
                    {/* <td className={isCompleted ? 'line-through' : ''}>
                      {task.isRecurring ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-ghost">No</span>
                      )}
                    </td> */}
                    <td className="flex flex-wrap gap-2 items-center">
                      <button className="btn btn-xs btn-info" onClick={() => handleSeeMore(task)}>
                        See More
                      </button>
                      {user.role === 'admin' && (
                        <>
                          <button
                            className="btn btn-xs btn-warning"
                            onClick={() => handleEdit(task)}
                            disabled={isCompleted}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-xs btn-error"
                            onClick={() => handleDelete(task._id)}
                            disabled={isCompleted}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                      {isCompleted && <span className="text-green-600 text-lg">✔️</span>}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-4">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Task details modal */}
        {showModal && selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => setShowModal(false)}
            onCommentSubmit={handleCommentSubmit}
          />
        )}

        {/* Task create/edit form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{formData._id ? 'Edit Task' : 'Create New Task'}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="label font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div>
                  <label className="label font-medium">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="textarea textarea-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label font-medium">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Select Type</option>
                    {TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label font-medium">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Select Status</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label font-medium">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="label font-medium">Assign Users</label>
                  <div className="max-h-48 overflow-y-auto border rounded p-2">
                    {users.map((u) => (
                      <label key={u._id} className="flex items-center gap-2 mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.users.includes(u._id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => {
                              const newUsers = checked
                                ? [...prev.users, u._id]
                                : prev.users.filter((id) => id !== u._id);
                              return { ...prev, users: newUsers };
                            });
                          }}
                          className="checkbox"
                        />
                        {u.name} ({u.email})
                      </label>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring === true}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        console.log('Checkbox changed:', isChecked);
                        setFormData({ 
                          ...formData, 
                          isRecurring: isChecked,
                          recurrence: isChecked ? formData.recurrence : { frequency: '', interval: 1, endDate: '' }
                        });
                      }}
                      className="checkbox"
                    />
                    <span className="ml-2 font-medium">
                      Recurring Task (Currently: {formData.isRecurring ? 'Yes' : 'No'})
                    </span>
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="col-span-2 pl-4 space-y-3 border-l-2 border-gray-300">
                    <div>
                      <label className="label font-medium">Frequency</label>
                      <select
                        value={formData.recurrence.frequency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrence: { ...formData.recurrence, frequency: e.target.value },
                          })
                        }
                        className="select select-bordered w-full"
                        required
                      >
                        <option value="">Select Frequency</option>
                        {FREQUENCY_OPTIONS.map((freq) => (
                          <option key={freq} value={freq}>
                            {freq}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label font-medium">Interval</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.recurrence.interval}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrence: {
                              ...formData.recurrence,
                              interval: e.target.value,
                            },
                          })
                        }
                        className="input input-bordered w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="label font-medium">End Date</label>
                      <input
                        type="date"
                        value={formData.recurrence.endDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrence: { ...formData.recurrence, endDate: e.target.value },
                          })
                        }
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="col-span-2 flex justify-end gap-2 pt-4">
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {formData._id ? 'Update Task' : 'Create Task'}
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