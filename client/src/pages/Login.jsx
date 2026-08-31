import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { storeTokens } from '../utils/auth';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/renature_nmamit/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/renature-nmamit/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05C21.5 8.59 22 11 22 14.06V21h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.07 0-2.39 1.62-2.39 3.28V21h-4V9Z" />
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: 'https://x.com/renature_club',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.9 3H21l-6.55 7.49L22.5 21h-6.9l-5.4-6.53L3.9 21H1.8l7.02-8.03L1 3h7.05l4.88 5.96L18.9 3Zm-1.2 16.17h1.15L7.4 4.72H6.16L17.7 19.17Z" />
      </svg>
    ),
  },
];

const schema = yup.object().shape({
  collegeEmail: yup.string().email('Must be a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function Login() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setApiError('');
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', data);
      storeTokens({ token: res.data.token, refreshToken: res.data.refreshToken });

      if (res.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/member-dashboard');
      }
    } catch (error) {
      setApiError(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full overflow-hidden flex items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage:
          "url('/IMG_9183.jpeg')",
      }}
    >
      {/* Dark overlay — slightly green-tinted to match the inspo */}
      <div className="absolute inset-0 bg-emerald-950/60" />

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Home</span>
      </Link>

      {/* Card */}
      <div className="relative z-10 flex w-full max-w-4xl rounded-2xl overflow-hidden border border-emerald-800/50 shadow-2xl shadow-black/60">

        {/* Left panel — branding */}
        <div className="hidden md:flex flex-1 flex-col justify-center px-12 py-16 bg-black/30 backdrop-blur-md border-r border-white/10">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Let's Get<br />Started
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Welcome back to Renature. Sign in and keep making our campus greener, one action at a time.
          </p>
        </div>

        {/* Right panel — form */}
        <div className="w-full md:w-[440px] bg-black/70 backdrop-blur-xl px-10 py-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-white mb-8">Sign in</h2>

          {apiError && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40">
              <p className="text-red-400 text-sm text-center">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            {/* Email */}
            <div>
              <input
                {...register('collegeEmail')}
                placeholder="College Email"
                className="w-full bg-transparent border-b border-white/25 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 transition-colors"
              />
              {errors.collegeEmail && (
                <p className="text-red-400 text-xs mt-1.5">{errors.collegeEmail.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                {...register('password')}
                placeholder="Password"
                className="w-full bg-transparent border-b border-white/25 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 transition-colors"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-md font-semibold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* OR divider + socials (optional — wire up if you add OAuth) */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-white/40 text-xs tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          <div className="flex justify-center gap-5">
            {SOCIAL_LINKS.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                title={name}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-white/60 mt-8">
            New here?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}