import { useNavigate } from 'react-router-dom';
import { clearTokens } from '../utils/auth';

export default function MemberDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-8">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/50">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-emerald-800">Member Dashboard </h1>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h2 className="text-xl font-bold text-emerald-700 mb-2">Upcoming Events</h2>
            <p className="text-emerald-600/80">Campus Cleanup - This Friday at 4 PM</p>
          </div>
          <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100">
            <h2 className="text-xl font-bold text-teal-700 mb-2">My Contributions</h2>
            <p className="text-teal-600/80">You have attended 0 events so far.</p>
          </div>
        </div>
      </div>
    </div>
  );
}