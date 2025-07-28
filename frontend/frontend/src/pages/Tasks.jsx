import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import TaskDetailsModal from '../components/TaskDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner'; // Make sure this component exists

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // now used

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true); // start loading
    try {
      const response = await axios.get('http://localhost:5000/tasks/user/mytask', {
        withCredentials: true,
      });

      const sorted = response.data.sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return 0;
      });

      setTasks(sorted);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false); // end loading
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/tasks/${taskId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">📝 My Tasks</h2>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Project</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => {
                    const isCompleted = task.status === 'Completed';
                    return (
                      <tr key={task._id} className={isCompleted ? 'opacity-60' : ''}>
                        <td className={isCompleted ? 'line-through' : ''}>
                          {String(index + 1).padStart(4, '0')}
                        </td>
                        <td className={isCompleted ? 'line-through' : ''}>{task.title}</td>
                        <td className={isCompleted ? 'line-through' : ''}>{task.description}</td>
                        <td className={isCompleted ? 'line-through' : ''}>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className="select select-bordered select-sm w-full max-w-xs"
                            disabled={isCompleted}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="In Review">In Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className={isCompleted ? 'line-through' : ''}>
                          {task.dueDate?.split('T')[0]}
                        </td>
                        <td className={isCompleted ? 'line-through' : ''}>
                          {task.project?.name || 'N/A'}
                        </td>
                        <td className="flex gap-2 items-center">
                          <button
                            className="btn btn-xs btn-info"
                            onClick={() => handleSeeMore(task)}
                          >
                            See More
                          </button>
                          {isCompleted && <span className="text-green-600 text-lg">✔️</span>}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-4">
                      No tasks assigned yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
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

export default Tasks;
