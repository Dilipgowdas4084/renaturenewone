import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, Sparkles, LayoutDashboard, LogOut } from 'lucide-react';
import { getValidAccessToken, clearTokens } from '../utils/auth';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAuthed(!!getValidAccessToken());
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    clearTokens();
    setIsAuthed(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Events', to: '/events' },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'Nature', to: '/nature' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#061912]/90 backdrop-blur-xl border-b border-emerald-500/15 shadow-xl shadow-black/25' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center">
          <Link to="/" className="group flex items-center gap-2.5 sm:gap-3">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="renature"
                style={{ mixBlendMode: 'screen' }}
                className="h-9 sm:h-12 w-auto object-contain mix-blend-screen transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_8px_rgba(52,211,153,0.3)]"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-emerald-500/10">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                re<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">nature</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-emerald-400/80 font-bold -mt-0.5">
                NMAMIT Eco-Initiative
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 bg-black/20 p-1.5 rounded-full border border-white/[0.06] backdrop-blur-md">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link 
                key={link.label} 
                to={link.to} 
                className={`relative px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'text-emerald-200 bg-emerald-500/20 border border-emerald-500/30 shadow-sm shadow-emerald-500/15 font-semibold' 
                    : 'text-stone-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        
        {/* Right CTA / Auth controls */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthed ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/[0.08]">
              <Link 
                to="/admin" 
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/25 transition-all shadow-sm shadow-emerald-500/10"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                Dashboard
              </Link>
              <button 
                onClick={handleLogout} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-full text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="text-xs font-semibold text-stone-200 hover:text-white px-4 py-2.5 rounded-full hover:bg-white/[0.06] transition-colors"
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className="group relative inline-flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-[#04110b] shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#04110b]" />
                Join Initiative
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="lg:hidden p-2.5 rounded-xl text-stone-300 hover:text-emerald-400 hover:bg-white/[0.06] transition-all border border-white/[0.08] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer" 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6 text-emerald-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#05110d]/98 backdrop-blur-2xl border-b border-emerald-500/20 px-4 sm:px-6 py-6 space-y-4 shadow-2xl transition-all max-h-[calc(100dvh-70px)] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link 
                  key={link.label} 
                  to={link.to} 
                  onClick={() => setMobileOpen(false)} 
                  className={`flex items-center py-3 px-4 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-stone-300 hover:text-emerald-300 hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          
          <div className="pt-4 mt-2 border-t border-white/[0.08] flex flex-col gap-2.5">
            {isAuthed ? (
              <>
                <Link 
                  to="/admin" 
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-semibold border border-white/[0.08] min-h-[44px]" 
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500/10 text-red-300 text-sm font-semibold border border-red-500/20 min-h-[44px] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/login" 
                  className="text-stone-300 hover:text-white py-3 text-center text-sm font-semibold rounded-xl bg-white/[0.05] border border-white/[0.08] min-h-[44px] flex items-center justify-center" 
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="text-center py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#04110b] font-bold text-sm shadow-lg shadow-emerald-500/20 min-h-[44px] flex items-center justify-center" 
                  onClick={() => setMobileOpen(false)}
                >
                  Join Initiative
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
