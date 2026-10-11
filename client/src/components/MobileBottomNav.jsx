import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Trophy, Globe, User, LayoutDashboard } from 'lucide-react';
import { isLoggedIn } from '../utils/auth';
import { texture } from '../utils/pixelTextures';

export default function MobileBottomNav() {
  const location = useLocation();
  const isAuthed = isLoggedIn();

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
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden font-body border-t-4 border-[#1a120b] pb-safe"
      style={texture('darkPlanks', 64)}
    >
      <div className="absolute inset-0 bg-[#1c140c]/65 pointer-events-none" />
      <div className="relative grid grid-cols-5 items-center gap-2 h-16 max-w-lg mx-auto px-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              to={tab.to}
              aria-current={tab.isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center h-12 select-none transition-colors ${
                tab.isActive
                  ? 'bg-[#3a2a1a] text-sun px-panel--thin'
                  : 'text-cream/75 hover:text-sun active:translate-y-0.5'
              }`}
            >
              <Icon className={`w-5 h-5 ${tab.isActive ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
              <span className="font-pixel text-[11px] tracking-[0.06em] uppercase mt-0.5 leading-none px-shadow-sm">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
