import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Hash, Phone, Shield } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { getValidAccessToken } from '../utils/auth';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getValidAccessToken();
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch {
        setError('Could not load profile. Please sign in again.');
      }
    };
    fetchProfile();
  }, []);

  const fields = user
    ? [
        { label: 'Full Name', value: user.name, icon: User },
        { label: 'College Email', value: user.email, icon: Mail },
        { label: 'USN / Student ID', value: user.usn, icon: Hash },
        { label: 'Phone Number', value: user.phone, icon: Phone },
        { label: 'Account Role', value: user.role, icon: Shield },
      ]
    : [];

  return (
    <div className="relative min-h-screen w-full bg-[#040d0a] text-stone-200 selection:bg-emerald-500/20 selection:text-emerald-300 pb-16 lg:pb-0">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-24">
        <Link 
          to="/member-dashboard" 
          className="inline-flex items-center gap-2 text-stone-400 hover:text-emerald-400 mb-6 sm:mb-8 transition-colors text-xs font-semibold uppercase tracking-wider bg-white/[0.04] px-3.5 py-2 rounded-full border border-white/[0.06] min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3.5 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <User className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Account Details</h1>
            <p className="text-stone-400 text-xs">Verified steward identity & credentials</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
            <p className="text-rose-300 text-xs">{error}</p>
          </div>
        )}

        {user ? (
          <div className="rounded-3xl bg-[#091a14]/70 border border-white/[0.08] backdrop-blur-xl shadow-xl shadow-black/30 divide-y divide-white/[0.04] overflow-hidden">
            {fields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 gap-1 sm:gap-0">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-stone-400 text-xs font-medium uppercase tracking-wider">{label}</span>
                </div>
                <span className="text-white text-xs sm:text-sm font-semibold capitalize break-all pl-6 sm:pl-0">{value || '—'}</span>
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <div className="rounded-3xl bg-[#091a14]/60 border border-white/[0.08] p-8 text-center text-stone-500 text-sm">
              Loading profile details...
            </div>
          )
        )}
      </main>
      <MobileBottomNav />
    </div>
  );
}
