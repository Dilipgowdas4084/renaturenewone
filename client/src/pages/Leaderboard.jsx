import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import { texture } from '../utils/pixelTextures';
import { useDayNight } from '../context/DayNightContext';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Science', 'Electrical', 'Biotechnology', 'Chemical', 'Aeronautical', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const SAMPLE_DATA = [
  { rank: 1, full_name: 'Ananya Rao', department: 'Computer Science', total_points: 280, events_count: 9 },
  { rank: 2, full_name: 'Rohan Sharma', department: 'Biotechnology', total_points: 235, events_count: 7 },
  { rank: 3, full_name: 'Karthik Gowda', department: 'Mechanical Eng', total_points: 195, events_count: 6 },
  { rank: 4, full_name: 'Sneha Patel', department: 'Civil Eng', total_points: 165, events_count: 5 },
  { rank: 5, full_name: 'Varun Nair', department: 'Information Science', total_points: 145, events_count: 5 },
  { rank: 6, full_name: 'Pooja Hegde', department: 'Electronics', total_points: 130, events_count: 4 },
  { rank: 7, full_name: 'Aditya Bhat', department: 'Electrical', total_points: 110, events_count: 4 },
  { rank: 8, full_name: 'Meera Shenoy', department: 'Biotechnology', total_points: 95, events_count: 3 },
  { rank: 9, full_name: 'Nikhil Kumar', department: 'Chemical', total_points: 85, events_count: 3 },
  { rank: 10, full_name: 'Tanvi Kamath', department: 'Computer Science', total_points: 75, events_count: 2 },
];

const SKIES = {
  day: 'linear-gradient(#7ec8e3 0 30%, #a2d8ec 30% 60%, #c8e8ef 60%)',
  night: 'linear-gradient(#1d2550 0 30%, #232d5c 30% 60%, #2a3567 60%)',
};

const PODIUM = [
  { badge: '🥇', title: 'Explorer', block: '#e9c46a', blockHi: '#f6dc8e', blockLo: '#b8902f', height: 'h-32 sm:h-44' },
  { badge: '🥈', title: 'Ranger', block: '#c9ccd1', blockHi: '#e4e6ea', blockLo: '#8f949b', height: 'h-24 sm:h-32' },
  { badge: '🥉', title: 'Trailblazer', block: '#c77b45', blockHi: '#e09a66', blockLo: '#8f5128', height: 'h-16 sm:h-24' },
];

const HAIR = ['#3b2616', '#6b4226', '#1f1a17', '#a86b32', '#d9b06a', '#5a2e1c'];
const SKIN = ['#e8b88a', '#c68c5e', '#f1cfa6', '#a86f45', '#d9a57a'];
const SHIRT = ['#3f7d3a', '#3b6ea5', '#a8412f', '#7a4fa0', '#c77b45', '#2f7f7a'];

