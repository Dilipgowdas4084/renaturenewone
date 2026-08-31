import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
    setMobileOpen(false); // Close mobile menu on route change
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo - Top Left */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="Renature"
                className="h-14 sm:h-16 w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-10 w-24 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                <span className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">Logo</span>
              </div>
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.label} to={link.to} className="text-sm text-stone-400 hover:text-[#86efac] transition-colors font-medium">
              {link.label}
            </Link>
          ))}
          
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/[0.1]">
            {isAuthed ? (
              <>
                <Link to="/admin" className="text-sm text-stone-300 hover:text-white transition-colors font-medium">Dashboard</Link>
                <button onClick={handleLogout} className="text-sm px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-red-400 font-medium transition-all border border-red-500/20">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-stone-300 hover:text-white transition-colors font-medium">Log in</Link>
                <Link to="/register" className="text-sm px-4 py-2 rounded-lg bg-[#86efac] hover:bg-[#a7f3d0] text-black font-medium transition-all hover:shadow-lg hover:shadow-[#86efac]/20">
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="lg:hidden text-[#86efac] hover:text-[#a7f3d0] transition-colors" 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-xl border-b border-[#86efac]/20 px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} className="text-stone-300 hover:text-[#86efac] py-2 text-lg font-medium transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="pt-6 mt-2 border-t border-white/[0.08] flex flex-col gap-3">
            {isAuthed ? (
              <>
                <Link to="/admin" className="text-center py-3 rounded-lg bg-white/[0.05] text-white font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="text-center py-3 rounded-lg bg-red-500/10 text-red-400 font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-stone-300 py-2 text-center text-lg" onClick={() => setMobileOpen(false)}>Log in</Link>
                <Link to="/register" className="text-center py-3 rounded-lg bg-[#86efac] text-black font-semibold text-lg" onClick={() => setMobileOpen(false)}>Join Now</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
