import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Copy, Trash2, Filter, AlertTriangle, Calendar, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

const EVENT_CATEGORIES = ['Nature Walk', 'Workshop', 'Cleanup Drive', 'Photography', 'Seminar', 'Competition', 'Other'];
const EVENT_STATUSES = ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed'];

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events?status=all');
      setEvents(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/events/${eventToDelete.id}`);
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event. It might have existing registrations.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/events/${id}/duplicate`);
      fetchEvents();
    } catch (err) {
      console.error('Error duplicating event:', err);
      alert('Failed to duplicate event.');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = (event.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? event.category === categoryFilter : true;
    const matchesStatus = statusFilter ? event.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Curriculum & Field Expeditions
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Event Management</h1>
          <p className="text-stone-400 text-xs sm:text-sm">Create, publish, monitor, and duplicate campus conservation events.</p>
        </div>
        
        <Link 
          to="/admin/events/new" 
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02]"
        >
          <Plus size={16} /> Create Event
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#091a14]/70 rounded-2xl border border-white/[0.08] p-4 flex flex-col md:flex-row gap-3 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search events by title, venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#05110d] border border-white/[0.08] rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-8 pr-8 py-2.5 bg-[#05110d] border border-white/[0.08] rounded-xl text-xs text-stone-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="">All Categories</option>
              {EVENT_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#05110d]">{cat}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-8 py-2.5 bg-[#05110d] border border-white/[0.08] rounded-xl text-xs text-stone-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {EVENT_STATUSES.map(stat => <option key={stat} value={stat} className="bg-[#05110d]">{stat.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading events roster..." />
      ) : error ? (
        <div className="text-rose-400 p-6 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-xs">{error}</div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState 
          icon={Calendar}
          title="No events found" 
          description="Try adjusting your filters or create a new event."
          actionLabel="Create Event"
          onAction={() => window.location.href='/admin/events/new'}
        />
      ) : (
        <div className="bg-[#091a14]/70 rounded-3xl border border-white/[0.08] overflow-hidden backdrop-blur-xl shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#05110d]/80 border-b border-white/[0.06] text-stone-400 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Event Title</th>
                  <th className="py-4 px-6 font-semibold">Scheduled Date</th>
                  <th className="py-4 px-6 font-semibold">Venue</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold">Registrations</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-white font-medium text-sm">{event.title}</div>
                      <div className="text-stone-500 text-xs mt-0.5">{event.category}</div>
                    </td>
                    <td className="py-4 px-6 text-stone-300 text-xs">
                      {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Date TBA'}
                    </td>
                    <td className="py-4 px-6 text-stone-400 text-xs">
                      {event.venue}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="py-4 px-6 text-stone-300 text-xs font-semibold">
                      {event.registered_count || 0} / {event.max_participants || '∞'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-1.5">
                        <Link 
                          to={`/admin/events/${event.id}`}
                          className="p-2 bg-white/[0.04] text-stone-300 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors border border-white/[0.06]"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link 
                          to={`/admin/events/${event.id}/edit`}
                          className="p-2 bg-white/[0.04] text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors border border-white/[0.06]"
                          title="Edit Event"
                        >
                          <Edit size={15} />
                        </Link>
                        <button 
                          onClick={() => handleDuplicate(event.id)}
                          className="p-2 bg-white/[0.04] text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-white/[0.06] cursor-pointer"
                          title="Duplicate Event"
                        >
                          <Copy size={15} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(event)}
                          className="p-2 bg-white/[0.04] text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-white/[0.06] cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <Modal 
          isOpen={deleteModalOpen} 
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Event"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 text-amber-300 mb-4 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-xs">
              <AlertTriangle size={20} className="shrink-0" />
              <p>Warning: This action cannot be undone. Are you sure you want to delete <strong>{eventToDelete?.title}</strong>?</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-white/[0.08] hover:bg-white/[0.05] text-stone-300 rounded-xl transition-all text-xs font-semibold cursor-pointer"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 font-semibold rounded-xl transition-all text-xs cursor-pointer"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminEvents;
