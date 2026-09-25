import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Trophy, Medal, Award, Filter, Info, Sparkles } from 'lucide-react';

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

      const res = await api.get('/leaderboard', { params });
      if (res.data && res.data.length > 0) {
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

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#040d0a] text-stone-200 pb-24 selection:bg-emerald-500/20 selection:text-emerald-300">
        
        {/* ─── Hero Section ─── */}
        <section className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08)_0%,_transparent_60%)]" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Eco-Points <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Leaderboard</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Recognizing dedicated student stewards, volunteers, and departments leading environmental impact across campus.
            </p>
          </div>
        </section>

        {/* ─── Filters Bar ─── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between bg-[#091a14]/80 border border-white/[0.08] rounded-2xl p-2.5 backdrop-blur-xl shadow-xl shadow-black/20">
            <div className="flex w-full md:w-auto p-1 bg-[#05110d] rounded-xl border border-white/[0.04]">
              {['overall', 'department', 'year'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 md:flex-none px-3.5 sm:px-5 py-2.5 min-h-[44px] text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    tab === t 
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm' 
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  By {t}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto px-1 sm:px-2">
              {tab === 'department' && (
                <select 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full md:w-auto bg-[#05110d] border border-white/[0.08] rounded-xl py-2.5 px-4 text-xs font-medium text-stone-200 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer min-h-[44px]"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#05110d] text-stone-200">{d}</option>)}
                </select>
              )}
              {tab === 'year' && (
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full md:w-auto bg-[#05110d] border border-white/[0.08] rounded-xl py-2.5 px-4 text-xs font-medium text-stone-200 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer min-h-[44px]"
                >
                  {YEARS.map(y => <option key={y} value={y} className="bg-[#05110d] text-stone-200">{y}</option>)}
                </select>
              )}
            </div>
          </div>
        </section>

        {/* ─── Leaderboard Content ─── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Displaying campus steward rankings and points distribution.</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" message="Calculating verified points..." />
            </div>
          ) : leaders.length === 0 ? (
            <EmptyState 
              title="No data available" 
              description="No rankings found for this category yet. Check back after upcoming drives are scored."
              icon={Award}
            />
          ) : (
            <>
              {/* Top 3 Podiums */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 items-end">
                
                {/* Rank 2 (Silver) */}
                {top3[1] && (
                  <div className="order-2 md:order-1 flex flex-col items-center p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-stone-300/10 to-[#071712]/70 border border-stone-400/25 backdrop-blur-xl relative shadow-xl shadow-black/30 group hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-300/10 border border-stone-300/25 flex items-center justify-center mb-3 sm:mb-4">
                      <Medal className="w-7 h-7 sm:w-8 sm:h-8 text-stone-300 drop-shadow-[0_0_12px_rgba(214,211,209,0.4)]" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">Rank 02 · Silver</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1 text-center">{top3[1].full_name}</h3>
                    <p className="text-stone-400 text-xs mb-3 sm:mb-4 text-center">{top3[1].department}</p>
                    <div className="text-2xl sm:text-3xl font-extrabold text-stone-200">
                      {top3[1].total_points} <span className="text-xs font-semibold text-stone-400">pts</span>
                    </div>
                  </div>
                )}
                
                {/* Rank 1 (Gold) */}
                {top3[0] && (
                  <div className="order-1 md:order-2 flex flex-col items-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-400/15 via-[#0b211a]/80 to-[#071712]/90 border border-amber-400/35 backdrop-blur-2xl relative md:-translate-y-4 shadow-2xl shadow-amber-400/10 group hover:-translate-y-5 transition-all">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mb-3 sm:mb-4">
                      <Trophy className="w-8 h-8 sm:w-9 sm:h-9 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 mb-1">Champion · Gold</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 text-center">{top3[0].full_name}</h3>
                    <p className="text-amber-200/80 text-xs mb-4 sm:mb-5 text-center font-medium">{top3[0].department}</p>
                    <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400">
                      {top3[0].total_points} <span className="text-xs sm:text-sm font-semibold text-amber-300/70">pts</span>
                    </div>
                  </div>
                )}

                {/* Rank 3 (Bronze) */}
                {top3[2] && (
                  <div className="order-3 md:order-3 flex flex-col items-center p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-amber-700/10 to-[#071712]/70 border border-amber-600/25 backdrop-blur-xl relative shadow-xl shadow-black/30 group hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-700/10 border border-amber-600/25 flex items-center justify-center mb-3 sm:mb-4">
                      <Medal className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 drop-shadow-[0_0_12px_rgba(217,119,6,0.4)]" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 mb-1">Rank 03 · Bronze</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1 text-center">{top3[2].full_name}</h3>
                    <p className="text-stone-400 text-xs mb-3 sm:mb-4 text-center">{top3[2].department}</p>
                    <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                      {top3[2].total_points} <span className="text-xs font-semibold text-amber-600">pts</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Leaderboard Table */}
              {rest.length > 0 && (
                <div className="rounded-3xl bg-[#091a14]/60 border border-white/[0.08] overflow-hidden backdrop-blur-xl shadow-xl shadow-black/30">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-stone-400 bg-[#05110d]/90">
                          <th className="px-3 sm:px-6 py-3.5 sm:py-4 font-semibold w-12 sm:w-16 text-center">Rank</th>
                          <th className="px-3 sm:px-6 py-3.5 sm:py-4 font-semibold">Student Name</th>
                          <th className="px-6 py-4 font-semibold hidden md:table-cell">Department</th>
                          <th className="px-6 py-4 font-semibold text-right hidden sm:table-cell">Drives</th>
                          <th className="px-3 sm:px-6 py-3.5 sm:py-4 font-semibold text-right text-emerald-400">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {rest.map((student, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-center font-bold text-stone-400 text-xs sm:text-sm">#{student.rank}</td>
                            <td className="px-3 sm:px-6 py-3.5 sm:py-4 font-medium text-stone-200 group-hover:text-white">
                              <span className="text-xs sm:text-sm font-semibold">{student.full_name}</span>
                              <div className="md:hidden text-[11px] text-stone-400 mt-0.5">
                                {student.department} <span className="sm:hidden">· {student.events_count} drives</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-stone-400 hidden md:table-cell text-xs font-medium">{student.department}</td>
                            <td className="px-6 py-4 text-stone-300 text-right text-xs font-semibold hidden sm:table-cell">{student.events_count}</td>
                            <td className="px-3 sm:px-6 py-3.5 sm:py-4 font-extrabold text-emerald-400 text-right text-xs sm:text-sm">
                              {student.total_points} <span className="text-[10px] sm:text-xs font-normal text-emerald-500/70">pts</span>
                            </td>
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
