import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Tasks = ({ id }) => {

  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();

  
  useEffect(() => {
    fetchTasks();
      }, []);

    const fetchTasks =async ()=>{
      try{ 

        
      
        const res = await axios.get(`http://localhost:5000/tasks/user/mytask`,  {withCredentials: true});
        console.log("Fetched tasks:", res.data);
      setTasks(res.data);}
     catch(err)
      {console.error("Failed to fetch tasks", err);}
      
    }
      
      
      return (
    <div className="flex min-h-screen">
      {user && <Sidebar />}
      
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">📝 My Tasks</h2>
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Project</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task, idx) => (
                <tr key={task._id}>
                  <td>{idx + 1}</td>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.status}</td>
                  <td>{task.dueDate?.split('T')[0]}</td>
                  <td>{task.project?.name || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No tasks assigned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tasks;
