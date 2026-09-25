import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Trophy, Globe, User, LayoutDashboard } from 'lucide-react';
import { getValidAccessToken } from '../utils/auth';

export default function MobileBottomNav() {
  const location = useLocation();
  const isAuthed = !!getValidAccessToken();

  // If in admin panel, don't show the public bottom bar
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const accountDestination = isAuthed ? '/profile' : '/login';
  const isAccountActive = isAuthed 
    ? location.pathname === '/profile' || location.pathname === '/member-dashboard'
    : location.pathname === '/login' || location.pathname === '/register';

  const tabs = [
    { label: 'Home', to: '/', icon: Home, isActive: location.pathname === '/' },
    { label: 'Events', to: '/events', icon: Calendar, isActive: location.pathname.startsWith('/events') },
    { label: 'Rankings', to: '/leaderboard', icon: Trophy, isActive: location.pathname === '/leaderboard' },
    { label: 'Nature', to: '/nature', icon: Globe, isActive: location.pathname === '/nature' },
    { 
      label: isAuthed ? 'Profile' : 'Account', 
      to: accountDestination, 
      icon: isAuthed ? (location.pathname === '/admin' ? LayoutDashboard : User) : User, 
      isActive: isAccountActive 
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#061812]/92 backdrop-blur-2xl border-t border-emerald-500/20 shadow-2xl shadow-black pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              to={tab.to}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all duration-200 select-none ${
                tab.isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 active:scale-95'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    tab.isActive ? 'scale-110 text-emerald-400 stroke-[2.2]' : 'text-stone-400 stroke-[1.8]'
                  }`} 
                />
                {tab.isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 transition-colors ${
                tab.isActive ? 'text-emerald-300 font-bold' : 'text-stone-400'
              }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
