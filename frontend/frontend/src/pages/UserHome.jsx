import Sidebar from '../components/Sidebar';

function UserHome() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Welcome, User!</h1>
        {/* User content here */}
      </main>
    </div>
  );
}

export default UserHome;
