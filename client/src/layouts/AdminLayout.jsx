import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  UserCheck, 
  Award, 
  Trophy, 
  Globe, 
  Settings, 
  LogOut,
  Menu,
  X,
  Leaf
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
    { to: '/admin/events', label: 'Events', icon: Calendar },
    { to: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
    { to: '/admin/attendance', label: 'Attendance', icon: UserCheck },
    { to: '/admin/results', label: 'Results', icon: Award },
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/admin/resources', label: 'Resources', icon: Globe },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-stone-200 admin-layout overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-white/[0.06] transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Leaf className="w-7 h-7 text-[#86efac]" />
            <span className="text-xl font-bold text-white tracking-tight">Admin</span>
          </div>
          <button 
            className="lg:hidden p-1 text-stone-400 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#86efac]/10 text-[#86efac]' 
                    : 'text-stone-400 hover:bg-white/[0.04] hover:text-stone-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar for mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/[0.06] bg-slate-950">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#86efac]" />
            <span className="font-bold text-white">Renature Admin</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-stone-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}
