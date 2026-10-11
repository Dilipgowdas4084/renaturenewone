import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { isLoggedIn, getCurrentRole, dashboardPathFor, clearTokens } from '../utils/auth';
import { texture } from '../utils/pixelTextures';
import { useDayNight } from '../context/DayNightContext';

function DayNightToggle({ compact = false }) {
  const { night, toggleNight } = useDayNight();
  return (
    <button
      type="button"
      onClick={toggleNight}
      aria-pressed={night}
      aria-label={night ? 'Switch to day (light mode)' : 'Switch to night (dark mode)'}
      title={night ? 'Switch to day' : 'Switch to night'}
      className={`px-btn px-btn--sm ${night ? 'px-btn--sun' : 'px-btn--stone'} ${compact ? '!px-2.5' : ''}`}
    >
      <span aria-hidden="true">{night ? '☀' : '🌙'}</span>
      {!compact && (night ? 'Day' : 'Night')}
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [role, setRole] = useState(null);
  const [logoError, setLogoError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAuthed(isLoggedIn());
    setRole(getCurrentRole());
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
    setRole(null);
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

  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 font-body border-b-4 border-[#1a120b] transition-shadow duration-300 ${scrolled ? 'shadow-[0_6px_0_rgba(0,0,0,0.25)]' : ''}`}
      style={texture('darkPlanks', 64)}
    >
      <div className="absolute inset-0 bg-[#1c140c]/55 pointer-events-none" />
      <div className="relative w-full px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">

        {/* Logos: NITTE first, then renature */}
        <div className="flex items-center shrink-0">
          <img
            src="/nitte-logo.jpg"
            alt="NITTE NMAM Institute of Technology"
            style={{ mixBlendMode: 'screen' }}
            className="hidden sm:block lg:hidden xl:block h-7 w-auto shrink-0 object-contain"
          />
          {/* Divider only shows at the sizes where the NITTE logo is visible */}
          <Link
            to="/"
            className="flex items-center shrink-0 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-dashed sm:border-cream/15 lg:ml-0 lg:pl-0 lg:border-l-0 xl:ml-4 xl:pl-4 xl:border-l-2"
          >
            {!logoError ? (
              <img
                src="/logo.png"
                alt="renature"
                style={{ mixBlendMode: 'screen' }}
                className="h-14 sm:h-16 w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="px-title text-cream text-xl tracking-wide">RENATURE</span>
            )}
          </Link>
        </div>

        {/* Desktop Navigation: centred between the logos and the account controls */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              className={`font-pixel text-sm tracking-[0.08em] uppercase whitespace-nowrap transition-colors px-shadow-sm ${isActive(link.to) ? 'text-sun' : 'text-cream/80 hover:text-sun'}`}
            >
              {isActive(link.to) && <span aria-hidden="true">▸ </span>}{link.label}
            </Link>
          ))}
        </div>

        {/* Desktop account controls, pinned right */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <DayNightToggle />
          {isAuthed ? (
            <>
              <Link to={dashboardPathFor(role)} className="px-btn px-btn--wood px-btn--sm">
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                Dashboard
              </Link>
              <button onClick={handleLogout} className="px-btn px-btn--danger px-btn--sm">
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-pixel text-sm tracking-[0.08em] uppercase whitespace-nowrap text-cream/80 hover:text-sun transition-colors px-shadow-sm">Log in</Link>
              <Link to="/register" className="px-btn px-btn--grass px-btn--sm">
                Join Initiative
              </Link>
            </>
          )}
        </div>

        {/* Mobile: day/night + menu toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <DayNightToggle compact />
          <button
            className="px-btn px-btn--wood px-btn--sm !p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden relative border-t-4 border-[#1a120b] px-6 py-6 space-y-4 max-h-[calc(100dvh-70px)] overflow-y-auto" style={texture('darkPlanks', 64)}>
          <div className="absolute inset-0 bg-[#1c140c]/70 pointer-events-none" />
          <div className="relative flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`font-pixel uppercase tracking-[0.1em] py-2 text-lg transition-colors ${isActive(link.to) ? 'text-sun' : 'text-cream/85 hover:text-sun'}`}
              >
                {isActive(link.to) ? '▸ ' : ''}{link.label}
              </Link>
            ))}
          </div>

          <div className="relative pt-6 mt-2 border-t-2 border-dashed border-cream/15 flex flex-col gap-5">
            {isAuthed ? (
              <>
                <Link to={dashboardPathFor(role)} className="px-btn px-btn--wood w-full" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="px-btn px-btn--danger w-full">
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-btn px-btn--stone w-full" onClick={() => setMobileOpen(false)}>Log in</Link>
                <Link to="/register" className="px-btn px-btn--grass w-full" onClick={() => setMobileOpen(false)}>Join Initiative</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
