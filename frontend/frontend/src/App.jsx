
import LogIn from './pages/LogIn'
import UserHome from './pages/UserHome'
import AdminHome from './pages/AdminHome'
import UsersTable from './pages/UsersTable'
import Projects from './pages/Projects'
import ProjectsTable from './pages/ProjectsTable'
import TasksTable from './pages/TasksTable'
import Tasks from './pages/Tasks.jsx'
import PrivateRoute from './routes/PrivateRoute'
import {BrowserRouter , Routes ,Route } from 'react-router'

import AdminRoute from './routes/AdminRoute';
import UserRoute from './routes/UserRoute';

function App() {
  
  return (
    <div data-theme="dracula">
      
      <BrowserRouter>
      <Routes>
      <Route path="/" element={<LogIn />} />
      <Route path="/login" element={<LogIn />} />
        <Route element={<PrivateRoute />}>
        
        <Route element={<AdminRoute />}>
          <Route path="/adminhome" element={<AdminHome />} />
          <Route path="/usersmanagement" element={<UsersTable />} />
          <Route path="/projectsmanagement" element={<ProjectsTable />} />
        </Route>


        <Route element={<UserRoute />}> 
        <Route path="/userhome" element={<UserHome />} />
        </Route>
        
        <Route path="/tasksmanagement/:projectId" element={<TasksTable />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Tasks />} />

      </Route>
    </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
