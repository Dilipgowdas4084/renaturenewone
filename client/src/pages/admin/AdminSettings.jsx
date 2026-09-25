import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Key, Mail, Copy, CheckCircle2, 
  Calendar, Trophy, Globe, Sparkles 
} from 'lucide-react';

const AdminSettings = () => {
  const [copiedField, setCopiedField] = useState('');

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Governance & Access Control
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">System Settings & Admin Access</h1>
        <p className="text-stone-400 text-xs sm:text-sm">Manage administrator security credentials, quick links, and platform telemetry.</p>
      </div>

      {/* Admin Credentials Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#091a14]/90 to-[#06140f]/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Active Administrator Credentials</h2>
            <p className="text-xs text-stone-400">Use these credentials to access all admin controls, events, points, and CMS editors.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Primary Email */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Primary Admin Email
              </div>
              <div className="text-sm font-mono font-bold text-white">renature.nmamit.nitte@gmail.com</div>
            </div>
            <button
              onClick={() => copyToClipboard('renature.nmamit.nitte@gmail.com', 'email1')}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 text-stone-300 hover:text-emerald-300 transition-colors"
              title="Copy Email"
            >
              {copiedField === 'email1' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Admin Password */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Administrator Password
              </div>
              <div className="text-sm font-mono font-bold text-emerald-300">Renature@2026</div>
            </div>
            <button
              onClick={() => copyToClipboard('Renature@2026', 'pass')}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 text-stone-300 hover:text-emerald-300 transition-colors"
              title="Copy Password"
            >
              {copiedField === 'pass' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Secondary Email */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Secondary Admin Email
              </div>
              <div className="text-sm font-mono font-bold text-white">admin@renature.org</div>
            </div>
            <button
              onClick={() => copyToClipboard('admin@renature.org', 'email2')}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 text-stone-300 hover:text-emerald-300 transition-colors"
              title="Copy Secondary Email"
            >
              {copiedField === 'email2' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Role Status */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Access Tier & Privileges
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Super Administrator</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">FULL ACCESS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>These credentials allow you to create/update upcoming events, award points to volunteers, edit the leaderboard, and update the website content (About, Contact, etc.).</span>
        </div>
      </div>

      {/* Admin Fast Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/events"
          className="p-6 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1 block"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
            Manage Upcoming Events
          </h3>
          <p className="text-stone-400 text-xs leading-relaxed">
            Create new drives, edit schedules, update venue locations, and publish status.
          </p>
        </Link>

        <Link
          to="/admin/leaderboard"
          className="p-6 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1 block"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
            Award Points & Leaderboard
          </h3>
          <p className="text-stone-400 text-xs leading-relaxed">
            Grant points to volunteers for field action and directly adjust student ranks.
          </p>
        </Link>

        <Link
          to="/admin/content"
          className="p-6 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1 block"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
            Website Content Manager (CMS)
          </h3>
          <p className="text-stone-400 text-xs leading-relaxed">
            Change About page story, leadership (President/VP), Contact details, and announcements.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminSettings;
