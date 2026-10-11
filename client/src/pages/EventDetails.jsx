import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import { texture } from '../utils/pixelTextures';

const CATEGORY_ICONS = {
  'Nature Walk': '🥾',
  Workshop: '🛠️',
  'Cleanup Drive': '🧹',
  Photography: '📷',
  Seminar: '🎤',
  Competition: '⚔️',
  Other: '🌱',
};

// "14:30:00" -> "2:30 PM"
function formatTime(value) {
  if (!value) return null;
  const [h, m] = String(value).split(':').map(Number);
  if (Number.isNaN(h)) return String(value);
  const d = new Date();
  d.setHours(h, m || 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function Parchment({ title, icon, children }) {
  return (
    <div className="px-panel p-6 sm:p-8" style={texture('parchment', 64)}>
      <h2 className="font-pixel text-xl sm:text-2xl uppercase text-bark mb-4 flex items-center gap-3">
        <span className="w-9 h-9 shrink-0 bg-forest px-panel--thin flex items-center justify-center text-base" aria-hidden="true">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function LogRow({ icon, label, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-lg leading-none mt-0.5" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <p className="font-pixel text-xs uppercase tracking-[0.12em] text-earth">{label}</p>
        <p className="text-bark font-semibold break-words">{children}</p>
      </div>
    </li>
  );
}

function Loader({ text }) {
  return (
    <div className="py-24 flex flex-col items-center gap-4" role="status">
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map(i => <span key={i} className="w-4 h-4 bg-sun px-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
      </div>
      <p className="font-pixel text-cream tracking-[0.2em] px-shadow-sm">{text}</p>
    </div>
  );
}

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/events/${id}`);
      if (res.data && typeof res.data === 'object') {
        setEvent(res.data);
      } else {
        setError(true);
        setEvent(null);
      }
    } catch (err) {
      console.error('Failed to fetch event details:', err);
      setError(true);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const wrap = (children) => (
    <PublicLayout>
      <div className="relative min-h-screen pb-24" style={texture('darkPlanks', 72)}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 pt-10 sm:pt-14">{children}</div>
      </div>
    </PublicLayout>
  );

  if (loading) return wrap(<Loader text="LOADING QUEST…" />);

  if (error || !event) {
    return wrap(
      <div className="max-w-md mx-auto mt-10 px-panel p-8 text-center" style={texture('parchment', 64)}>
        <p className="text-4xl mb-3" aria-hidden="true">🗺️</p>
        <h1 className="font-pixel text-2xl text-bark mb-2">QUEST NOT FOUND</h1>
        <p className="text-bark/75 mb-6">This quest may have been removed, or the link is incorrect.</p>
        <Link to="/events" className="px-btn px-btn--wood px-btn--sm">◂ Back to Quest Board</Link>
      </div>
    );
  }

  const isFull = event.max_participants && event.registered_count >= event.max_participants;
  const statusKey = String(event.status || '').toLowerCase();
  const isPast = statusKey === 'completed';
  const isOngoing = statusKey === 'ongoing';
  const signupDeadline = event.deadline || event.registration_deadline;
  const deadlinePassed = Boolean(signupDeadline) && new Date(signupDeadline) < new Date();
  const isRegClosed = statusKey === 'registration_closed' || statusKey === 'draft' || deadlinePassed;
  const isClosed = isPast || isOngoing || isRegClosed || isFull;

  const progressPercent = event.max_participants
    ? Math.min(100, (event.registered_count / event.max_participants) * 100)
    : 0;

  const eventDate = event.event_date || event.date;
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBA';

  // Real events use these field names; fall back to the older ones.
  const startTime = formatTime(event.start_time);
  const endTime = formatTime(event.end_time);
  const timeText = event.time || (startTime ? (endTime ? `${startTime} – ${endTime}` : startTime) : null);
  const points = event.points ?? event.points_available;
  const deadline = event.deadline || event.registration_deadline;
  const organizer = event.organizer || event.organizer_info;
  const rules = (Array.isArray(event.rules) ? event.rules : String(event.rules || '').split('\n'))
    .map(r => String(r).replace(/^[-•*\s]+/, '').trim())
    .filter(Boolean);
  const image = event.image_url || event.banner_url;

  const quest = isPast
    ? { label: 'Quest Completed', icon: '✔', cls: 'bg-stone text-cream' }
    : isOngoing
      ? { label: 'Quest In Progress', icon: '⏳', cls: 'bg-ember text-bark' }
      : isRegClosed
        ? { label: 'Registration Closed', icon: '🔒', cls: 'bg-earth text-cream' }
        : { label: 'Available Quest', icon: '!', cls: 'bg-forest text-cream' };

  return wrap(
    <>
      <Link to="/events" className="px-btn px-btn--stone px-btn--sm mb-8">◂ Back to Quest Board</Link>

      {/* Title sign */}
      <div className="mb-10">
        <div className="inline-block max-w-full px-panel px-panel--thin px-5 sm:px-7 py-4" style={texture('planks', 48)}>
          <p className="font-pixel text-sun text-xs sm:text-sm tracking-[0.25em] mb-1 uppercase">
            <span aria-hidden="true">{CATEGORY_ICONS[event.category] || '🌱'} </span>{event.category || 'Quest'}
          </p>
          <h1 className="px-title text-cream text-3xl sm:text-5xl tracking-wide leading-tight break-words">{event.title}</h1>
        </div>
        <div className="mt-5">
          <span className={`inline-block font-pixel text-xs sm:text-sm tracking-[0.08em] uppercase px-3 py-1.5 px-panel--thin ${quest.cls}`}>
            <span aria-hidden="true">{quest.icon}</span> {quest.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          {image && (
            <div className="px-panel p-3" style={texture('planks', 56)}>
              <div className="px-panel--thin overflow-hidden bg-bark">
                <img
                  src={image}
                  alt={event.title}
                  className={`w-full h-56 sm:h-80 object-cover ${isPast ? 'saturate-[0.6]' : ''}`}
                  onError={(e) => { e.currentTarget.closest('.px-panel').style.display = 'none'; }}
                />
              </div>
            </div>
          )}

          <Parchment title="Quest Briefing" icon="📜">
            <p className="text-bark/85 leading-relaxed whitespace-pre-wrap">{event.description || 'More details coming soon.'}</p>
          </Parchment>

          {rules.length > 0 && (
            <Parchment title="Quest Rules" icon="✔">
              <ul className="flex flex-col gap-3">
                {rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-bark/90">
                    <span className="w-2 h-2 mt-2 shrink-0 bg-forest" aria-hidden="true" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </Parchment>
          )}

          {event.eligibility && (
            <Parchment title="Who Can Join" icon="🎒">
              <p className="text-bark/85 leading-relaxed">{event.eligibility}</p>
            </Parchment>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-10">
          <div className="px-panel p-6" style={texture('parchment', 64)}>
            <h3 className="font-pixel text-xl uppercase text-bark mb-5 pb-3 border-b-2 border-dashed border-earth/30">Quest Log</h3>
            <ul className="flex flex-col gap-4">
              <LogRow icon="📅" label="Date">{formattedDate}</LogRow>
              {timeText && <LogRow icon="⏰" label="Time">{timeText}</LogRow>}
              <LogRow icon="📍" label="Location">{event.venue || 'Venue TBA'}</LogRow>
              {Number(points) > 0 && <LogRow icon="⭐" label="Reward"><span className="text-forest">+{points} XP</span></LogRow>}
              {deadline && <LogRow icon="⏳" label="Sign-ups close">{new Date(deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</LogRow>}
              {organizer && <LogRow icon="🧭" label="Organized by">{organizer}</LogRow>}
            </ul>
          </div>

          <div className="px-panel p-6" style={texture('stone', 56)}>
            <div className="flex justify-between items-baseline mb-3">
              <span className="font-pixel text-sm uppercase tracking-[0.12em] text-cream px-shadow-sm">Party Size</span>
              <span className="font-num text-xs text-cream px-shadow-sm">
                {event.registered_count || 0}/{event.max_participants || '∞'}
              </span>
            </div>
            {event.max_participants && (
              <div className="w-full h-3 px-xp-track mb-6" role="img" aria-label={`${event.registered_count || 0} of ${event.max_participants} spots taken`}>
                <div className="h-full px-xp-fill" style={{ width: `${Math.max(3, progressPercent)}%` }} />
              </div>
            )}

            {!isClosed ? (
              <Link to={`/events/${id}/register`} className="px-btn px-btn--grass w-full">
                <span aria-hidden="true">▶</span> Accept Quest
              </Link>
            ) : (
              <span aria-disabled="true" className="px-btn px-btn--stone w-full">
                {isPast ? 'Quest Concluded' : isOngoing ? 'Quest In Progress' : isRegClosed ? 'Registration Closed' : 'Party Full'}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
