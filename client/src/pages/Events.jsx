import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Calendar, MapPin, Users, Clock, Search, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Nature Walk', 'Workshop', 'Cleanup Drive', 'Photography', 'Seminar', 'Competition', 'Other'];
const STATUSES = ['All', 'Upcoming', 'Ongoing', 'Completed'];

const SAMPLE_EVENTS = [
  {
    id: 'sample-1',
    title: 'Campus Cleanup Drive',
    category: 'Cleanup Drive',
    description: 'Join us for our monthly campus cleanup. Help us keep our environment clean and beautiful.',
    date: '2026-09-10',
    venue: 'Main Gate',
    status: 'Upcoming',
    registered_count: 45,
    max_participants: 100,
    image_url: null
  },
  {
    id: 'sample-2',
    title: 'Wildlife Photography Workshop',
    category: 'Photography',
    description: 'Learn the basics of wildlife photography from professional photographers in this interactive session.',
    date: '2026-09-15',
    venue: 'Auditorium 1',
    status: 'Upcoming',
    registered_count: 120,
    max_participants: 150,
    image_url: null
  },
  {
    id: 'sample-3',
    title: 'Botanical Garden Tour',
    category: 'Nature Walk',
    description: 'A guided tour through the university botanical gardens focusing on rare plant species.',
    date: '2026-09-20',
    venue: 'Botanical Garden',
    status: 'Upcoming',
    registered_count: 30,
    max_participants: 30,
    image_url: null
  }
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, [category, status]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;
      if (search) params.search = search;

      const res = await api.get('/api/events', { params });
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(true);
      setEvents(SAMPLE_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-black text-stone-200 pb-24">
        
        {/* ─── Hero Section ─── */}
        <section className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(134,239,172,0.05)_0%,_transparent_50%)]" />
          <h1 className="relative z-10 text-4xl sm:text-5xl font-bold text-white mb-6">
            Upcoming <span className="text-[#86efac]">Events</span>
          </h1>
          <p className="relative z-10 text-stone-400 max-w-2xl mx-auto text-lg">
            Discover and join events dedicated to nurturing our environment. There's always a way to get involved.
          </p>
        </section>

        {/* ─── Filter Bar ─── */}
        <section className="max-w-7xl mx-auto px-6 mb-12 relative z-10">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/50 border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-[#86efac]/50 focus:ring-1 focus:ring-[#86efac]/50 transition-all"
              />
            </form>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-stone-500" />
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-black/50 border border-white/[0.08] rounded-xl py-2.5 px-4 text-stone-200 focus:outline-none focus:border-[#86efac]/50 transition-all appearance-none cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="bg-black/50 border border-white/[0.08] rounded-xl py-2.5 px-4 text-stone-200 focus:outline-none focus:border-[#86efac]/50 transition-all appearance-none cursor-pointer"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* ─── Events Grid ─── */}
        <section className="max-w-7xl mx-auto px-6">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-center">
              Could not load live events. Showing sample data.
            </div>
          )}

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" color="#86efac" />
            </div>
          ) : events.length === 0 ? (
            <EmptyState 
              title="No events found" 
              message="We couldn't find any events matching your criteria."
              icon={<Calendar className="w-12 h-12 text-stone-600" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => {
                const isFull = event.max_participants && event.registered_count >= event.max_participants;
                const isPast = event.status === 'Completed';

                return (
                  <div key={event.id} className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden flex flex-col transition-all duration-300 hover:border-[#86efac]/30 hover:bg-white/[0.04] group">
                    {/* Image Area */}
                    <div className="h-48 bg-stone-900 relative overflow-hidden">
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(134,239,172,0.15)_0%,_transparent_70%)] flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-[#86efac]/30" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <StatusBadge status={event.status} />
                      </div>
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white">
                        {event.category}
                      </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-stone-400 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>
                      
                      <div className="flex flex-col gap-2 mb-6 text-sm text-stone-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#86efac]" />
                          <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#86efac]" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#86efac]" />
                          <span>{event.registered_count || 0} / {event.max_participants || 'Unlimited'} registered</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-auto">
                        <Link 
                          to={`/events/${event.id}`}
                          className="flex-1 py-2.5 rounded-xl border border-white/[0.08] hover:border-stone-500 text-center text-stone-300 hover:text-white font-medium transition-all bg-white/[0.02] hover:bg-white/[0.05]"
                        >
                          Details
                        </Link>
                        {!isPast && (
                          <Link 
                            to={isFull ? '#' : `/events/${event.id}/register`}
                            className={`flex-1 py-2.5 rounded-xl text-center font-medium transition-all ${
                              isFull 
                                ? 'bg-stone-800 text-stone-500 cursor-not-allowed' 
                                : 'bg-[#86efac] hover:bg-[#a7f3d0] text-black hover:shadow-lg hover:shadow-[#86efac]/20'
                            }`}
                          >
                            {isFull ? 'Full' : 'Register'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </PublicLayout>
  );
}
