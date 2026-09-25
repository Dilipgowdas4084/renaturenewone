import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, ClipboardList, UserCheck, 
  UserX, CheckCircle2, Award, Plus, ArrowRight, Sparkles,
  Users, XCircle, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const notify = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      
      try {
        const recentRes = await api.get('/registrations', { params: { limit: 10, sort: 'desc' } });
        setRecentRegistrations(recentRes.data.data || recentRes.data || []);
      } catch (err) {
        console.error("Failed to fetch recent registrations", err);
        setRecentRegistrations([]);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (regId, newStatus) => {
    try {
      await api.patch(`/registrations/${regId}/status`, { status: newStatus });
      notify('success', `Participant request marked as ${newStatus === 'accepted' ? 'Accepted' : 'Denied'}.`);
      setRecentRegistrations(prev => 
        prev.map(r => r.id === regId ? { ...r, status: newStatus } : r)
      );
      // Refresh stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to update registration status:', err);
      notify('error', 'Failed to update request status.');
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading admin intelligence..." />;
  if (error) return <div className="text-rose-400 p-6 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-sm">{error}</div>;

  const pendingRequests = recentRegistrations.filter(r => r.status === 'pending');

  return (
    <div className="space-y-8 max-w-7xl mx-auto selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Feedback Notification */}
      {feedback.message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="text-xs opacity-75 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Admin Console</h1>
          <p className="text-stone-400 text-xs sm:text-sm">Real-time telemetry, participant metrics & drive management.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/users" 
            className="px-4 py-2.5 border border-white/[0.08] hover:border-emerald-500/40 bg-white/[0.02] hover:bg-white/[0.05] text-stone-200 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5"
          >
            <Users size={15} className="text-emerald-400" />
            <span>User Directory</span>
          </Link>
          <Link 
            to="/admin/events" 
            className="px-4 py-2.5 border border-white/[0.08] hover:border-emerald-500/40 bg-white/[0.02] hover:bg-white/[0.05] text-stone-200 rounded-xl transition-all text-xs font-semibold"
          >
            Manage Events
          </Link>
          <Link 
            to="/admin/events/new" 
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02]"
          >
            <Plus size={16} /> Create Event
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link to="/admin/users" className="block transition-transform hover:scale-[1.02]">
            <StatCard 
              title="Registered Members" 
              value={stats.total_users || 0} 
              icon={<Users size={22} className="text-emerald-400" />} 
            />
          </Link>
          <StatCard 
            title="Total Events" 
            value={stats.total_events || 0} 
            icon={<Calendar size={22} className="text-emerald-400" />} 
          />
          <StatCard 
            title="Total Registrations" 
            value={stats.total_registrations || 0} 
            icon={<ClipboardList size={22} className="text-emerald-400" />} 
          />
          <StatCard 
            title="Accepted Stewards" 
            value={stats.accepted_participants || 0} 
            icon={<UserCheck size={22} className="text-emerald-300" />} 
          />
          <StatCard 
            title="Pending Review" 
            value={stats.pending_participants || 0} 
            icon={<Clock size={22} className="text-amber-400" />} 
          />
          <StatCard 
            title="Rejected / Denied" 
            value={stats.rejected_participants || 0} 
            icon={<UserX size={22} className="text-rose-400" />} 
          />
          <StatCard 
            title="Verified Attendees" 
            value={stats.total_present || 0} 
            icon={<CheckCircle2 size={22} className="text-emerald-400" />} 
          />
          <StatCard 
            title="Eco-Points Distributed" 
            value={stats.total_points_awarded || 0} 
            icon={<Award size={22} className="text-teal-400" />} 
          />
        </div>
      )}

      {/* Action Required: Pending Event Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-[#121c15] rounded-3xl border border-amber-500/30 p-6 backdrop-blur-xl shadow-xl shadow-black/30">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Action Required: Pending Event Attendance Requests
                </h2>
                <p className="text-amber-300/80 text-xs">
                  Review student requests to join expeditions and accept or deny access.
                </p>
              </div>
            </div>
            <Link to="/admin/events" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5">
              View All Drives <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(reg => (
              <div key={reg.id} className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white text-sm">{reg.full_name}</div>
                  <div className="text-emerald-400 text-xs font-medium">{reg.event_title}</div>
                  <div className="text-stone-400 text-[11px] font-mono mt-0.5">
                    {reg.student_id || reg.email} · {reg.department || 'General'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStatusChange(reg.id, 'accepted')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <CheckCircle2 size={13} />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(reg.id, 'rejected')}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                  >
                    <XCircle size={13} />
                    <span>Deny</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Registrations Table with Direct Actions */}
      <div className="bg-[#091a14]/70 rounded-3xl border border-white/[0.08] p-6 backdrop-blur-xl shadow-xl shadow-black/20">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Registrations</h2>
            <p className="text-stone-400 text-xs">Latest student signups awaiting field verification</p>
          </div>
          <Link to="/admin/events" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors">
            View All Events <ArrowRight size={14} />
          </Link>
        </div>
        
        {recentRegistrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] text-stone-400 text-xs uppercase tracking-wider bg-[#05110d]/60">
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Event</th>
                  <th className="py-3 px-4 font-semibold">Registered Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-stone-200 text-sm font-medium">
                      <div>{reg.full_name}</div>
                      <div className="text-stone-500 text-[11px] font-mono">{reg.student_id || reg.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 text-sm">{reg.event_title || 'Campus Drive'}</td>
                    <td className="py-3.5 px-4 text-stone-400 text-xs">{reg.registered_at ? new Date(reg.registered_at).toLocaleDateString() : '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        reg.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        reg.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {reg.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {reg.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusChange(reg.id, 'accepted')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(reg.id, 'rejected')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Deny
                          </button>
                        </div>
                      ) : (
                        <span className="text-stone-500 text-xs capitalize">{reg.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-stone-400 text-xs">
            No recent registrations recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

