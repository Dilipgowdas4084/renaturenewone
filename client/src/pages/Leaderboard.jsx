import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Trophy, Medal, Award, Filter, Info } from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Science', 'Electrical', 'Biotechnology', 'Chemical', 'Aeronautical', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const SAMPLE_DATA = [
  { rank: 1, full_name: 'Sample Student A', department: 'Computer Science', total_points: 250, events_count: 8 },
  { rank: 2, full_name: 'Sample Student B', department: 'Electronics', total_points: 210, events_count: 7 },
  { rank: 3, full_name: 'Sample Student C', department: 'Mechanical', total_points: 180, events_count: 6 },
  { rank: 4, full_name: 'Sample Student D', department: 'Civil', total_points: 150, events_count: 5 },
  { rank: 5, full_name: 'Sample Student E', department: 'Computer Science', total_points: 140, events_count: 4 },
  { rank: 6, full_name: 'Sample Student F', department: 'Information Science', total_points: 120, events_count: 4 },
  { rank: 7, full_name: 'Sample Student G', department: 'Electrical', total_points: 100, events_count: 3 },
  { rank: 8, full_name: 'Sample Student H', department: 'Biotechnology', total_points: 90, events_count: 3 },
  { rank: 9, full_name: 'Sample Student I', department: 'Mechanical', total_points: 80, events_count: 2 },
  { rank: 10, full_name: 'Sample Student J', department: 'Computer Science', total_points: 70, events_count: 2 },
];

