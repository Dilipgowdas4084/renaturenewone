import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { clearTokens, dashboardPathFor } from '../utils/auth';
import PublicLayout from '../components/PublicLayout';
import { texture } from '../utils/pixelTextures';

const STARS = [[4, 5], [11, 12], [19, 3], [27, 9], [36, 4], [43, 11], [7, 20], [40, 22], [23, 16]];
const FIREFLIES = [[33, 26, 4, -0.5], [44, 31, 5, -1.7], [30, 47, 4.5, -2.6], [45, 45, 6, -0.9], [26, 38, 5.5, -3.3]];

// Pixel explorer standing at night, holding up a flickering lantern.
function LanternExplorer() {
  return (
    <svg viewBox="0 0 48 64" shapeRendering="crispEdges" className="block w-full h-auto" role="img" aria-label="A pixel explorer holding a glowing lantern at night">
      {/* night sky */}
      <rect width={48} height={64} fill="#1d2550" />
      <rect y={18} width={48} height={20} fill="#232d5c" />
      <rect y={38} width={48} height={18} fill="#2a3567" />
      {STARS.map(([x, y], i) => (
        <rect key={i} className="px-twinkle" x={x} y={y} width={1} height={1} fill="#fdf6d8" style={{ '--dur': `${2 + (i % 3)}s`, '--delay': `${-i * 0.6}s` }} />
      ))}
      {/* moon */}
      <rect x={4} y={6} width={6} height={6} fill="#f1ead2" />
      <rect x={6} y={8} width={1} height={1} fill="#d9d0b4" />
      <rect x={8} y={10} width={1} height={1} fill="#d9d0b4" />

      {/* lantern glow (behind everything nearby) */}
      {/* blended as light ("screen") so it warms the sky instead of greying it */}
      <g className="px-flicker" style={{ mixBlendMode: 'screen' }}>
        <rect x={25} y={27} width={27} height={27} fill="#5e4a08" />
        <rect x={29} y={31} width={19} height={19} fill="#80660f" />
        <rect x={32} y={34} width={13} height={13} fill="#a8871c" />
      </g>

      {/* ground */}
      <rect x={0} y={56} width={48} height={3} fill="#3f7d3a" />
      <rect x={0} y={56} width={48} height={1} fill="#5fa843" />
      <rect x={0} y={59} width={48} height={5} fill="#4d3420" />
      <rect x={6} y={61} width={2} height={1} fill="#3a2815" />
      <rect x={30} y={60} width={3} height={1} fill="#3a2815" />
      {/* lit patch of grass under the lantern */}
      <rect className="px-flicker" x={32} y={56} width={10} height={1} fill="#a8d86a" opacity={0.8} />

      {/* explorer, gently breathing */}
      <g className="px-bob" style={{ animationDuration: '1.6s' }}>
        {/* backpack */}
        <rect x={10} y={24} width={5} height={11} fill="#8a5a2e" />
        <rect x={10} y={24} width={5} height={2} fill="#a0703f" />
        {/* hat */}
        <rect x={15} y={3} width={14} height={6} fill="#6d4a26" />
        <rect x={15} y={7} width={14} height={1} fill="#3f7d3a" />
        <rect x={12} y={8} width={20} height={2} fill="#5b3a1e" />
        {/* head */}
        <rect x={15} y={10} width={14} height={11} fill="#e8b88a" />
        <rect x={15} y={10} width={2} height={5} fill="#3b2616" />
        <rect x={19} y={14} width={2} height={2} fill="#2b1d12" />
        <rect x={25} y={14} width={2} height={2} fill="#2b1d12" />
        <rect x={21} y={18} width={3} height={1} fill="#b86f52" />
        <rect className="px-flicker" x={27} y={12} width={2} height={7} fill="#ffd27a" opacity={0.35} />
        {/* scarf */}
        <rect x={16} y={21} width={12} height={2} fill="#c0392b" />
        {/* tunic */}
        <rect x={14} y={23} width={16} height={14} fill="#3f7d3a" />
        <rect x={14} y={23} width={3} height={14} fill="#346b30" />
        <rect x={14} y={33} width={16} height={2} fill="#5b3a1e" />
        <rect x={21} y={33} width={2} height={2} fill="#e9c46a" />
        {/* left arm */}
        <rect x={11} y={24} width={3} height={11} fill="#346b30" />
        <rect x={11} y={35} width={3} height={3} fill="#e8b88a" />
        {/* right arm raised, holding the lantern */}
        <rect x={30} y={24} width={3} height={8} fill="#3f7d3a" />
        <rect x={30} y={29} width={7} height={3} fill="#3f7d3a" />
        <rect x={37} y={28} width={3} height={4} fill="#e8b88a" />
        {/* legs + boots */}
        <rect x={16} y={37} width={5} height={15} fill="#3b4a6b" />
        <rect x={23} y={37} width={5} height={15} fill="#3b4a6b" />
        <rect x={15} y={52} width={7} height={4} fill="#2b1d12" />
        <rect x={22} y={52} width={7} height={4} fill="#2b1d12" />

        {/* lantern */}
        <rect x={38} y={32} width={1} height={4} fill="#2b2b2b" />
        <rect x={35} y={36} width={7} height={2} fill="#3a3a3a" />
        <rect className="px-flicker" x={36} y={38} width={5} height={6} fill="#ffd54a" />
        <rect className="px-flicker" x={37} y={39} width={2} height={3} fill="#fff3b0" style={{ '--delay': '-0.4s' }} />
        <rect x={35} y={38} width={1} height={6} fill="#3a3a3a" />
        <rect x={41} y={38} width={1} height={6} fill="#3a3a3a" />
        <rect x={35} y={44} width={7} height={2} fill="#3a3a3a" />
      </g>

      {/* fireflies drawn to the light */}
      {FIREFLIES.map(([x, y, dur, delay], i) => (
        <rect key={i} className="px-firefly" x={x} y={y} width={1} height={1} fill="#eaff8a" style={{ '--dur': `${dur}s`, '--delay': `${delay}s` }} />
      ))}
    </svg>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch {
        setError('Could not load profile. Please sign in again.');
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    clearTokens();
    navigate('/login');
  };

  const fields = user
    ? [
        { label: 'Full Name', value: user.name, icon: '🧑' },
        { label: 'College Email', value: user.email, icon: '✉️' },
        { label: 'USN / Student ID', value: user.usn, icon: '🪪' },
        { label: 'Phone Number', value: user.phone, icon: '📞' },
        { label: 'Account Role', value: user.role, icon: '🛡️' },
      ]
    : [];

  return (
    <PublicLayout>
      <div className="relative min-h-screen pb-24" style={texture('darkPlanks', 72)}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 sm:pt-14">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div className="inline-block self-start px-panel px-panel--thin px-5 py-3" style={texture('planks', 48)}>
              <p className="font-pixel text-sun text-xs tracking-[0.3em] mb-1">ADVENTURER CARD</p>
              <h1 className="px-title text-cream text-3xl sm:text-4xl tracking-wide">MY PROFILE</h1>
            </div>
            <div className="flex gap-4">
              <Link to={dashboardPathFor(user?.role)} className="px-btn px-btn--wood px-btn--sm">
                <span aria-hidden="true">◂</span> My Dashboard
              </Link>
              <button onClick={handleLogout} className="px-btn px-btn--danger px-btn--sm">Sign Out</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,20rem)_1fr] gap-10 lg:gap-12 items-start">
            {/* The explorer with the lantern */}
            <figure className="mx-auto w-full max-w-[18rem] lg:max-w-none">
              <div className="px-panel p-3" style={texture('planks', 56)}>
                <div className="px-panel--thin overflow-hidden">
                  <LanternExplorer />
                </div>
              </div>
              <figcaption className="mt-4 text-center">
                <span className="font-pixel text-sun text-lg uppercase tracking-wide px-shadow-sm">
                  {user ? user.name : 'Explorer'}
                </span>
                <span className="block font-pixel text-xs uppercase tracking-[0.2em] text-cream/70 mt-1">
                  Lighting the way for a greener campus
                </span>
              </figcaption>
            </figure>

            {/* Details */}
            <div>
              {error && (
                <div className="mb-8 px-panel px-panel--thin p-4 bg-ember text-bark font-semibold flex flex-wrap items-center justify-between gap-4">
                  <span>{error}</span>
                  <Link to="/login" className="px-btn px-btn--wood px-btn--sm">Log in</Link>
                </div>
              )}

              {user ? (
                <div className="px-panel p-6 sm:p-8" style={texture('parchment', 64)}>
                  <h2 className="font-pixel text-2xl uppercase text-bark mb-6">Account Details</h2>
                  <ul className="flex flex-col gap-4">
                    {fields.map(({ label, value, icon }) => (
                      <li key={label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 pb-4 border-b-2 border-dashed border-earth/25 last:border-b-0 last:pb-0">
                        <span className="flex items-center gap-3">
                          <span className="w-9 h-9 shrink-0 bg-forest px-panel--thin flex items-center justify-center text-base" aria-hidden="true">{icon}</span>
                          <span className="font-pixel text-sm uppercase tracking-[0.12em] text-earth">{label}</span>
                        </span>
                        <span className={`font-bold text-bark break-all pl-12 sm:pl-0 sm:text-right ${label === 'Account Role' ? 'capitalize' : ''}`}>
                          {value || '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                !error && (
                  <div className="py-16 flex flex-col items-center gap-4" role="status">
                    <div className="flex gap-2" aria-hidden="true">
                      {[0, 1, 2].map(i => <span key={i} className="w-4 h-4 bg-sun px-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                    <p className="font-pixel text-cream tracking-[0.2em] px-shadow-sm">LOADING PROFILE…</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
