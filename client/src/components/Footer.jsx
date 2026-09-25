import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
);
const LinkedinIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05C21.5 8.59 22 11 22 14.06V21h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.07 0-2.39 1.62-2.39 3.28V21h-4V9Z" /></svg>
);
const TwitterIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.9 3H21l-6.55 7.49L22.5 21h-6.9l-5.4-6.53L3.9 21H1.8l7.02-8.03L1 3h7.05l4.88 5.96L18.9 3Zm-1.2 16.17h1.15L7.4 4.72H6.16L17.7 19.17Z" /></svg>
);

export default function Footer() {
  return (
    <footer className="relative bg-[#040f0b] border-t border-emerald-500/15 pt-14 sm:pt-20 pb-12 text-stone-300 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-emerald-500/[0.06] blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-12 sm:mb-16">
          
          {/* Brand info */}
          <div className="sm:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-400/10 border border-emerald-400/30 flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-emerald-500/15">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                re<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">nature</span>
              </span>
            </Link>
            <p className="text-stone-300 text-sm max-w-sm leading-relaxed">
              Empowering student-led environmental technology, urban reforestation, and verified biodiversity stewardship on campus and beyond.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-300/90 font-medium">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              Active Campus Movement · NMAMIT Student Guild
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400/90 mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-stone-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 group py-1">Home</Link></li>
              <li><Link to="/about" className="text-stone-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 group py-1">About Us</Link></li>
              <li><Link to="/events" className="text-stone-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 group py-1">All Events</Link></li>
              <li><Link to="/leaderboard" className="text-stone-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 group py-1">Leaderboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400/90 mb-4">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/nature" className="text-stone-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 group py-1">Nature Library</Link></li>
              <li><Link to="/contact" className="text-stone-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 group py-1">Contact Team</Link></li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400/90 mb-4">Connect</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li><Link to="/login" className="text-stone-300 hover:text-emerald-300 transition-colors font-medium py-1 inline-block">Member Sign In</Link></li>
              <li><Link to="/register" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold flex items-center gap-1 py-1">Join as Volunteer →</Link></li>
            </ul>
            <div className="flex items-center gap-2.5">
              <a 
                href="https://instagram.com/renature_nmamit/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 transition-all duration-200 flex items-center justify-center min-h-[44px] min-w-[44px]"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com/company/renature-nmamit/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LinkedIn"
                className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 transition-all duration-200 flex items-center justify-center min-h-[44px] min-w-[44px]"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://x.com/renature_club" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter"
                className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 transition-all duration-200 flex items-center justify-center min-h-[44px] min-w-[44px]"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
          
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 sm:pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400 text-center md:text-left">
          <p>© 2026 renature Environmental Club. Crafted with 💚 for campus sustainability & biodiversity.</p>
          <div className="flex gap-6">
            <span className="hover:text-stone-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-stone-300 cursor-pointer transition-colors">Terms of Stewardship</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
