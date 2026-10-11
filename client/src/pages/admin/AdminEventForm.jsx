import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EVENT_CATEGORIES = ['Nature Walk', 'Workshop', 'Cleanup Drive', 'Photography', 'Seminar', 'Competition', 'Other'];
const EVENT_STATUSES = ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed'];

const AdminEventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner_url: '',
    category: 'Nature Walk',
    event_date: '',
    start_time: '',
    end_time: '',
    venue: '',
    registration_deadline: '',
    max_participants: '',
    points_available: '',
    eligibility: '',
    rules: '',
    organizer_info: '',
    // New events go live with "Publish Event"; "Save as Draft" still saves a draft.
    status: 'published'
  });

  const fetchEventDetails = useCallback(async () => {
    try {
      const res = await api.get(`/events/${id}`);
      const data = res.data;
      
      // Format dates for inputs
      let eventDate = '';
      if (data.event_date) {
        eventDate = new Date(data.event_date).toISOString().split('T')[0];
      }
      
      let regDeadline = '';
      if (data.registration_deadline) {
        // datetime-local input expects YYYY-MM-DDThh:mm
        const date = new Date(data.registration_deadline);
        regDeadline = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      }

      setFormData({
        title: data.title || '',
        description: data.description || '',
        banner_url: data.banner_url || data.image_url || '',
        category: data.category || 'Nature Walk',
        event_date: eventDate,
        start_time: data.start_time || '',
        end_time: data.end_time || '',
        venue: data.venue || '',
        registration_deadline: regDeadline,
        max_participants: data.max_participants || '',
        points_available: data.points_available || '',
        eligibility: data.eligibility || '',
        rules: data.rules || '',
        organizer_info: data.organizer_info || '',
        status: data.status || 'draft'
      });
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      fetchEventDetails();
    }
  }, [isEditMode, fetchEventDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, customStatus = null) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.event_date) {
      setError('Title and Event Date are required.');
      window.scrollTo(0, 0);
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const payload = { ...formData };
      if (customStatus) {
        payload.status = customStatus;
      }
      
      // Convert numeric fields
      if (payload.max_participants) payload.max_participants = parseInt(payload.max_participants, 10);
      if (payload.points_available) payload.points_available = parseInt(payload.points_available, 10);

      if (isEditMode) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      
      navigate('/admin/events');
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save event. Please try again.');
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading event details..." />;

  const inputClass = "w-full px-4 py-2 bg-slate-900 border border-white/[0.06] rounded-xl text-stone-200 focus:outline-none focus:border-[#86efac]/50 transition-colors";
  const labelClass = "block text-sm font-medium text-stone-400 mb-1";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/events')}
          className="p-2 hover:bg-white/[0.05] rounded-xl text-stone-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-stone-400">Fill in the details to {isEditMode ? 'update' : 'create'} an event.</p>
        </div>
      </div>

      {error && (
        <div className="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-white/[0.06] pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Event Title *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                className={inputClass}
                placeholder="E.g., Campus Cleanup Drive"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={4} 
                className={inputClass}
                placeholder="Detailed description of the event..."
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Banner URL</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  name="banner_url" 
                  value={formData.banner_url} 
                  onChange={handleChange} 
                  className={inputClass}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {formData.banner_url && (
                <div className="mt-2 rounded-xl overflow-hidden h-32 border border-white/[0.06]">
                  <img src={formData.banner_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                {EVENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                {EVENT_STATUSES.map(stat => <option key={stat} value={stat}>{stat.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-white/[0.06] pb-2">Schedule & Location</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Event Date *</label>
              <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} required className={inputClass} />
            </div>
            
            <div>
              <label className={labelClass}>Venue</label>
              <input type="text" name="venue" value={formData.venue} onChange={handleChange} className={inputClass} placeholder="E.g., Main Auditorium" />
            </div>

            <div>
              <label className={labelClass}>Start Time</label>
              <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className={inputClass} />
            </div>
            
            <div>
              <label className={labelClass}>End Time</label>
              <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-white/[0.06] pb-2">Registration & Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Registration Deadline</label>
              <input type="datetime-local" name="registration_deadline" value={formData.registration_deadline} onChange={handleChange} className={inputClass} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Max Participants</label>
                <input type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} min="1" className={inputClass} placeholder="Limit" />
              </div>
              <div>
                <label className={labelClass}>Points Available</label>
                <input type="number" name="points_available" value={formData.points_available} onChange={handleChange} min="0" className={inputClass} placeholder="Points" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Organizer Info</label>
              <input type="text" name="organizer_info" value={formData.organizer_info} onChange={handleChange} className={inputClass} placeholder="E.g., Nature Club (John Doe - 9876543210)" />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Eligibility (Optional)</label>
              <textarea name="eligibility" value={formData.eligibility} onChange={handleChange} rows={2} className={inputClass} placeholder="Who can join?" />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Rules (Optional)</label>
              <textarea name="rules" value={formData.rules} onChange={handleChange} rows={3} className={inputClass} placeholder="Event rules and guidelines..." />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 sticky bottom-4 p-4 bg-slate-900 border border-white/[0.06] rounded-2xl backdrop-blur-xl z-10">
          <button 
            type="button" 
            onClick={() => navigate('/admin/events')}
            className="px-6 py-2 border border-white/[0.08] hover:border-stone-500 text-stone-300 rounded-xl transition-all"
            disabled={saving}
          >
            Cancel
          </button>
          
          {!isEditMode && (
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, 'draft')}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-stone-200 rounded-xl transition-all"
              disabled={saving}
            >
              Save Draft
            </button>
          )}

          <button 
            type="submit" 
            className="flex items-center gap-2 px-6 py-2 bg-[#86efac] hover:bg-[#a7f3d0] text-black font-semibold rounded-xl transition-all"
            disabled={saving}
          >
            <Save size={18} />
            {saving ? 'Saving...' : (isEditMode ? 'Update Event' : 'Publish Event')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEventForm;
