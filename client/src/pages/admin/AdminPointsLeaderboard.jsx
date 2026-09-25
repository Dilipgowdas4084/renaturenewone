import { useState, useEffect } from 'react';
import { 
  Trophy, Award, Search, Edit3, Trash2, CheckCircle2, 
  Sparkles, UserPlus, Users, RefreshCw 
} from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';

export default function AdminPointsLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  
  // Award Points Modal / Panel State
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [awardData, setAwardData] = useState({
    student_id: '',
    full_name: '',
    email: '',
    department: 'Biotechnology',
    points: 25,
    reason: 'Campus Tree Plantation Drive Participation',
    event_id: '1'
  });
  const [isSubmittingAward, setIsSubmittingAward] = useState(false);

  // Edit Points Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    student_id: '',
    full_name: '',
    department: '',
    total_points: 0
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Add Member Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    full_name: '',
    student_id: '',
    department: 'Computer Science',
    total_points: 50
  });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Feedback Notification
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const notify = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lbRes, membersRes] = await Promise.all([
        api.get('/leaderboard'),
        api.get('/admin/members').catch(() => ({ data: [] }))
      ]);
      setLeaderboard(Array.isArray(lbRes.data) ? lbRes.data : []);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
    } catch (err) {
      console.error('Error fetching leaderboard/members:', err);
      notify('error', 'Failed to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Award Points
  const handleAwardSubmit = async (e) => {
    e.preventDefault();
    if (!awardData.points || (!awardData.student_id && !awardData.email)) {
      notify('error', 'Please provide a student identifier and points amount.');
      return;
    }

    try {
      setIsSubmittingAward(true);
      const res = await api.post('/admin/points/award', awardData);
      notify('success', res.data.message || `Awarded ${awardData.points} points successfully!`);
      setAwardModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Award error:', err);
      notify('error', err.response?.data?.error || 'Failed to award points.');
    } finally {
      setIsSubmittingAward(false);
    }
  };

  // Handle Edit Score
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingEdit(true);
      await api.put(`/admin/leaderboard/${editData.student_id}`, editData);
      notify('success', `Updated points for ${editData.full_name} successfully!`);
      setEditModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Edit error:', err);
      notify('error', err.response?.data?.error || 'Failed to update score.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Add Member
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newMemberData.full_name || !newMemberData.student_id) {
      notify('error', 'Full name and student ID are required.');
      return;
    }

    try {
      setIsSubmittingAdd(true);
      await api.post('/admin/leaderboard/entry', newMemberData);
      notify('success', `Added ${newMemberData.full_name} to the leaderboard!`);
      setAddModalOpen(false);
      setNewMemberData({
        full_name: '',
        student_id: '',
        department: 'Computer Science',
        total_points: 50
      });
      fetchData();
    } catch (err) {
      console.error('Add error:', err);
      notify('error', err.response?.data?.error || 'Failed to add member.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Reset / Clear
  const handleResetPoints = async (studentId, name) => {
    if (!window.confirm(`Are you sure you want to clear all points for ${name} (${studentId})?`)) return;

    try {
      await api.delete(`/admin/leaderboard/${studentId}`);
      notify('success', `Cleared points for ${name}.`);
      fetchData();
    } catch (err) {
      console.error('Reset error:', err);
      notify('error', 'Failed to clear points.');
    }
  };

  // Filtered leaderboard list
  const filtered = leaderboard.filter(item => {
    const matchesSearch = 
      item.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || item.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(leaderboard.map(i => i.department).filter(Boolean)));
  const totalPointsDistributed = leaderboard.reduce((acc, curr) => acc + (parseFloat(curr.total_points) || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Feedback Banner */}
      {feedback.message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Points & Leaderboard Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Leaderboard & Rewards Admin
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm">
            Award points to volunteers, adjust leaderboard ranks, and oversee student eco-steward recognition.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/30 text-stone-200 text-xs font-semibold rounded-xl transition-all"
          >
            <UserPlus size={15} />
            <span>Add Member to Board</span>
          </button>

          <button
            onClick={() => setAwardModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer"
          >
            <Award size={16} />
            <span>Award Points</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#091a14]/70 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span>TOTAL DISTRIBUTED</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalPointsDistributed}</div>
          <p className="text-stone-400 text-xs mt-1">Verified eco-action points across all students</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#091a14]/70 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span>ACTIVE STEWARDS</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{leaderboard.length}</div>
          <p className="text-stone-400 text-xs mt-1">Ranked student conservationists</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#091a14]/70 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs font-semibold mb-2">
            <span>TOP RANKED STEWARD</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-emerald-300 truncate">
            {leaderboard[0] ? leaderboard[0].full_name : 'No stewards yet'}
          </div>
          <p className="text-stone-400 text-xs mt-1">
            {leaderboard[0] ? `${leaderboard[0].total_points} Points · ${leaderboard[0].department}` : 'Awaiting entries'}
          </p>
        </div>
      </div>

      {/* Leaderboard Table Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#091a14]/50 p-4 rounded-2xl border border-white/[0.06]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search by name, USN, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-stone-200 text-xs placeholder:text-stone-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-stone-300 text-xs focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all" className="bg-[#091a14]">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d} className="bg-[#091a14]">{d}</option>
            ))}
          </select>

          <button
            onClick={fetchData}
            title="Refresh Leaderboard"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <LoadingSpinner message="Loading leaderboard entries..." />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#091a14]/40 border border-white/[0.08]">
          <Trophy className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Entries Found</h3>
          <p className="text-xs text-stone-400 mb-4">No student records match the active filter criteria.</p>
          <button
            onClick={() => setAwardModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20"
          >
            Award Points to a Student
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-[#091a14]/60 overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-stone-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">Rank</th>
                  <th className="px-6 py-4">Student Steward</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-center">Events Logged</th>
                  <th className="px-6 py-4 text-right">Total Points</th>
                  <th className="px-6 py-4 text-center">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((item, index) => {
                  const rank = item.rank || index + 1;
                  return (
                    <tr key={item.student_id || index} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold ${
                          rank === 1 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                          rank === 2 ? 'bg-stone-300/20 text-stone-200 border border-stone-300/30' :
                          rank === 3 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30' :
                          'text-stone-500 bg-white/[0.03]'
                        }`}>
                          {rank}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                          {item.full_name}
                        </div>
                        <div className="text-stone-400 text-[11px] font-mono mt-0.5">
                          {item.student_id || 'ID Pending'}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-stone-300">
                        <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px]">
                          {item.department || 'General'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center font-mono text-stone-300">
                        {item.events_count || 1}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-extrabold text-sm">
                          <Sparkles className="w-3.5 h-3.5" />
                          {item.total_points}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditData({
                                student_id: item.student_id,
                                full_name: item.full_name,
                                department: item.department || '',
                                total_points: item.total_points
                              });
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-stone-300 hover:text-emerald-300 transition-all"
                            title="Edit Score / Details"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleResetPoints(item.student_id, item.full_name)}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-stone-400 hover:text-rose-400 transition-all"
                            title="Clear Points"
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

      {/* ─── MODAL 1: Award Points ─── */}
      <Modal
        isOpen={awardModalOpen}
        onClose={() => setAwardModalOpen(false)}
        title="Award Conservation Points"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAwardSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-300 font-semibold mb-1">Select Member / Volunteer</label>
            <select
              value={awardData.email || awardData.student_id}
              onChange={(e) => {
                const val = e.target.value;
                const found = members.find(m => m.email === val || m.student_id === val);
                if (found) {
                  setAwardData(prev => ({
                    ...prev,
                    student_id: found.student_id,
                    email: found.email,
                    full_name: found.full_name,
                    department: found.department
                  }));
                } else {
                  setAwardData(prev => ({ ...prev, student_id: val }));
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">-- Choose Member or Enter Custom Below --</option>
              {members.map(m => (
                <option key={m.id || m.email} value={m.email || m.student_id}>
                  {m.full_name} ({m.student_id || m.email}) · {m.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Student USN / ID</label>
              <input
                type="text"
                placeholder="1RN23CS001"
                value={awardData.student_id}
                onChange={(e) => setAwardData({ ...awardData, student_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Student Name"
                value={awardData.full_name}
                onChange={(e) => setAwardData({ ...awardData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Points to Award</label>
            <div className="flex items-center gap-2 mb-2">
              {[10, 25, 50, 100].map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAwardData({ ...awardData, points: amt })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    awardData.points === amt 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                      : 'bg-white/[0.04] border-white/10 text-stone-400 hover:text-white'
                  }`}
                >
                  +{amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              value={awardData.points}
              onChange={(e) => setAwardData({ ...awardData, points: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 font-mono text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Reason / Drive Description</label>
            <input
              type="text"
              placeholder="e.g. Weekend Wetland Audit & Plastic Clean-up"
              value={awardData.reason}
              onChange={(e) => setAwardData({ ...awardData, reason: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setAwardModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingAward}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingAward ? 'Awarding...' : 'Confirm Award'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: Edit Points / Leaderboard Entry ─── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Leaderboard Score"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-300 font-semibold mb-1">Student Name</label>
            <input
              type="text"
              value={editData.full_name}
              onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Department</label>
            <input
              type="text"
              value={editData.department}
              onChange={(e) => setEditData({ ...editData, department: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Total Points</label>
            <input
              type="number"
              value={editData.total_points}
              onChange={(e) => setEditData({ ...editData, total_points: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 font-mono text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#04110b] font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 3: Add Member to Board ─── */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Member to Leaderboard"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-300 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Ananya Rao"
              required
              value={newMemberData.full_name}
              onChange={(e) => setNewMemberData({ ...newMemberData, full_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Student USN / Roll No</label>
            <input
              type="text"
              placeholder="e.g. 1RN23CV018"
              required
              value={newMemberData.student_id}
              onChange={(e) => setNewMemberData({ ...newMemberData, student_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Department</label>
            <input
              type="text"
              placeholder="e.g. Civil Engineering"
              value={newMemberData.department}
              onChange={(e) => setNewMemberData({ ...newMemberData, department: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">Initial Points</label>
            <input
              type="number"
              value={newMemberData.total_points}
              onChange={(e) => setNewMemberData({ ...newMemberData, total_points: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 font-mono text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingAdd}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#04110b] font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingAdd ? 'Adding...' : 'Add to Leaderboard'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
