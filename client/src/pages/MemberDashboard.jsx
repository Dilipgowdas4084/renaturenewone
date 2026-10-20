import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { clearTokens } from '../utils/auth';
import api from '../utils/api';
import PublicLayout from '../components/PublicLayout';
import { texture } from '../utils/pixelTextures';

const REG_STATUS = {
  pending: { label: 'Pending', cls: 'bg-sun text-bark' },
  accepted: { label: 'Accepted', cls: 'bg-forest text-cream' },
  rejected: { label: 'Rejected', cls: 'bg-[#9c3d33] text-cream' },
};

function formatDate(value) {
  if (!value) return 'Date TBA';
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  if (!y) return 'Date TBA';
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function StatTile({ label, value, unit, note }) {
  return (
    <div className="px-panel p-5 sm:p-6" style={texture('parchment', 64)}>
      <p className="font-pixel text-xs sm:text-sm tracking-[0.15em] uppercase text-earth mb-2">{label}</p>
      <p className="font-num text-2xl sm:text-3xl text-bark">
        {value}{unit && <span className="font-pixel text-sm text-bark/60 ml-2">{unit}</span>}
      </p>
      <p className="text-xs text-bark/65 mt-2">{note}</p>
    </div>
  );
}

function QuestRow({ reg }) {
  const status = REG_STATUS[String(reg.status || '').toLowerCase()] || { label: reg.status || 'Pending', cls: 'bg-stone text-cream' };
  const attended = String(reg.attendance_status || '').toLowerCase() === 'present';
  return (
    <li className="px-panel--thin p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" style={texture('parchment', 48)}>
      <div className="min-w-0">
        <Link to={`/events/${reg.event_id}`} className="font-pixel text-lg uppercase text-bark hover:text-forest leading-snug">
          {reg.title}
        </Link>
        <p className="text-sm text-bark/75 mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <span><span aria-hidden="true">📅</span> {formatDate(reg.event_date)}</span>
          {reg.venue && <span><span aria-hidden="true">📍</span> {reg.venue}</span>}
        </p>
        <p className="font-num text-[10px] text-bark/55 mt-1.5">REF {reg.reference_id}</p>
      </div>
      <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
        <span className={`font-pixel text-xs uppercase tracking-wider px-2 py-1 px-panel--thin ${status.cls}`}>{status.label}</span>
        {reg.attendance_status && (
          <span className={`font-pixel text-xs uppercase tracking-wider px-2 py-1 ${attended ? 'text-forest' : 'text-bark/60'}`}>
            {attended ? '✔ Attended' : 'Absent'}
          </span>
        )}
        {Number(reg.points) > 0 && (
          <span className="font-num text-xs text-forest">+{Number(reg.points)} XP</span>
        )}
      </div>
    </li>
  );
}

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [standing, setStanding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, regRes] = await Promise.all([api.get('/auth/me'), api.get('/registrations/mine')]);
        const me = meRes.data?.user || null;
        setUser(me);
        setRegistrations(Array.isArray(regRes.data?.registrations) ? regRes.data.registrations : []);
        // Total points (events attended + admin awards) and leaderboard rank
        setStanding(regRes.data?.standing || null);
      } catch (err) {
        console.error('Could not load dashboard:', err);
        setError('Could not load your dashboard right now. Please try again in a moment.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    clearTokens();
    navigate('/login');
  };

  const today = todayISO();
  const isPast = r => String(r.event_status || '').toLowerCase() === 'completed' || String(r.event_date || '').slice(0, 10) < today;
  const upcoming = registrations.filter(r => !isPast(r));
  const past = registrations.filter(isPast);
  const attendedCount = registrations.filter(r => String(r.attendance_status || '').toLowerCase() === 'present').length;
  const points = standing ? Number(standing.total_points) || 0 : registrations.reduce((sum, r) => sum + (Number(r.points) || 0), 0);

  return (
    <PublicLayout>
      <div className="relative min-h-screen pb-24" style={texture('darkPlanks', 72)}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 sm:pt-14">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-block px-panel px-panel--thin px-5 py-3" style={texture('planks', 48)}>
                <p className="font-pixel text-sun text-xs tracking-[0.3em] mb-1">MEMBER PORTAL</p>
                <h1 className="px-title text-cream text-3xl sm:text-4xl tracking-wide">MY DASHBOARD</h1>
              </div>
              {user && (
                <p className="mt-4 text-cream/85">
                  Welcome back, <strong className="text-sun">{user.name}</strong>
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Link to="/profile" className="px-btn px-btn--wood px-btn--sm">My Profile</Link>
              <button onClick={handleLogout} className="px-btn px-btn--danger px-btn--sm">Sign Out</button>
            </div>
          </div>

          {error && (
            <div className="mb-10 px-panel px-panel--thin p-4 bg-ember text-bark text-center font-semibold">{error}</div>
          )}

          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4" role="status">
              <div className="flex gap-2" aria-hidden="true">
                {[0, 1, 2].map(i => <span key={i} className="w-4 h-4 bg-sun px-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
              <p className="font-pixel text-cream tracking-[0.2em] px-shadow-sm">LOADING YOUR QUESTS…</p>
            </div>
          ) : !error && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-14">
                <StatTile label="Eco-Points" value={points} unit="XP" note="Credited after drive verification" />
                <StatTile label="Quests Joined" value={registrations.length} note={`${attendedCount} attended`} />
                <StatTile label="Campus Rank" value={standing?.rank ? `#${standing.rank}` : '—'} note="On the campus leaderboard" />
              </div>

              {/* Upcoming quests */}
              <section className="mb-14">
                <h2 className="font-pixel text-cream text-2xl uppercase tracking-wide px-shadow-sm mb-5">Upcoming Quests</h2>
                {upcoming.length > 0 ? (
                  <ul className="flex flex-col gap-6">
                    {upcoming.map(r => <QuestRow key={r.id} reg={r} />)}
                  </ul>
                ) : (
                  <div className="px-panel p-6 text-center" style={texture('parchment', 64)}>
                    <p className="text-bark/80 mb-5">You haven't joined any upcoming quests yet.</p>
                    <Link to="/events" className="px-btn px-btn--grass px-btn--sm">Browse Quests</Link>
                  </div>
                )}
              </section>

              {/* Past quests */}
              {past.length > 0 && (
                <section className="mb-14">
                  <h2 className="font-pixel text-cream text-2xl uppercase tracking-wide px-shadow-sm mb-5">Past Quests</h2>
                  <ul className="flex flex-col gap-6">
                    {past.map(r => <QuestRow key={r.id} reg={r} />)}
                  </ul>
                </section>
              )}

              <div className="flex flex-wrap gap-5">
                <Link to="/events" className="px-btn px-btn--grass">Browse All Events</Link>
                <Link to="/leaderboard" className="px-btn px-btn--stone">Check Leaderboard</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
