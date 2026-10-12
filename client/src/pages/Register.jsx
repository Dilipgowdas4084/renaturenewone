import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { storeTokens } from '../utils/auth';

const schema = yup.object().shape({
  name: yup.string().required('Full Name is required'),
  collegeEmail: yup
    .string()
    .email('Must be a valid email')
    .test('is-nmamit', 'Registration is restricted to NMAMIT institutional email addresses (@nmamit.in)', (val) => {
      if (!val) return false;
      const parts = val.toLowerCase().trim().split('@');
      return parts.length === 2 && parts[1] === 'nmamit.in';
    })
    .required('Email is required'),
  usn: yup.string().required('USN is required'),
  phone: yup.string().required('Phone is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must include an uppercase letter')
    .matches(/[a-z]/, 'Password must include a lowercase letter')
    .matches(/[0-9]/, 'Password must include a number')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\~`;']/, 'Password must include a special character')
    .required('Password is required'),
});

export default function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({ 
    resolver: yupResolver(schema) 
  });

  const onSubmit = async (data) => {
    setApiError('');
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', data);
      storeTokens({ token: res.data.token, refreshToken: res.data.refreshToken });
      
      if (res.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/member-dashboard');
      }
    } catch (error) {
      setApiError(error.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full overflow-hidden flex items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage: "url('/IMG_9279.jpeg')",
      }}
    >
      {/* Dark overlay with green tint to match login */}
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

      {/* Card Container */}
      <div className="relative z-10 flex w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-emerald-800/50 shadow-2xl shadow-black/60">

        {/* Left panel — branding */}
        <div className="hidden md:flex flex-1 flex-col justify-center px-12 py-16 bg-black/30 backdrop-blur-md border-r border-white/10">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Join Our<br />Movement
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Become part of Renature. Register your account and help make our campus greener, one action at a time.
          </p>
        </div>

        {/* Right panel — form (Scrollable if height exceeds screen) */}
        <div className="w-full md:w-[440px] bg-black/70 backdrop-blur-xl px-10 py-10 flex flex-col justify-between overflow-y-auto max-h-[90vh]">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

            {apiError && (
              <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40">
                <p className="text-red-400 text-sm text-center">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div>
                <input 
                  {...register("name")} 
                  placeholder="Full Name"
                  className="w-full bg-transparent border-b border-white/25 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>
                )}
              </div>

              {/* College Email */}
              <div>
                <input 
                  {...register("collegeEmail")} 
                  placeholder="College Email"
                  className="w-full bg-transparent border-b border-white/25 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                />
                {errors.collegeEmail && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.collegeEmail.message}</p>
                )}
              </div>

              {/* USN */}
              <div>
                <input 
                  {...register("usn")} 
                  placeholder="USN"
                  className="w-full bg-transparent border-b border-white/25 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                />
                {errors.usn && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.usn.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <input 
                  {...register("phone")} 
                  placeholder="Phone Number"
                  className="w-full bg-transparent border-b border-white/25 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.phone.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <input 
                  type="password" 
                  {...register("password")} 
                  placeholder="Password (Aa1!, 8+ chars)"
                  className="w-full bg-transparent border-b border-white/25 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-md font-semibold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-white/60 mt-8">
            Already a member?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}