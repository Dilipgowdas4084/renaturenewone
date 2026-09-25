import { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Award, Search, Plus, Edit3, Trash2, 
  CheckCircle2, XCircle, Clock, Sparkles, Phone, Mail, 
  Hash, Calendar, Filter, RefreshCw, Eye
} from 'lucide-react';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Biotechnology',
  'Civil Engineering',
  'Information Science',
  'Electrical & Electronics',
  'Environmental Sciences'
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [roleFilter, setRoleFilter] = useState('all');

  // Feedback Notification
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const notify = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  // Modal states
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [selectedUserForPoints, setSelectedUserForPoints] = useState(null);
  const [pointsValue, setPointsValue] = useState('');
  const [pointsReason, setPointsReason] = useState('Exemplary field action & stewardship');
  const [isSubmittingPoints, setIsSubmittingPoints] = useState(false);

  // Requests Modal
  const [requestsModalOpen, setRequestsModalOpen] = useState(false);
  const [selectedUserForRequests, setSelectedUserForRequests] = useState(null);

  // Edit User Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    email: '',
    usn: '',
    phone: '',
    department: 'Computer Science',
    year: '1st Year',
    role: 'member'
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Add User Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    usn: '',
    phone: '',
    department: 'Computer Science',
    year: '1st Year',
    role: 'member',
    password: 'Member@123'
  });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      notify('error', 'Failed to load member directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Event Request Status (Accept / Deny)
  const handleUpdateRegistrationStatus = async (regId, newStatus) => {
    try {
      await api.patch(`/registrations/${regId}/status`, { status: newStatus });
      notify('success', `Attendance request marked as ${newStatus === 'accepted' ? 'Accepted' : 'Denied'}.`);
      
      // Update local state for immediate feedback
      setUsers(prevUsers => 
        prevUsers.map(u => ({
          ...u,
          registrations: (u.registrations || []).map(r => 
            r.id === regId ? { ...r, status: newStatus } : r
          )
        }))
      );

      // Update in open modal if active
      if (selectedUserForRequests) {
        setSelectedUserForRequests(prev => ({
          ...prev,
          registrations: (prev.registrations || []).map(r => 
            r.id === regId ? { ...r, status: newStatus } : r
          )
        }));
      }
    } catch (err) {
      console.error('Error updating registration status:', err);
      notify('error', err.response?.data?.error || 'Failed to update request status.');
    }
  };

  // Handle Points Adjustment
  const handleSavePoints = async (e) => {
    e.preventDefault();
    if (!selectedUserForPoints) return;
    const pts = parseFloat(pointsValue);
    if (isNaN(pts)) {
      notify('error', 'Please enter a valid numeric points value.');
      return;
    }

    try {
      setIsSubmittingPoints(true);
      await api.post(`/admin/users/${selectedUserForPoints.id}/points`, {
        points: pts,
        reason: pointsReason
      });
      notify('success', `Updated points to ${pts} for ${selectedUserForPoints.name}!`);
      setPointsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Points error:', err);
      notify('error', err.response?.data?.error || 'Failed to update points.');
    } finally {
      setIsSubmittingPoints(false);
    }
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingEdit(true);
      await api.put(`/admin/users/${editFormData.id}`, editFormData);
      notify('success', `Profile details updated for ${editFormData.name}.`);
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Edit user error:', err);
      notify('error', err.response?.data?.error || 'Failed to update user profile.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Add Member Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.email) {
      notify('error', 'Full Name and College Email are required.');
      return;
    }

    try {
      setIsSubmittingAdd(true);
      await api.post('/admin/users', addFormData);
      notify('success', `New member ${addFormData.name} registered successfully!`);
      setAddModalOpen(false);
      setAddFormData({
        name: '',
        email: '',
        usn: '',
        phone: '',
        department: 'Computer Science',
        year: '1st Year',
        role: 'member',
        password: 'Member@123'
      });
      fetchUsers();
    } catch (err) {
      console.error('Add user error:', err);
      notify('error', err.response?.data?.error || 'Failed to create member account.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Delete Member
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}"? This will revoke access.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${id}`);
      notify('success', `Removed user ${name}.`);
      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
      notify('error', 'Failed to remove user.');
    }
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.usn && u.usn.toLowerCase().includes(term)) ||
      (u.phone && u.phone.toLowerCase().includes(term)) ||
      (u.department && u.department.toLowerCase().includes(term));

    const matchesDept = deptFilter === 'All Departments' || u.department === deptFilter;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  // Calculate metrics
  const totalMembers = users.filter(u => u.role === 'member').length;
  const activeStewards = users.filter(u => (u.total_points > 0 || u.events_count > 0)).length;
  const totalPointsDistributed = users.reduce((acc, curr) => acc + (parseFloat(curr.total_points) || 0), 0);
  const pendingRequestsCount = users.reduce((acc, u) => {
    const pending = (u.registrations || []).filter(r => r.status === 'pending').length;
    return acc + pending;
  }, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Feedback Banner */}
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            Member Directory & Stewardship Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Registered Members & Users
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Real-time directory of all registered students, USN credentials, eco-rewards points, and event attendance approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={16} />
            <span>Register New Member</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-[#091a14]/70 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span>REGISTERED STEWARDS</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalMembers}</div>
          <p className="text-stone-400 text-xs mt-1">Verified college student members</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#091a14]/70 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span>ACTIVE VOLUNTEERS</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{activeStewards}</div>
          <p className="text-stone-400 text-xs mt-1">Students with drives or points</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#091a14]/70 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span>TOTAL ECO-POINTS</span>
            <Award className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalPointsDistributed}</div>
          <p className="text-stone-400 text-xs mt-1">Total points credited to members</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#091a14]/70 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span>PENDING EVENT REQUESTS</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300">{pendingRequestsCount}</div>
          <p className="text-stone-400 text-xs mt-1">Awaiting admin acceptance</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#091a14]/50 p-4 rounded-2xl border border-white/[0.06]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search by name, USN, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-stone-200 text-xs placeholder:text-stone-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-stone-300 text-xs focus:outline-none focus:border-emerald-500/50"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d} className="bg-[#091a14]">{d}</option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-stone-300 text-xs focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all" className="bg-[#091a14]">All Roles</option>
            <option value="member" className="bg-[#091a14]">Member Only</option>
            <option value="admin" className="bg-[#091a14]">Admin</option>
          </select>

          <button
            onClick={fetchUsers}
            title="Refresh Directory"
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <LoadingSpinner message="Loading registered member directory..." />
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#091a14]/40 border border-white/[0.08]">
          <Users className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Members Found</h3>
          <p className="text-xs text-stone-400 mb-4">No student records match your active search or filters.</p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20"
          >
            Register a Member Directly
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-[#091a14]/60 overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-stone-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Member Steward</th>
                  <th className="px-5 py-3.5">USN & Contact</th>
                  <th className="px-5 py-3.5">Department / Year</th>
                  <th className="px-5 py-3.5 text-center">Account Role</th>
                  <th className="px-5 py-3.5 text-center">Eco-Points</th>
                  <th className="px-5 py-3.5 text-center">Event Requests</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map((user) => {
                  const regs = user.registrations || [];
                  const pendingCount = regs.filter(r => r.status === 'pending').length;
                  const acceptedCount = regs.filter(r => r.status === 'accepted').length;

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Name & Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                            {user.name ? user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                              {user.name}
                            </div>
                            <div className="text-stone-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                              <Mail size={12} className="text-stone-500" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* USN & Phone */}
                      <td className="px-5 py-4">
                        <div className="font-mono font-semibold text-emerald-400 uppercase tracking-wider text-xs">
                          {user.usn || 'No USN'}
                        </div>
                        <div className="text-stone-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-stone-500" />
                          <span>{user.phone || '—'}</span>
                        </div>
                      </td>

                      {/* Department & Year */}
                      <td className="px-5 py-4">
                        <div className="text-stone-200 font-medium">
                          {user.department || 'General'}
                        </div>
                        <div className="text-stone-400 text-[11px]">
                          {user.year || '1st Year'}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Eco-Points */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedUserForPoints(user);
                            setPointsValue(user.total_points || 0);
                            setPointsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-300 font-extrabold text-xs transition-all cursor-pointer"
                          title="Click to adjust eco-points"
                        >
                          <Sparkles size={12} />
                          <span>{user.total_points || 0} pts</span>
                        </button>
                      </td>

                      {/* Event Requests */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedUserForRequests(user);
                            setRequestsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-300 text-xs transition-all cursor-pointer"
                          title="View all event registration requests"
                        >
                          <Calendar size={13} className="text-emerald-400" />
                          <span>{regs.length} {regs.length === 1 ? 'drive' : 'drives'}</span>
                          {pendingCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" title={`${pendingCount} pending`} />
                          )}
                        </button>
                        {pendingCount > 0 && (
                          <div className="text-[10px] text-amber-300 font-semibold mt-1">
                            {pendingCount} Pending Approval
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Points Button */}
                          <button
                            onClick={() => {
                              setSelectedUserForPoints(user);
                              setPointsValue(user.total_points || 0);
                              setPointsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 transition-all cursor-pointer"
                            title="Manage / Award Points"
                          >
                            <Award size={14} />
                          </button>

                          {/* Event Requests Button */}
                          <button
                            onClick={() => {
                              setSelectedUserForRequests(user);
                              setRequestsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-300 hover:text-white transition-all cursor-pointer"
                            title="Review Event Attendance Requests"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setEditFormData({
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                usn: user.usn || '',
                                phone: user.phone || '',
                                department: user.department || 'Computer Science',
                                year: user.year || '1st Year',
                                role: user.role || 'member'
                              });
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-300 hover:text-white transition-all cursor-pointer"
                            title="Edit Member Details"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                            title="Remove Member"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: Adjust / Award Points ─── */}
      <Modal
        isOpen={pointsModalOpen}
        onClose={() => setPointsModalOpen(false)}
        title={`Adjust Eco-Points: ${selectedUserForPoints?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSavePoints} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-stone-300 space-y-1">
            <p><strong className="text-white">Student:</strong> {selectedUserForPoints?.name}</p>
            <p><strong className="text-white">USN:</strong> {selectedUserForPoints?.usn || 'Not assigned'}</p>
            <p><strong className="text-white">Current Total:</strong> <span className="text-emerald-400 font-bold">{selectedUserForPoints?.total_points || 0} pts</span></p>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Set New Eco-Points Balance</label>
            <input
              type="number"
              min="0"
              max="10000"
              value={pointsValue}
              onChange={(e) => setPointsValue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50 text-sm font-bold text-emerald-400"
              placeholder="e.g. 75"
              required
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Award Reason / Citation</label>
            <input
              type="text"
              value={pointsReason}
              onChange={(e) => setPointsReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              placeholder="e.g. Native sapling afforestation & soil preparation"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setPointsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingPoints}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold disabled:opacity-50"
            >
              {isSubmittingPoints ? 'Saving Points...' : 'Save Points'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: Review Event Attendance Requests ─── */}
      <Modal
        isOpen={requestsModalOpen}
        onClose={() => setRequestsModalOpen(false)}
        title={`Event Requests: ${selectedUserForRequests?.name}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-stone-300 flex justify-between items-center">
            <div>
              <p className="font-bold text-white text-sm">{selectedUserForRequests?.name}</p>
              <p className="text-stone-400">{selectedUserForRequests?.usn} · {selectedUserForRequests?.department}</p>
            </div>
            <div className="text-right">
              <span className="text-stone-400">Total Applications: </span>
              <span className="font-bold text-emerald-400">{selectedUserForRequests?.registrations?.length || 0}</span>
            </div>
          </div>

          {(!selectedUserForRequests?.registrations || selectedUserForRequests.registrations.length === 0) ? (
            <div className="py-8 text-center text-stone-400">
              No event registrations on file for this steward.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {selectedUserForRequests.registrations.map((reg) => (
                <div key={reg.id} className="p-4 rounded-xl bg-black/40 border border-white/[0.08] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="font-bold text-white text-sm mb-0.5">{reg.event_title}</div>
                    <div className="text-stone-400 text-[11px] font-mono">Ref: {reg.reference_id}</div>
                    <div className="text-stone-500 text-[11px] mt-0.5">
                      Requested on: {reg.registered_at ? new Date(reg.registered_at).toLocaleDateString() : '—'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      reg.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                      reg.status === 'rejected' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
                      'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {reg.status}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {reg.status !== 'accepted' && (
                        <button
                          onClick={() => handleUpdateRegistrationStatus(reg.id, 'accepted')}
                          className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          <span>Accept</span>
                        </button>
                      )}

                      {reg.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateRegistrationStatus(reg.id, 'rejected')}
                          className="px-3 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <XCircle size={13} />
                          <span>Deny</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-white/[0.08]">
            <button
              onClick={() => setRequestsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-stone-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 3: Edit Member Details ─── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Member Information"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-300 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">College Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">USN / Roll Number</label>
              <input
                type="text"
                value={editFormData.usn}
                onChange={(e) => setEditFormData({ ...editFormData, usn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Account Role</label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Department</label>
              <select
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics & Communication">Electronics & Comm.</option>
                <option value="Mechanical Engineering">Mechanical Eng.</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Information Science">Information Science</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Environmental Sciences">Environmental Sciences</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Academic Year</label>
              <select
                value={editFormData.year}
                onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold disabled:opacity-50"
            >
              {isSubmittingEdit ? 'Saving...' : 'Update Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 4: Add Member Directly ─── */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Student Member"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-300 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Priya Rai"
              value={addFormData.name}
              onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">College Email</label>
              <input
                type="email"
                placeholder="priya@nmamit.in"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">USN / Roll Number</label>
              <input
                type="text"
                placeholder="4NM23CS088"
                value={addFormData.usn}
                onChange={(e) => setAddFormData({ ...addFormData, usn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={addFormData.phone}
                onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Account Role</label>
              <select
                value={addFormData.role}
                onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Department</label>
              <select
                value={addFormData.department}
                onChange={(e) => setAddFormData({ ...addFormData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics & Communication">Electronics & Comm.</option>
                <option value="Mechanical Engineering">Mechanical Eng.</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Information Science">Information Science</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Environmental Sciences">Environmental Sciences</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Academic Year</label>
              <select
                value={addFormData.year}
                onChange={(e) => setAddFormData({ ...addFormData, year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Initial Password</label>
            <input
              type="text"
              value={addFormData.password}
              onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
            />
            <p className="text-[10px] text-stone-500 mt-1">Default password can be changed by user upon login.</p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingAdd}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold disabled:opacity-50"
            >
              {isSubmittingAdd ? 'Registering...' : 'Register Member'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
