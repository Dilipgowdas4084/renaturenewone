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
    <footer className="bg-black border-t border-white/[0.06] pt-16 pb-8 text-stone-300">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Leaf className="w-8 h-8 text-[#86efac]" />
              <span className="text-2xl font-bold text-white tracking-tight">Renature</span>
            </div>
            <p className="text-stone-400 max-w-sm">
              Empowering students to reconnect with nature through community action, sustainability projects, and outdoor events.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-[#86efac] transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-[#86efac] transition-colors">About</Link></li>
              <li><Link to="/events" className="hover:text-[#86efac] transition-colors">Events</Link></li>
              <li><Link to="/leaderboard" className="hover:text-[#86efac] transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="/nature" className="hover:text-[#86efac] transition-colors">Nature Resources</Link></li>
              <li><Link to="/contact" className="hover:text-[#86efac] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-3 mb-6">
              <li><Link to="/login" className="hover:text-[#86efac] transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-[#86efac] transition-colors">Register</Link></li>
            </ul>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/renature_nmamit/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-[#86efac]/10 hover:text-[#86efac] hover:border-[#86efac]/30 transition-all">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/renature-nmamit/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-[#86efac]/10 hover:text-[#86efac] hover:border-[#86efac]/30 transition-all">
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a href="https://x.com/renature_club" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-[#86efac]/10 hover:text-[#86efac] hover:border-[#86efac]/30 transition-all">
                <TwitterIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
          
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <p>© 2026 Renature Campus Club. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-stone-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-stone-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
