import Sidebar from '../components/Sidebar';

function AdminHome() {
  return (
    <div className="flex">
      <Sidebar role="admin" />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Welcome, Admin!</h1>
        {/* Admin content here */}
      </main>
    </div>
  );
}

export default AdminHome;
