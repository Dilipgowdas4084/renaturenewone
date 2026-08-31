import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { getValidAccessToken } from '../utils/auth';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getValidAccessToken();
        const res = await axios.get('http://localhost:5000/api/auth/me', {
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
        ['Name', user.name],
        ['Email', user.email],
        ['USN', user.usn],
        ['Phone', user.phone],
        ['Role', user.role],
      ]
    : [];

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-200 px-6 py-24">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-400/70 hover:text-emerald-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-300/80" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-emerald-300/90 tracking-tight">My Profile</h1>
            <p className="text-slate-500 text-sm">Your account details</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {user ? (
          <div className="rounded-2xl bg-emerald-950/30 border border-emerald-900/30 divide-y divide-white/[0.04]">
            {fields.map(([label, value]) => (
              <div key={label} className="flex justify-between px-6 py-4">
                <span className="text-slate-500 text-sm">{label}</span>
                <span className="text-slate-200 font-medium capitalize">{value || '—'}</span>
              </div>
            ))}
          </div>
        ) : (
          !error && <p className="text-slate-500">Loading…</p>
        )}
      </div>
    </div>
  );
}