export default function Leaderboard() {
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

      const res = await api.get('/api/leaderboard', { params });
      setLeaders(res.data);
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

  return (
    <PublicLayout>
      <div className="min-h-screen bg-black text-stone-200 pb-24">
        
        {/* ─── Hero Section ─── */}
        <section className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(134,239,172,0.05)_0%,_transparent_50%)]" />
          <div className="relative z-10 w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-[#86efac]" />
          </div>
          <h1 className="relative z-10 text-4xl sm:text-5xl font-bold text-white mb-6">
            Global <span className="text-[#86efac]">Leaderboard</span>
          </h1>
          <p className="relative z-10 text-stone-400 max-w-2xl mx-auto text-lg">
            Recognizing the top contributors making a real impact on our environment.
          </p>
        </section>

        {/* ─── Filters ─── */}
        <section className="max-w-5xl mx-auto px-6 mb-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-2xl p-2 backdrop-blur-xl">
            <div className="flex w-full md:w-auto p-1 bg-black/50 rounded-xl overflow-hidden">
              {['overall', 'department', 'year'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-medium capitalize rounded-lg transition-all ${tab === t ? 'bg-white/10 text-white shadow-sm' : 'text-stone-400 hover:text-stone-300 hover:bg-white/5'}`}
                >
                  By {t}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto px-2 pb-2 md:pb-0">
              {tab === 'department' && (
                <select 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full md:w-auto bg-black/50 border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-stone-200 focus:outline-none focus:border-[#86efac]/50 focus:ring-1 focus:ring-[#86efac]/50 transition-all appearance-none cursor-pointer"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
              {tab === 'year' && (
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full md:w-auto bg-black/50 border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-stone-200 focus:outline-none focus:border-[#86efac]/50 focus:ring-1 focus:ring-[#86efac]/50 transition-all appearance-none cursor-pointer"
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              )}
            </div>
          </div>
        </section>

        {/* ─── Leaderboard Content ─── */}
        <section className="max-w-5xl mx-auto px-6">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-blue-400 text-sm">Showing sample data — real rankings will appear once events are scored.</p>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" color="#86efac" />
            </div>
          ) : leaders.length === 0 ? (
            <EmptyState 
              title="No data available" 
              message="No rankings found for this category yet."
              icon={<Award className="w-12 h-12 text-stone-600" />}
            />
          ) : (
            <>
              {/* Top 3 Podiums */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end">
                {/* Rank 2 (Silver) */}
                {top3[1] && (
                  <div className="order-2 md:order-1 flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-stone-400/10 to-transparent border border-stone-400/20 backdrop-blur-sm relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(ellipse_at_top_right,_rgba(192,192,192,0.2)_0%,_transparent_70%)] rounded-tr-2xl" />
                    <Medal className="w-12 h-12 text-[#C0C0C0] mb-4 drop-shadow-[0_0_15px_rgba(192,192,192,0.5)]" />
                    <h3 className="text-xl font-bold text-white mb-1">{top3[1].full_name}</h3>
                    <p className="text-stone-400 text-sm mb-4">{top3[1].department}</p>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-300 to-stone-500">{top3[1].total_points} <span className="text-sm font-medium text-stone-500">pts</span></div>
                  </div>
                )}
                
                {/* Rank 1 (Gold) */}
                {top3[0] && (
                  <div className="order-1 md:order-2 flex flex-col items-center p-8 rounded-2xl bg-gradient-to-b from-[#FFD700]/15 to-transparent border border-[#FFD700]/30 backdrop-blur-sm relative md:-translate-y-4 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,215,0,0.2)_0%,_transparent_70%)] rounded-tr-2xl pointer-events-none" />
                    <div className="absolute top-0 left-0 w-24 h-24 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,215,0,0.2)_0%,_transparent_70%)] rounded-tl-2xl pointer-events-none" />
                    <Trophy className="w-16 h-16 text-[#FFD700] mb-4 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
                    <h3 className="text-2xl font-bold text-white mb-1 text-center">{top3[0].full_name}</h3>
                    <p className="text-[#FFD700]/80 text-sm mb-6 text-center">{top3[0].department}</p>
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FFD700] to-[#B8860B]">{top3[0].total_points} <span className="text-base font-medium text-[#FFD700]/60">pts</span></div>
                  </div>
                )}

                {/* Rank 3 (Bronze) */}
                {top3[2] && (
                  <div className="order-3 md:order-3 flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-[#CD7F32]/10 to-transparent border border-[#CD7F32]/20 backdrop-blur-sm relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(ellipse_at_top_right,_rgba(205,127,50,0.2)_0%,_transparent_70%)] rounded-tr-2xl" />
                    <Medal className="w-10 h-10 text-[#CD7F32] mb-4 drop-shadow-[0_0_15px_rgba(205,127,50,0.5)]" />
                    <h3 className="text-xl font-bold text-white mb-1">{top3[2].full_name}</h3>
                    <p className="text-stone-400 text-sm mb-4">{top3[2].department}</p>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CD7F32] to-[#8B4513]">{top3[2].total_points} <span className="text-sm font-medium text-stone-500">pts</span></div>
                  </div>
                )}
              </div>

              {/* List */}
              {rest.length > 0 && (
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-stone-500 bg-black/40">
                          <th className="px-6 py-4 font-medium w-16 text-center">Rank</th>
                          <th className="px-6 py-4 font-medium">Name</th>
                          <th className="px-6 py-4 font-medium hidden sm:table-cell">Department</th>
                          <th className="px-6 py-4 font-medium text-right">Events</th>
                          <th className="px-6 py-4 font-medium text-right text-[#86efac]">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {rest.map((student, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 text-center font-bold text-stone-500">{student.rank}</td>
                            <td className="px-6 py-4 font-medium text-stone-200">
                              {student.full_name}
                              <div className="sm:hidden text-xs text-stone-500 mt-1">{student.department}</div>
                            </td>
                            <td className="px-6 py-4 text-stone-400 hidden sm:table-cell text-sm">{student.department}</td>
                            <td className="px-6 py-4 text-stone-400 text-right text-sm">{student.events_count}</td>
                            <td className="px-6 py-4 font-bold text-white text-right">{student.total_points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

      </div>
    </PublicLayout>
  );
}
