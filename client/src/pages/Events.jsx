import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import { texture } from '../utils/pixelTextures';

const CATEGORIES = ['All', 'Nature Walk', 'Workshop', 'Cleanup Drive', 'Photography', 'Seminar', 'Competition', 'Other'];
const STATUSES = ['All', 'Upcoming', 'Ongoing', 'Completed'];

const CATEGORY_ICONS = {
  'Nature Walk': '🥾',
  Workshop: '🛠️',
  'Cleanup Drive': '🧹',
  Photography: '📷',
  Seminar: '🎤',
  Competition: '⚔️',
  Other: '🌱',
};

const TILTS = ['-rotate-[0.8deg]', 'rotate-[0.6deg]', 'rotate-0', 'rotate-[0.4deg]', '-rotate-[0.5deg]'];

function QuestCard({ event, index }) {
  const isFull = event.max_participants && event.registered_count >= event.max_participants;
  const statusKey = String(event.status || '').toLowerCase();
  const isPast = statusKey === 'completed';
  const isOngoing = statusKey === 'ongoing';
  const deadlinePassed = Boolean(event.registration_deadline) && new Date(event.registration_deadline) < new Date();
  const isRegClosed = statusKey === 'registration_closed' || statusKey === 'draft' || deadlinePassed;
  const canRegister = !isPast && !isOngoing && !isRegClosed && !isFull;
  const eventDate = event.event_date || event.date;
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date TBA';

  const quest = isPast
    ? { label: 'Quest Completed', icon: '✔', cls: 'bg-stone text-cream' }
    : isOngoing
      ? { label: 'Quest In Progress', icon: '⏳', cls: 'bg-ember text-bark' }
      : isRegClosed
        ? { label: 'Registration Closed', icon: '🔒', cls: 'bg-earth text-cream' }
      : { label: 'Available Quest', icon: '!', cls: 'bg-forest text-cream' };
  const number = String(index + 1).padStart(2, '0');
  const icon = CATEGORY_ICONS[event.category] || '🌱';
  const image = event.image_url || event.banner_url;

  return (
    <article
      className={`relative px-panel p-5 pt-8 flex flex-col transition-transform duration-200 hover:rotate-0 hover:-translate-y-1 ${TILTS[index % TILTS.length]} ${isPast ? 'saturate-[0.6]' : ''}`}
      style={texture('parchment', 64)}
    >
      {/* pin */}
      <span aria-hidden="true" className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#c0392b] shadow-[inset_-3px_-3px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.4),0_3px_0_rgba(0,0,0,0.35)]" />

      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="font-pixel text-sm tracking-[0.15em] text-earth">QUEST <span className="font-num text-[11px] tracking-normal">#{number}</span></span>
        <span className={`font-pixel text-[11px] tracking-[0.08em] uppercase px-2 py-1 px-panel--thin whitespace-nowrap ${quest.cls}`}>
          <span aria-hidden="true">{quest.icon}</span> {quest.label}
        </span>
      </div>

      {image && (
        <div className="px-panel--thin h-36 mb-4 overflow-hidden bg-bark">
          <img
            src={image}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/IMG_9183.jpeg';
            }}
          />
        </div>
      )}

      <h3 className="font-pixel text-xl sm:text-[1.35rem] leading-snug text-bark uppercase mb-2">
        <span aria-hidden="true" className="mr-1">{icon}</span>{event.title}
      </h3>
      {event.category && (
        <span className="self-start font-pixel text-[11px] tracking-[0.1em] uppercase px-2 py-0.5 mb-3 bg-sage/50 text-deep">{event.category}</span>
      )}

      {event.description && (
        <p className="text-sm text-bark/80 leading-relaxed mb-4 line-clamp-3">{event.description}</p>
      )}

      <ul className="space-y-1.5 text-sm text-bark/90 mb-5">
        <li className="flex items-center gap-2"><span aria-hidden="true">📍</span><span className="truncate">{event.venue}</span></li>
        <li className="flex items-center gap-2"><span aria-hidden="true">📅</span>{formattedDate}</li>
        <li className="flex items-center gap-2"><span aria-hidden="true">👥</span>{event.registered_count || 0} / {event.max_participants || 'Unlimited'} registered</li>
      </ul>

      <div className="mt-auto pt-4 border-t-2 border-dashed border-earth/30 flex flex-wrap gap-4">
        <Link to={`/events/${event.id}`} className="px-btn px-btn--wood px-btn--sm flex-1">
          View Quest
        </Link>
        {canRegister ? (
          <Link to={`/events/${event.id}/register`} className="px-btn px-btn--grass px-btn--sm flex-1">
            Accept Quest
          </Link>
        ) : (
          <span aria-disabled="true" className="px-btn px-btn--stone px-btn--sm flex-1">
            {isPast ? 'Concluded' : isOngoing ? 'In Progress' : isRegClosed ? 'Closed' : 'Quest Full'}
          </span>
        )}
      </div>
    </article>
  );
}

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
      if (Array.isArray(res.data)) {
        // Show exactly what the admin has published — no placeholder events.
        setEvents(res.data);
      } else {
        // Got something other than a list (e.g. the API isn't reachable)
        setError(true);
        setEvents([]);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(true);
      setEvents([]);
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
      <div className="relative min-h-screen pb-24" style={texture('darkPlanks', 72)}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50 pointer-events-none" />

        {/* ─── Hanging sign ─── */}
        <section className="relative pt-10 sm:pt-14 pb-10 px-6 text-center">
          <div className="inline-block px-sign-swing">
            <div className="flex justify-between px-10" aria-hidden="true">
              <span className="w-1 h-8 bg-[#3a2a1a]" />
              <span className="w-1 h-8 bg-[#3a2a1a]" />
            </div>
            <div className="px-panel px-8 sm:px-12 py-5" style={texture('planks', 56)}>
              <p className="font-pixel text-sun text-xs sm:text-sm tracking-[0.35em] mb-1 uppercase">Verified Drives & Expeditions</p>
              <h1 className="px-title text-cream text-4xl sm:text-6xl tracking-wide">QUEST BOARD</h1>
            </div>
          </div>
          <p className="mt-6 text-cream/85 max-w-2xl mx-auto text-base sm:text-lg">
            Discover and join environmental expeditions dedicated to nurturing our campus ecosystem and earning Eco-Points.
          </p>
        </section>

        {/* ─── Filters ─── */}
        <section className="relative max-w-7xl mx-auto px-6 mb-14">
          <div className="px-panel p-4 sm:p-5 flex flex-col md:flex-row gap-5 md:items-center md:justify-between" style={texture('stone', 56)}>
            <form onSubmit={handleSearchSubmit} className="flex gap-4 w-full md:w-auto md:flex-1 md:max-w-md">
              <label className="sr-only" htmlFor="quest-search">Search quests</label>
              <input
                id="quest-search"
                type="text"
                placeholder="🔍  Search quests, topics, or venues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-input w-full"
              />
              <button type="submit" className="px-btn px-btn--wood px-btn--sm">Search</button>
            </form>
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-4">
              <label className="flex items-center gap-3">
                <span className="font-pixel text-xs tracking-[0.15em] text-cream px-shadow-sm">TYPE</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-input cursor-pointer flex-1">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-3">
                <span className="font-pixel text-xs tracking-[0.15em] text-cream px-shadow-sm">STATUS</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-input cursor-pointer flex-1">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
          </div>
        </section>

        {/* ─── Quest cards ─── */}
        <section className="relative max-w-7xl mx-auto px-6">
          {error && (
            <div className="mb-10 px-panel px-panel--thin p-4 bg-ember text-bark text-center font-semibold">
              Could not load events right now. Please try again in a moment.
            </div>
          )}

          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4" role="status">
              <div className="flex gap-2" aria-hidden="true">
                {[0, 1, 2].map(i => <span key={i} className="w-4 h-4 bg-sun px-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
              <p className="font-pixel text-cream tracking-[0.2em] px-shadow-sm">LOADING QUESTS…</p>
            </div>
          ) : error ? null : events.length === 0 ? (
            <div className="max-w-md mx-auto px-panel p-8 text-center" style={texture('parchment', 64)}>
              <p className="text-4xl mb-3" aria-hidden="true">🗺️</p>
              {search || category !== 'All' || status !== 'All' ? (
                <>
                  <h2 className="font-pixel text-2xl text-bark mb-2">NO EVENTS FOUND</h2>
                  <p className="text-bark/75">We couldn't find any events matching your selected criteria. Try adjusting your search query or filters.</p>
                </>
              ) : (
                <>
                  <h2 className="font-pixel text-2xl text-bark mb-2">NO UPCOMING EVENTS</h2>
                  <p className="text-bark/75">There are no events right now. Check back soon for new quests!</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {events.map((event, index) => <QuestCard key={event.id} event={event} index={index} />)}
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
