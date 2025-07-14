import React from 'react';
import { Link } from 'react-router';

const Sidebar = ({ role }) => {
  return (
    <div className="w-64 min-h-screen bg-base-200 p-6">
      <h2 className="text-xl font-bold mb-6 text-primary">Dashboard</h2>

      <ul className="menu space-y-2">
        <li>
          <Link to="/projects">📁 Projects</Link>
        </li>
        <li>
          <Link to="/tasks">✅ My Tasks</Link>
        </li>
        
      </ul>
        {role === 'admin' &&(
        
          <details className="menu-dropdown">
<summary className="menu  ml-4   px-1 pl-2  py-2 rounded-[0.50rem]  dark:hover:bg-neutral">
  🛠️ Administration
</summary>

              <ul className="menu ml-6  ">
                <li>
                  <Link to="/usersmanagement">👥 User Management</Link>
                </li>
                <li>
                  <Link to="/projectsmanagement">📋 Project Management</Link>
                </li>
              </ul>
            </details>
        
        
        )}

<ul className="menu space-y-2 ">
  <li className="mt-auto -mb-1.5">
    <Link to="/login">🚪 Log out</Link>
  </li>
</ul>

    </div>
  );
};

export default Sidebar;
