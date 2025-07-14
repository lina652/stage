
import LogIn from './pages/LogIn'
import UserHome from './pages/UserHome'
import AdminHome from './pages/AdminHome'
import UsersTable from './pages/UsersTable'
import Projects from './pages/Projects'
import ProjectsTable from './pages/ProjectsTable'
import TasksTable from './pages/TasksTable'
import {BrowserRouter , Routes ,Route } from 'react-router'

function App() {
  
  return (
    <div data-theme="dracula">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LogIn />} /> 
          <Route path='/login' element={<LogIn />}></Route>
          <Route path='/userhome'  element={<UserHome />}></Route>
          <Route path='/adminhome'  element={<AdminHome />}></Route>
          <Route path='/usersmanagement'  element={<UsersTable />}></Route>
          <Route path='/projectsmanagement'  element={<ProjectsTable />}></Route>
          <Route path='/projects'  element={<Projects />}></Route>
          <Route path='/tasksmanagement/:projectId'  element={<TasksTable />}></Route>
          
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