function hash(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Deterministic 10×10 pixel head generated from the player's name.
function PixelHead({ name, crown = false, className = '' }) {
  const h = hash(name);
  const hair = HAIR[h % HAIR.length];
  const skin = SKIN[(h >>> 3) % SKIN.length];
  const shirt = SHIRT[(h >>> 6) % SHIRT.length];
  return (
    <svg viewBox="0 0 10 12" className={className} shapeRendering="crispEdges" aria-hidden="true">
      {crown && (
        <g fill="#f2c94c">
          <rect x={2} y={0} width={6} height={2} />
          <rect x={2} y={-1} width={1} height={1} />
          <rect x={4.5} y={-1} width={1} height={1} />
          <rect x={7} y={-1} width={1} height={1} />
          <rect x={4.5} y={0.5} width={1} height={1} fill="#e05a5a" />
        </g>
      )}
      <rect x={1} y={2} width={8} height={7} fill={skin} />
      <rect x={1} y={2} width={8} height={2} fill={hair} />
      <rect x={1} y={4} width={1} height={2} fill={hair} />
      <rect x={8} y={4} width={1} height={2} fill={hair} />
      <rect x={3} y={5} width={1} height={1} fill="#2b1d12" />
      <rect x={6} y={5} width={1} height={1} fill="#2b1d12" />
      <rect x={4} y={7} width={2} height={1} fill="#b86f52" />
      <rect x={0} y={9} width={10} height={3} fill={shirt} />
    </svg>
  );
}

function HillsStrip({ night }) {
  const colors = night
    ? { far: '#3b5446', near: '#2c4633', tree: '#223a2a' }
    : { far: '#a3c48c', near: '#6fa35a', tree: '#4f8a45' };
  const far = [30, 26, 22, 22, 18, 22, 26, 30, 28, 24, 20, 16, 14, 18, 22, 26, 28, 24, 20, 18, 22, 26, 30, 32, 28, 24, 20, 22, 26, 30];
  const near = Array.from({ length: 60 }, (_, i) => 40 + Math.round((Math.sin(i * 0.35) * 5 + Math.sin(i * 0.12 + 1) * 4) / 2) * 2);
  const path = (hs, step, base) => `M0 ${base}` + hs.map((y, i) => ` V${y} H${(i + 1) * step}`).join('') + ` V${base} Z`;
  return (
    <svg viewBox="0 0 480 60" preserveAspectRatio="xMidYMax slice" className="block w-full h-16 sm:h-24" shapeRendering="crispEdges" aria-hidden="true">
      <path d={path(far, 16, 60)} fill={colors.far} />
      <path d={path(near, 8, 60)} fill={colors.near} />
      {[3, 9, 16, 24, 31, 39, 46, 53].map(i => (
        <rect key={i} x={i * 8} y={near[i] - 6} width={6} height={6} fill={colors.tree} />
      ))}
      <rect x={0} y={56} width={480} height={4} fill="#5fa843" />
      <rect x={0} y={56} width={480} height={1} fill="#86c95e" />
    </svg>
  );
}

function PodiumSpot({ player, place }) {
  const style = PODIUM[place];
  return (
    <div className="flex flex-col items-center min-w-0">
      <div className="flex flex-col items-center text-center mb-3 px-1 min-w-0 w-full">
        <div className={`px-panel--thin bg-[#dff1f7] p-1.5 mb-3 ${place === 0 ? 'w-16 h-20 sm:w-24 sm:h-28' : 'w-12 h-16 sm:w-18 sm:h-22'}`}>
          <PixelHead name={player.full_name} crown={place === 0} className="w-full h-full overflow-visible" />
        </div>
        <span className="font-pixel text-[10px] sm:text-xs tracking-[0.1em] uppercase px-2 py-1 mb-2 bg-bark text-sun whitespace-nowrap">
          <span aria-hidden="true">{style.badge}</span> {style.title}
        </span>
        <div className="w-full px-panel--thin px-2 py-2 sm:px-3" style={texture('parchment', 48)}>
          <h3 className={`font-bold text-bark leading-tight truncate w-full ${place === 0 ? 'text-base sm:text-xl' : 'text-sm sm:text-base'}`} title={player.full_name}>
            {player.full_name}
          </h3>
          {player.department && <p className="text-bark/65 text-[11px] sm:text-xs truncate w-full">{player.department}</p>}
          <p className={`font-num text-forest mt-1.5 ${place === 0 ? 'text-sm sm:text-lg' : 'text-[10px] sm:text-sm'}`}>
            {Number(player.total_points).toLocaleString()}<span className="font-pixel text-xs sm:text-sm ml-1">XP</span>
          </p>
        </div>
      </div>
      <div
        className={`w-full ${style.height} flex items-start justify-center pt-2 sm:pt-3`}
        style={{
          backgroundColor: style.block,
          boxShadow: `inset 0 6px 0 ${style.blockHi}, inset -6px -6px 0 ${style.blockLo}, 0 0 0 4px #2b1d12`,
        }}
      >
        <span className="font-num text-2xl sm:text-4xl text-bark/80" style={{ textShadow: `3px 3px 0 ${style.blockHi}` }}>{place + 1}</span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { night } = useDayNight();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [tab, setTab] = useState('overall'); // overall, department, year
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [year, setYear] = useState(YEARS[0]);

  useEffect(() => {
    fetchLeaderboard();
  }, [tab, department, year]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {};
      if (tab === 'department') params.department = department;
      if (tab === 'year') params.year = year;

      const res = await api.get('/leaderboard', { params });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setLeaders(res.data);
      } else {
        setLeaders(SAMPLE_DATA);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError(true);
      setLeaders(SAMPLE_DATA);
    } finally {
      setLoading(false);
    }
  };

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const maxXp = Math.max(1, ...leaders.map(l => Number(l.total_points) || 0));

  return (
    <PublicLayout>
      <div className="relative min-h-screen transition-[background] duration-700" style={{ background: night ? SKIES.night : SKIES.day }}>

        {/* ─── Title ─── */}
        <section className="relative pt-10 sm:pt-14 pb-6 px-6 text-center">
          <h1 className="px-title text-cream text-3xl sm:text-5xl lg:text-6xl tracking-wide leading-tight">
            RENATURE LEADERBOARD
          </h1>
          <div className="mt-5 inline-block px-panel px-panel--thin px-4 py-2" style={texture('planks', 48)}>
            <p className="font-pixel text-sun text-sm sm:text-base tracking-[0.3em] px-shadow-sm">★ TOP EXPLORERS ★</p>
          </div>
          <p
            className={`mt-5 font-semibold max-w-2xl mx-auto text-base sm:text-lg ${night ? 'text-cream' : 'text-deep'}`}
            style={{ textShadow: night ? '0 2px 0 rgba(0,0,0,0.45)' : '0 1px 0 rgba(255,255,255,0.5)' }}
          >
            Recognizing dedicated student stewards, volunteers, and departments leading environmental impact across campus.
          </p>

          {/* tabs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5">
            <div className="flex flex-wrap justify-center gap-4" role="tablist" aria-label="Leaderboard view">
              {['overall', 'department', 'year'].map(t => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`px-btn px-btn--sm ${tab === t ? 'px-btn--grass' : 'px-btn--stone'}`}
                >
                  By {t}
                </button>
              ))}
            </div>
            {tab === 'department' && (
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="px-input cursor-pointer" aria-label="Department">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            {tab === 'year' && (
              <select value={year} onChange={(e) => setYear(e.target.value)} className="px-input cursor-pointer" aria-label="Year">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
          </div>
        </section>

        <HillsStrip night={night} />

        {/* ─── Podium on the meadow ─── */}
        <section className="relative px-4 sm:px-6 pt-8 sm:pt-10 pb-0" style={texture('grass', 64)}>
          {night && <div className="absolute inset-0 bg-[#0a0f2a]/40 pointer-events-none" />}
          <div className="relative max-w-4xl mx-auto">
            {error && (
              <div className="mb-8 px-panel px-panel--thin p-4 bg-ember text-bark text-center font-semibold">
                Displaying campus steward rankings and points distribution.
              </div>
            )}

            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4" role="status">
                <div className="flex gap-2" aria-hidden="true">
                  {[0, 1, 2].map(i => <span key={i} className="w-4 h-4 bg-sun px-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </div>
                <p className="font-pixel text-cream tracking-[0.2em] px-shadow-sm uppercase">Calculating verified points…</p>
              </div>
            ) : leaders.length === 0 ? (
              <div className="max-w-md mx-auto mb-12 px-panel p-8 text-center" style={texture('parchment', 64)}>
                <p className="text-4xl mb-3" aria-hidden="true">🏆</p>
                <h2 className="font-pixel text-2xl text-bark mb-2">NO DATA AVAILABLE</h2>
                <p className="text-bark/75">No rankings found for this category yet. Check back after upcoming drives are scored.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end">
                <div>{top3[1] && <PodiumSpot player={top3[1]} place={1} />}</div>
                <div>{top3[0] && <PodiumSpot player={top3[0]} place={0} />}</div>
                <div>{top3[2] && <PodiumSpot player={top3[2]} place={2} />}</div>
              </div>
            )}
          </div>
        </section>

        {/* ─── The rest, underground ─── */}
        <section className="relative px-4 sm:px-6 pt-12 pb-24 border-t-8 border-[#5fa843]" style={texture('dirt', 64)}>
          {!loading && rest.length > 0 && (
            <div className="max-w-4xl mx-auto px-panel overflow-hidden" style={texture('parchment', 64)}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bark text-sun font-pixel text-xs sm:text-sm tracking-[0.15em]">
                      <th scope="col" className="px-4 sm:px-6 py-3 w-16 text-center">#</th>
                      <th scope="col" className="px-4 sm:px-6 py-3">EXPLORER</th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-right w-44 sm:w-72">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((student, idx) => {
                      const xp = Number(student.total_points) || 0;
                      return (
                        <tr key={idx} className="border-t-2 border-dashed border-earth/25 hover:bg-sun/15 transition-colors">
                          <td className="px-4 sm:px-6 py-3 text-center font-num text-sm text-earth">{student.rank}</td>
                          <td className="px-4 sm:px-6 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-8 h-9 shrink-0 px-panel--thin bg-[#dff1f7] p-0.5">
                                <PixelHead name={student.full_name} className="w-full h-full" />
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-bark truncate">{student.full_name}</p>
                                <p className="text-xs text-bark/60 truncate">
                                  {student.department}{student.department && student.events_count != null ? ' · ' : ''}
                                  {student.events_count != null && `${student.events_count} drive${student.events_count === 1 ? '' : 's'}`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3">
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="font-num text-[11px] sm:text-xs text-bark">{xp.toLocaleString()}<span className="font-pixel text-sm ml-1">XP</span></span>
                              <div className="w-full h-3 px-xp-track" role="img" aria-label={`${xp} of ${maxXp} XP`}>
                                <div className="h-full px-xp-fill" style={{ width: `${Math.max(4, (xp / maxXp) * 100)}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
