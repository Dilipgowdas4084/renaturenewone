import { useNavigate, Link } from 'react-router-dom';
import { clearTokens } from '../utils/auth';
import { Leaf, Calendar, Award, User, LogOut, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';

export default function MemberDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#040d0a] text-stone-200 selection:bg-emerald-500/20 selection:text-emerald-300 pb-16 lg:pb-0">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-24">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Member Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Steward Dashboard</h1>
            <p className="text-stone-400 text-xs sm:text-sm mt-1">Track your campus environmental contributions & drive registrations.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/profile"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all min-h-[44px]"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              My Profile
            </Link>
            <button 
              onClick={handleLogout}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer min-h-[44px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-3xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Eco-Points Earned</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">0 <span className="text-sm font-normal text-stone-500">pts</span></div>
            <p className="text-xs text-stone-500">Points credited after drive verification</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Drives Attended</span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">0 <span className="text-sm font-normal text-stone-500">events</span></div>
            <p className="text-xs text-stone-500">Register for events below</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Campus Rank</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">—</div>
            <p className="text-xs text-stone-500">Compete on the campus leaderboard</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Upcoming Events Box */}
          <div className="p-8 rounded-3xl bg-[#091a14]/70 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Upcoming Expeditions</h2>
                  <p className="text-xs text-stone-400">Next scheduled campus sustainability initiatives</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#05110d] border border-white/[0.06] mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Campus Cleanup Drive</span>
                  <span className="text-[11px] text-stone-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/5">This Friday · 4 PM</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  East lakefront & perimeter pathway plastic collection and vegetation monitoring.
                </p>
              </div>
            </div>

            <Link
              to="/events"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-emerald-500/20"
            >
              Browse All Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* My Contributions Box */}
          <div className="p-8 rounded-3xl bg-[#091a14]/70 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">My Activity & Points</h2>
                  <p className="text-xs text-stone-400">Your verified ecological contribution log</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#05110d] border border-white/[0.06] text-center mb-4">
                <p className="text-xs text-stone-400 mb-2">You haven't attended any drives yet.</p>
                <p className="text-[11px] text-stone-500">
                  Participate in campus tree plantation drives and lakefront cleanups to earn certificates and Eco-Points!
                </p>
              </div>
            </div>

            <Link
              to="/leaderboard"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-200 hover:text-white font-semibold text-xs transition-all border border-white/[0.08]"
            >
              Check Leaderboard Standings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
