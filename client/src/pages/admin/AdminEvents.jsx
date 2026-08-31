import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Copy, Trash2, Filter, AlertTriangle } from 'lucide-react';
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

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
      fetchEvents(); // Refresh list to show duplicated event
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Event Management</h1>
          <p className="text-stone-400">Create, update, and manage events.</p>
        </div>
        <Link 
          to="/admin/events/new" 
          className="flex items-center gap-2 px-4 py-2 bg-[#86efac] hover:bg-[#a7f3d0] text-black font-semibold rounded-xl transition-all duration-300"
        >
          <Plus size={18} /> Create Event
        </Link>
      </div>

      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input 
            type="text" 
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/[0.06] rounded-xl text-stone-200 focus:outline-none focus:border-[#86efac]/50"
          />
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-900 border border-white/[0.06] rounded-xl text-stone-200 focus:outline-none focus:border-[#86efac]/50 appearance-none"
            >
              <option value="">All Categories</option>
              {EVENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-900 border border-white/[0.06] rounded-xl text-stone-200 focus:outline-none focus:border-[#86efac]/50 appearance-none"
            >
              <option value="">All Statuses</option>
              {EVENT_STATUSES.map(stat => <option key={stat} value={stat}>{stat.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading events..." />
      ) : error ? (
        <div className="text-red-400 p-6 bg-red-500/10 rounded-2xl border border-red-500/20">{error}</div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState 
          icon={<Calendar size={48} />}
          title="No events found" 
          description="Try adjusting your filters or create a new event."
          action={{ label: "Create Event", onClick: () => window.location.href='/admin/events/new' }}
        />
      ) : (
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-white/[0.04] text-stone-400 text-sm">
                  <th className="py-4 px-6 font-medium">Title</th>
                  <th className="py-4 px-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium">Venue</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium">Registrations</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-stone-200 font-medium">{event.title}</div>
                      <div className="text-stone-500 text-xs">{event.category}</div>
                    </td>
                    <td className="py-4 px-6 text-stone-300">
                      {new Date(event.event_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-stone-400 text-sm">
                      {event.venue}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="py-4 px-6 text-stone-300">
                      {event.registered_count || 0} / {event.max_participants || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/admin/events/${event.id}`}
                          className="p-2 bg-slate-800 text-stone-300 hover:text-white rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          to={`/admin/events/${event.id}/edit`}
                          className="p-2 bg-slate-800 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDuplicate(event.id)}
                          className="p-2 bg-slate-800 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Duplicate Event"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(event)}
                          className="p-2 bg-slate-800 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
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
            <div className="flex items-center gap-4 text-amber-400 mb-4 bg-amber-500/10 p-4 rounded-xl">
              <AlertTriangle size={24} />
              <p className="text-sm">Warning: This action cannot be undone. Are you sure you want to delete <strong>{eventToDelete?.title}</strong>?</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-white/[0.08] hover:border-stone-500 text-stone-300 rounded-xl transition-all"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold rounded-xl transition-all"
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
