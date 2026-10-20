import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, 
  XCircle, Edit, Download, Printer, Search
} from 'lucide-react';
import api from '../../utils/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const sameId = (a, b) => String(a) === String(b);

const AdminEventDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [results, setResults] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [eventRes, regRes, attRes, resRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/registrations/event/${id}`),
        api.get(`/attendance/event/${id}`).catch(() => ({ data: [] })),
        api.get(`/results/event/${id}`).catch(() => ({ data: [] }))
      ]);
      
      setEvent(eventRes.data);
      setRegistrations(Array.isArray(regRes.data) ? regRes.data : (regRes.data.data || []));
      setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
      setResults(Array.isArray(resRes.data) ? resRes.data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 5000);
  };

  const handleStatusChange = async (regId, newStatus) => {
    try {
      setBusyId(regId);
      await api.patch(`/registrations/${regId}/status`, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error('Failed to update registration status:', err);
      showNotice(err.response?.data?.error || 'Failed to update registration status');
    } finally {
      setBusyId(null);
    }
  };

  // Present awards the event's points automatically; Absent removes them.
  const handleAttendance = async (regId, status) => {
    try {
      setBusyId(regId);
      await api.post('/attendance', { registration_id: regId, event_id: id, status });
      await fetchData();
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      showNotice(err.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setBusyId(null);
    }
  };

  const saveResult = async (regId, data) => {
    try {
      // check if exists
      const existing = results.find(r => sameId(r.registration_id, regId));
      if (existing) {
        await api.put(`/results/${existing.id}`, data);
      } else {
        await api.post('/results', { registration_id: regId, event_id: id, ...data });
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to save result:', err);
      showNotice(err.response?.data?.error || 'Failed to save result');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/admin/export/${id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event-${id}-registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export event data.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner fullPage text="Loading event details..." />;
  if (error || !event) return <div className="text-red-400 p-6 bg-red-500/10 rounded-2xl">{error || 'Event not found'}</div>;

  const pendingRegs = registrations.filter(r => r.status === 'pending' || r.status === 'waitlisted');
  const acceptedRegs = registrations.filter(r => r.status === 'accepted');
  const rejectedRegs = registrations.filter(r => r.status === 'rejected');
  
  const acceptedIds = new Set(acceptedRegs.map(r => String(r.id)));
  const presentCount = attendance.filter(a => a.status === 'present' && acceptedIds.has(String(a.registration_id))).length;
  const absentCount = attendance.filter(a => a.status === 'absent' && acceptedIds.has(String(a.registration_id))).length;
  const eventPoints = Number(event.points_available) || 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'pending', label: `Pending (${pendingRegs.length})` },
    { id: 'accepted', label: `Attendance & Marks (${acceptedRegs.length})` },
    { id: 'rejected', label: `Rejected (${rejectedRegs.length})` },
    { id: 'results', label: 'Results' },
    { id: 'docs', label: 'Documentation' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/events" className="p-2 hover:bg-white/[0.05] rounded-xl text-stone-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{event.title}</h1>
              <StatusBadge status={event.status} />
            </div>
            <p className="text-stone-400">{new Date(event.event_date).toLocaleDateString()} • {event.venue}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 border border-white/[0.08] hover:border-stone-500 text-stone-300 rounded-xl flex items-center gap-2">
            <Download size={16} /> Export
          </button>
          <Link to={`/admin/events/${id}/edit`} className="px-4 py-2 bg-[#86efac] hover:bg-[#a7f3d0] text-black font-semibold rounded-xl flex items-center gap-2">
            <Edit size={16} /> Edit
          </Link>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-white/[0.06] hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-[#86efac] text-[#86efac]' 
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {notice && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm" role="alert">{notice}</div>
      )}

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Event Details</h2>
              <div className="space-y-4 text-stone-300">
                <p><strong className="text-stone-400">Category:</strong> {event.category}</p>
                <p><strong className="text-stone-400">Max Participants:</strong> {event.max_participants || 'Unlimited'}</p>
                <p><strong className="text-stone-400">Points Available:</strong> {event.points_available || 'N/A'}</p>
                <p><strong className="text-stone-400">Description:</strong> {event.description}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-stone-400 font-medium mb-2">Registration Stats</h3>
                <div className="text-3xl font-bold text-white mb-1">{registrations.length}</div>
                <div className="text-sm text-stone-500">Total Registered</div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-stone-400">Accepted:</span> <span className="text-emerald-400">{acceptedRegs.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-stone-400">Pending:</span> <span className="text-amber-400">{pendingRegs.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-stone-400">Rejected:</span> <span className="text-red-400">{rejectedRegs.length}</span></div>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-stone-400 font-medium mb-2">Attendance</h3>
                <div className="text-3xl font-bold text-white mb-1">{presentCount}</div>
                <div className="text-sm text-stone-500">Total Present</div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-stone-400">Absent:</span> <span className="text-red-400">{absentCount}</span></div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                    <div className="bg-[#86efac] h-1.5 rounded-full" style={{ width: acceptedRegs.length ? `${(presentCount/acceptedRegs.length)*100}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input 
                  type="text" 
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/[0.06] rounded-xl text-stone-200"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-white/[0.04] text-stone-400 text-sm">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">ID / Dept</th>
                    <th className="py-3 px-4 font-medium">Contact</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRegs.filter(r => (r.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(reg => (
                    <tr key={reg.id} className="border-b border-white/[0.04]">
                      <td className="py-3 px-4 font-medium text-stone-200">{reg.full_name}</td>
                      <td className="py-3 px-4">
                        <div className="text-stone-300">{reg.student_id}</div>
                        <div className="text-stone-500 text-xs">{reg.department} ({reg.year})</div>
                      </td>
                      <td className="py-3 px-4 text-stone-400 text-sm">
                        <div>{reg.email}</div>
                        <div>{reg.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleStatusChange(reg.id, 'accepted')} disabled={busyId === reg.id} className="disabled:opacity-50 px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-sm transition-colors flex items-center gap-1">
                            <CheckCircle size={14} /> Accept
                          </button>
                          <button onClick={() => handleStatusChange(reg.id, 'rejected')} disabled={busyId === reg.id} className="disabled:opacity-50 px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors flex items-center gap-1">
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingRegs.length === 0 && (
                    <tr><td colSpan="4" className="py-8 text-center text-stone-500">No pending registrations</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'accepted' && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm px-4 py-2 bg-slate-900 border border-white/[0.06] rounded-xl text-stone-200"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-white/[0.04] text-stone-400 text-sm">
                    <th className="py-3 px-4 font-medium">Participant</th>
                    <th className="py-3 px-4 font-medium text-center">Attendance</th>
                    <th className="py-3 px-4 font-medium w-56">Marks / Points</th>
                    <th className="py-3 px-4 font-medium text-right">Registration</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedRegs.filter(r => (r.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(reg => {
                    const att = attendance.find(a => sameId(a.registration_id, reg.id));
                    const res = results.find(r => sameId(r.registration_id, reg.id)) || {};
                    return (
                      <tr key={reg.id} className="border-b border-white/[0.04]">
                        <td className="py-3 px-4">
                          <div className="text-stone-200 font-medium">{reg.full_name}</div>
                          <div className="text-stone-500 text-xs">{reg.student_id} • {reg.department}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleAttendance(reg.id, 'present')}
                              disabled={busyId === reg.id}
                              className={`min-h-12 px-6 rounded-xl font-bold transition-colors disabled:opacity-50 ${att?.status === 'present' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-emerald-400 border border-emerald-900/30'}`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleAttendance(reg.id, 'absent')}
                              disabled={busyId === reg.id}
                              className={`min-h-12 px-6 rounded-xl font-bold transition-colors disabled:opacity-50 ${att?.status === 'absent' ? 'bg-red-500 text-white' : 'bg-slate-800 text-red-400 border border-red-900/30'}`}
                            >
                              Absent
                            </button>
                          </div>
                          <p className="text-xs mt-1.5 text-stone-500">
                            {att?.status === 'present' ? `Marked present · +${Number(res.points ?? eventPoints) || 0} pts` : att?.status === 'absent' ? 'Marked absent · 0 pts' : 'Not marked yet'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <input
                              key={`m-${reg.id}-${res.marks ?? ''}`}
                              type="number"
                              placeholder="Marks"
                              title="Marks"
                              defaultValue={res.marks}  
                              onBlur={(e) => saveResult(reg.id, { marks: parseFloat(e.target.value) || 0, points: res.points })}
                              className="w-16 px-2 py-1 bg-slate-900 border border-white/[0.06] rounded text-stone-200 text-sm"
                            />
                            <input
                              key={`p-${reg.id}-${res.points ?? ''}`}
                              type="number"
                              placeholder="Pts"
                              title="Points (set automatically when marked present)"
                              defaultValue={res.points}  
                              onBlur={(e) => saveResult(reg.id, { marks: res.marks, points: parseInt(e.target.value) || 0 })}
                              className="w-16 px-2 py-1 bg-slate-900 border border-white/[0.06] rounded text-stone-200 text-sm"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => handleStatusChange(reg.id, 'rejected')} disabled={busyId === reg.id} className="text-red-400 hover:underline text-sm disabled:opacity-50">
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {acceptedRegs.length === 0 && (
                    <tr><td colSpan="4" className="py-8 text-center text-stone-500">No accepted participants yet. Accept registrations from the Pending tab.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-stone-500 mt-4">Marking someone Present gives them this event's {eventPoints} points straight away; Absent takes them back.</p>
          </div>
        )}

        {activeTab === 'rejected' && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-white/[0.04] text-stone-400 text-sm">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">ID / Dept</th>
                    <th className="py-3 px-4 font-medium">Contact</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedRegs.map(reg => (
                    <tr key={reg.id} className="border-b border-white/[0.04]">
                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-200">{reg.full_name}</div>
                        {reg.rejected_at && <div className="text-stone-500 text-xs">Rejected {new Date(reg.rejected_at).toLocaleDateString()}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-stone-300">{reg.student_id}</div>
                        <div className="text-stone-500 text-xs">{reg.department}{reg.year ? ` (${reg.year})` : ''}</div>
                      </td>
                      <td className="py-3 px-4 text-stone-400 text-sm">
                        <div>{reg.email}</div>
                        <div>{reg.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleStatusChange(reg.id, 'accepted')} disabled={busyId === reg.id} className="text-emerald-400 hover:underline text-sm disabled:opacity-50">
                            Move to Accepted
                          </button>
                          <button onClick={() => handleStatusChange(reg.id, 'pending')} disabled={busyId === reg.id} className="text-amber-400 hover:underline text-sm disabled:opacity-50">
                            Back to Pending
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rejectedRegs.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-stone-500">No rejected registrations</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-white/[0.04] text-stone-400 text-sm">
                    <th className="py-3 px-4 font-medium">Rank</th>
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Marks</th>
                    <th className="py-3 px-4 font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {[...results].sort((a,b) => (Number(b.points) || 0) - (Number(a.points) || 0)).map((res, idx) => (
                    <tr key={res.id} className="border-b border-white/[0.04]">
                      <td className="py-3 px-4 text-stone-300">{res.rank || idx + 1}</td>
                      <td className="py-3 px-4 text-stone-200">{res.full_name || registrations.find(r => sameId(r.id, res.registration_id))?.full_name}</td>
                      <td className="py-3 px-4 text-stone-300">{res.marks}</td>
                      <td className="py-3 px-4 text-stone-300">{res.points}</td>
                    </tr>
                  ))}
                  {results.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-stone-500">No results recorded yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="bg-white p-8 rounded-2xl text-black max-w-4xl mx-auto print:p-0 print:bg-transparent">
            <div className="flex justify-between items-center mb-8 print:hidden">
              <h2 className="text-xl font-bold">Event Report</h2>
              <button onClick={handlePrint} className="px-4 py-2 bg-blue-500 text-white rounded-xl flex items-center gap-2">
                <Printer size={16} /> Print Report
              </button>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <p className="text-gray-600">{new Date(event.event_date).toLocaleDateString()} • {event.venue}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="border border-gray-200 p-4 rounded-xl">
                <h3 className="font-bold mb-2">Summary</h3>
                <ul className="space-y-1 text-sm">
                  <li>Total Registered: {registrations.length}</li>
                  <li>Accepted: {acceptedRegs.length}</li>
                  <li>Present: {presentCount}</li>
                  <li>Attendance Rate: {acceptedRegs.length ? Math.round((presentCount/acceptedRegs.length)*100) : 0}%</li>
                </ul>
              </div>
            </div>
            
            <h3 className="font-bold mb-4 text-lg border-b pb-2">Participant Attendance</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="py-2">Name</th>
                  <th className="py-2">ID</th>
                  <th className="py-2">Dept</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {acceptedRegs.map(reg => {
                  const att = attendance.find(a => sameId(a.registration_id, reg.id));
                  return (
                    <tr key={reg.id} className="border-b border-gray-100">
                      <td className="py-2">{reg.full_name}</td>
                      <td className="py-2">{reg.student_id}</td>
                      <td className="py-2">{reg.department}</td>
                      <td className="py-2 font-medium">{att?.status === 'present' ? 'Present' : att?.status === 'absent' ? 'Absent' : '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventDetail;
