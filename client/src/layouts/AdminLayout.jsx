import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  Globe, 
  Settings, 
  LogOut,
  Menu,
  X,
  Leaf,
  Users,
  ExternalLink
} from 'lucide-react';
import { clearTokens } from '../utils/auth';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users & Members', icon: Users },
    { to: '/admin/events', label: 'Upcoming Events', icon: Calendar },
    { to: '/admin/leaderboard', label: 'Points & Leaderboard', icon: Trophy },
    { to: '/admin/content', label: 'Website Content (CMS)', icon: Globe },
    { to: '/admin/resources', label: 'Nature Library', icon: Leaf },
    { to: '/admin/settings', label: 'Admin Security & Keys', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#040d0a] text-stone-200 admin-layout overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#071712] border-r border-white/[0.08] transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col justify-between ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-tight block">renature</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Admin Control</span>
              </div>
            </Link>
            <button 
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.05]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all min-h-[44px] ${
                    isActive 
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' 
                      : 'text-stone-400 hover:bg-white/[0.03] hover:text-stone-200 border border-transparent'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/[0.06] space-y-2 bg-[#05110d]/50">
          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
            <div className="font-bold flex items-center gap-1.5 text-xs text-white mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              renature Admin
            </div>
            <div className="text-[10px] text-stone-400 truncate font-mono">renature.nmamit.nitte@gmail.com</div>
          </div>

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3.5 py-2.5 text-stone-400 hover:text-emerald-300 hover:bg-white/[0.03] rounded-xl transition-all text-xs font-medium min-h-[44px]"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all text-xs font-semibold cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#040d0a]">
        
        {/* Topbar for mobile */}
        <header className="lg:hidden flex items-center justify-between p-3.5 sm:p-4 border-b border-white/[0.08] bg-[#071712] min-h-[56px]">
          <div className="flex items-center gap-2.5">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-sm">renature Admin</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-stone-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Open admin menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}
