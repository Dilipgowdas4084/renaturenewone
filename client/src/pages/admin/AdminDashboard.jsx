import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, ClipboardList, UserCheck, 
  UserX, CheckCircle, Award, Plus, ArrowRight 
} from 'lucide-react';
import api from '../../utils/api';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);
        
        // Fetch recent registrations (placeholder for actual API if available, 
        // otherwise we just mock or rely on another endpoint)
        try {
          const recentRes = await api.get('/registrations', { params: { limit: 5, sort: 'desc' } });
          setRecentRegistrations(recentRes.data.data || recentRes.data || []);
        } catch (err) {
          console.error("Failed to fetch recent registrations", err);
          // It's okay if this fails, we just won't show them
          setRecentRegistrations([]);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading dashboard..." />;
  if (error) return <div className="text-red-400 p-6 bg-red-500/10 rounded-2xl border border-red-500/20">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-stone-400">Welcome to the Renature admin overview.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/admin/events" 
            className="px-4 py-2 border border-white/[0.08] hover:border-stone-500 text-stone-300 rounded-xl transition-all duration-300"
          >
            View Events
          </Link>
          <Link 
            to="/admin/events/new" 
            className="flex items-center gap-2 px-4 py-2 bg-[#86efac] hover:bg-[#a7f3d0] text-black font-semibold rounded-xl transition-all duration-300"
          >
            <Plus size={18} /> Create Event
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Events" 
            value={stats.total_events || 0} 
            icon={<Calendar size={24} className="text-[#86efac]" />} 
          />
          <StatCard 
            title="Upcoming Events" 
            value={stats.upcoming_events || 0} 
            icon={<Clock size={24} className="text-blue-400" />} 
          />
          <StatCard 
            title="Total Registrations" 
            value={stats.total_registrations || 0} 
            icon={<ClipboardList size={24} className="text-[#86efac]" />} 
          />
          <StatCard 
            title="Accepted" 
            value={stats.accepted_participants || 0} 
            icon={<UserCheck size={24} className="text-[#86efac]" />} 
          />
          <StatCard 
            title="Pending" 
            value={stats.pending_participants || 0} 
            icon={<Clock size={24} className="text-amber-400" />} 
          />
          <StatCard 
            title="Rejected" 
            value={stats.rejected_participants || 0} 
            icon={<UserX size={24} className="text-red-400" />} 
          />
          <StatCard 
            title="Total Present" 
            value={stats.total_present || 0} 
            icon={<CheckCircle size={24} className="text-[#86efac]" />} 
          />
          <StatCard 
            title="Points Awarded" 
            value={stats.total_points_awarded || 0} 
            icon={<Award size={24} className="text-blue-400" />} 
          />
        </div>
      )}

      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Recent Registrations</h2>
          <Link to="/admin/events" className="text-sm text-[#86efac] hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        
        {recentRegistrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] text-stone-400 text-sm">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Event</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 text-stone-200">{reg.full_name}</td>
                    <td className="py-3 px-4 text-stone-300">{reg.event_title || 'N/A'}</td>
                    <td className="py-3 px-4 text-stone-400">{new Date(reg.registered_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        reg.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                        reg.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {reg.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-stone-400">
            No recent registrations found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
