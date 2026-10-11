import { Link } from 'react-router-dom';
import { texture } from '../utils/pixelTextures';

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
  const linkCls = 'hover:text-sun transition-colors';
  const socialCls = 'p-2 px-panel--thin bg-[#2a2622] hover:bg-sun hover:text-bark transition-colors';

  return (
    <footer className="pt-16 pb-8 text-cream/75 border-t-4 border-[#0e0c0a] font-body" style={texture('bedrock', 64)}>
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">

          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="renature"
                style={{ mixBlendMode: 'screen' }}
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-cream/65 max-w-sm">
              Empowering student-led environmental technology, urban reforestation, and verified biodiversity stewardship on campus and beyond.
            </p>
            <div className="flex items-center gap-2 font-pixel text-sm tracking-[0.08em] text-sun/90">
              <span className="inline-block w-2.5 h-2.5 bg-[#86c95e] animate-pulse" />
              Active Campus Movement · NMAMIT Student Guild
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-pixel text-sun tracking-[0.15em] uppercase mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/" className={linkCls}>Home</Link></li>
              <li><Link to="/about" className={linkCls}>About Us</Link></li>
              <li><Link to="/events" className={linkCls}>All Events</Link></li>
              <li><Link to="/leaderboard" className={linkCls}>Leaderboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-pixel text-sun tracking-[0.15em] uppercase mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="/nature" className={linkCls}>Nature Library</Link></li>
              <li><Link to="/contact" className={linkCls}>Contact Team</Link></li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div>
            <h4 className="font-pixel text-sun tracking-[0.15em] uppercase mb-4">Connect</h4>
            <ul className="space-y-3 mb-6">
              <li><Link to="/login" className={linkCls}>Member Sign In</Link></li>
              <li><Link to="/register" className="text-sun hover:text-cream transition-colors font-semibold">Join as Volunteer →</Link></li>
            </ul>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/renature_nmamit/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialCls}>
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/renature-nmamit/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={socialCls}>
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a href="https://x.com/renature_club" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className={socialCls}>
                <TwitterIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t-2 border-dashed border-cream/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cream/50 text-center md:text-left">
          <p>© 2026 renature Environmental Club. Crafted with 💚 for campus sustainability & biodiversity.</p>
          <div className="flex gap-6">
            <span className="hover:text-sun cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-sun cursor-pointer transition-colors">Terms of Stewardship</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
