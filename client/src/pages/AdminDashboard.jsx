import { useNavigate } from 'react-router-dom';
import { clearTokens } from '../utils/auth';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-teal-900 p-8">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">Admin Dashboard </h1>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500/20 text-red-200 font-bold rounded-xl hover:bg-red-500/40 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-emerald-300 mb-2">Manage Members</h2>
            <p className="text-emerald-100/70">View and edit registered student details.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-teal-300 mb-2">Create Event</h2>
            <p className="text-teal-100/70">Schedule a new club activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}