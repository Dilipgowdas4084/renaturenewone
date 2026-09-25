import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Calendar, MapPin, Users, Search, Filter, ArrowRight } from 'lucide-react';

const CATEGORIES = ['All', 'Nature Walk', 'Workshop', 'Cleanup Drive', 'Photography', 'Seminar', 'Competition', 'Other'];
const STATUSES = ['All', 'Upcoming', 'Ongoing', 'Completed'];

const SAMPLE_EVENTS = [
  {
    id: 'sample-1',
    title: 'Campus Cleanup Drive',
    category: 'Cleanup Drive',
    description: 'Join us for our monthly campus cleanup. Help us keep our environment clean, collect plastic waste, and maintain healthy habitats.',
    date: '2026-09-10',
    venue: 'Main Gate',
    status: 'Upcoming',
    registered_count: 45,
    max_participants: 100,
    image_url: '/IMG_9279.jpeg'
  },
  {
    id: 'sample-2',
    title: 'Wildlife Photography Workshop',
    category: 'Photography',
    description: 'Learn the fundamentals of ethical wildlife photography and avian behavior tracking from professional naturalists.',
    date: '2026-09-15',
    venue: 'Auditorium 1',
    status: 'Upcoming',
    registered_count: 120,
    max_participants: 150,
    image_url: '/IMG_9723.jpeg'
  },
  {
    id: 'sample-3',
    title: 'Botanical Garden Native Walk',
    category: 'Nature Walk',
    description: 'A guided field tour through the university botanical gardens focusing on endangered native trees and medicinal plant flora.',
    date: '2026-09-20',
    venue: 'Botanical Garden',
    status: 'Upcoming',
    registered_count: 30,
    max_participants: 30,
    image_url: '/IMG_9183.jpeg'
  }
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;
      if (search) params.search = search;

      const res = await api.get('/events', { params });
      if (res.data && res.data.length > 0) {
        setEvents(res.data);
      } else {
        setEvents(SAMPLE_EVENTS);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(true);
      setEvents(SAMPLE_EVENTS);
    } finally {
      setLoading(false);
    }
  }, [category, status, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#040d0a] text-stone-200 pb-24 selection:bg-emerald-500/20 selection:text-emerald-300">
        
        {/* ─── Hero Section ─── */}
        <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08)_0%,_transparent_60%)]" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-5">
              <Calendar className="w-3.5 h-3.5" />
              Verified Drives & Expeditions
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight">
              Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Events</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Discover and join environmental expeditions dedicated to nurturing our campus ecosystem and earning Eco-Points.
            </p>
          </div>
        </section>

        {/* ─── Search & Filter Bar ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12 relative z-10">
          <div className="bg-[#091a14]/80 border border-white/[0.08] rounded-2xl p-3 sm:p-4 backdrop-blur-xl flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between shadow-xl shadow-black/20">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="text" 
                placeholder="Search events, topics, or venues..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#05110d] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all min-h-[44px]"
              />
            </form>

            {/* Dropdown Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-[#05110d] border border-white/[0.08] rounded-xl px-3 py-1 min-h-[44px]">
                <Filter className="w-4 h-4 text-stone-400 shrink-0" />
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent py-1.5 pr-4 text-xs sm:text-sm text-stone-200 focus:outline-none cursor-pointer w-full"
                >
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#05110d] text-stone-200">{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#05110d] border border-white/[0.08] rounded-xl px-3 py-1 min-h-[44px]">
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-transparent py-1.5 pr-4 text-xs sm:text-sm text-stone-200 focus:outline-none cursor-pointer w-full"
                >
                  {STATUSES.map(s => <option key={s} value={s} className="bg-[#05110d] text-stone-200">{s}</option>)}
                </select>
              </div>
            </div>

          </div>
        </section>

        {/* ─── Events Grid ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm text-center">
              Notice: Displaying curated preview events.
            </div>
          )}

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" message="Loading environmental drives..." />
            </div>
          ) : events.length === 0 ? (
            <EmptyState 
              title="No events found" 
              description="We couldn't find any events matching your selected criteria. Try adjusting your search query or filters."
              icon={Calendar}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => {
                const isFull = event.max_participants && event.registered_count >= event.max_participants;
                const isPast = event.status === 'Completed';
                const eventDate = event.event_date || event.date;
                const formattedDate = eventDate 
                  ? new Date(eventDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Date TBA';

                return (
                  <div 
                    key={event.id} 
                    className="rounded-3xl bg-[#091a14]/60 border border-white/[0.08] overflow-hidden flex flex-col transition-all duration-300 hover:border-emerald-500/35 hover:-translate-y-1 group shadow-xl shadow-black/30 backdrop-blur-xl"
                  >
                    {/* Image Area */}
                    <div className="h-52 bg-[#05110d] relative overflow-hidden">
                      {event.image_url || event.banner_url ? (
                        <img 
                          src={event.image_url || event.banner_url} 
                          alt={event.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = '/IMG_9183.jpeg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0c221a] to-[#05110d] flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-emerald-500/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#091a14] via-transparent to-transparent opacity-80" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4">
                        <StatusBadge status={event.status} />
                      </div>
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                        {event.category}
                      </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-300 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-stone-400 text-sm mb-5 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                        
                        <div className="flex flex-col gap-2.5 mb-6 text-xs text-stone-300 bg-[#05110d]/50 p-3.5 rounded-xl border border-white/[0.04]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{event.registered_count || 0} / {event.max_participants || 'Unlimited'} registered</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-3">
                        <Link 
                          to={`/events/${event.id}`}
                          className="flex-1 py-2.5 px-4 text-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-200 hover:text-white text-xs font-semibold border border-white/[0.08] transition-all min-h-[44px] flex items-center justify-center cursor-pointer"
                        >
                          View Details
                        </Link>
                        
                        {!isPast && !isFull && (
                          <Link 
                            to={`/events/${event.id}/register`}
                            className="flex-1 py-2.5 px-4 text-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] text-xs font-bold transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                          >
                            Register
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {(isFull || isPast) && (
                          <span className="flex-1 py-2.5 px-4 text-center rounded-xl bg-white/[0.02] text-stone-500 text-xs font-medium border border-white/[0.04] cursor-not-allowed min-h-[44px] flex items-center justify-center">
                            {isFull ? 'Event Full' : 'Concluded'}
                          </span>
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
