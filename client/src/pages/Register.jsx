import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { storeTokens } from '../utils/auth';
import { ArrowLeft, User, Mail, Hash, Phone, Lock, ArrowRight, TreePine } from 'lucide-react';

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
  department: yup.string().required('Department is required'),
  year: yup.string().required('Academic Year is required'),
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
    resolver: yupResolver(schema),
    defaultValues: {
      department: 'Computer Science',
      year: '1st Year'
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/register', data);
      storeTokens({ token: res.data.token, refreshToken: res.data.refreshToken });
      
      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
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
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-cover bg-center p-3 sm:p-6 md:p-8 relative selection:bg-emerald-500/20 selection:text-emerald-300 py-8 sm:py-12"
      style={{
        backgroundImage: "url('/IMG_9279.jpeg')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#040d0a]/88 backdrop-blur-sm" />

      {/* Top Header Bar with Home Navigation */}
      <div className="relative z-20 w-full max-w-4xl flex items-center justify-between mb-4 px-1">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition-all bg-[#091a14]/90 hover:bg-[#091a14] backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-semibold uppercase tracking-wider min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Return Home</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">NMAMIT Portal</span>
        </div>
      </div>

      {/* Card Container */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-4xl rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/80 backdrop-blur-2xl">

        {/* Left panel — branding */}
        <div className="hidden md:flex flex-1 flex-col justify-between p-10 lg:p-12 bg-gradient-to-br from-[#0e2c21]/95 via-[#081a13]/95 to-[#05130d]/95 border-r border-emerald-500/15">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
              <TreePine className="w-3.5 h-3.5 text-emerald-400" />
              Join the Ecological Movement
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Join Our <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Community</span>
            </h1>
            <p className="text-stone-200 text-sm leading-relaxed max-w-xs">
              Become part of renature. Create your steward account to register for weekend expeditions and document campus biodiversity.
            </p>
          </div>

          <div className="pt-6 border-t border-white/[0.08] text-xs text-stone-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            NMAMIT Student Environmental Guild
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full md:w-[460px] bg-[#081a14]/95 backdrop-blur-2xl p-6 sm:p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Create Account</h2>
              <p className="text-xs text-stone-400">Register with your college details.</p>
            </div>

            {apiError && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <p className="text-rose-300 text-xs text-center font-medium">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    {...register("name")} 
                    type="text"
                    placeholder="Alex Morgan"
                    className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
                {errors.name && (
                  <p className="text-rose-400 text-[11px] mt-0.5">{errors.name.message}</p>
                )}
              </div>

              {/* College Email */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300">College Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    {...register("collegeEmail")} 
                    type="email"
                    placeholder="student@nmamit.in"
                    className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
                {errors.collegeEmail && (
                  <p className="text-rose-400 text-[11px] mt-0.5">{errors.collegeEmail.message}</p>
                )}
              </div>

              {/* USN & Phone in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300">USN / Roll</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                    <input 
                      {...register("usn")} 
                      type="text"
                      placeholder="4NM22CS001"
                      className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all uppercase"
                    />
                  </div>
                  {errors.usn && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{errors.usn.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                    <input 
                      {...register("phone")} 
                      type="tel"
                      placeholder="+91 9876543210"
                      className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Department & Year in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300">Department</label>
                  <select 
                    {...register("department")} 
                    className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics & Communication">Electronics & Comm.</option>
                    <option value="Mechanical Engineering">Mechanical Eng.</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Information Science">Information Science</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Environmental Sciences">Environmental Sciences</option>
                  </select>
                  {errors.department && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{errors.department.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300">Academic Year</label>
                  <select 
                    {...register("year")} 
                    className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  {errors.year && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{errors.year.message}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="password" 
                    {...register("password")} 
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    className="w-full bg-[#040d0a] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
                {errors.password && (
                  <p className="text-rose-400 text-[11px] mt-0.5">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-[#04110b] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50 mt-3"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Register Member Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Login Link */}
          <p className="text-center text-xs text-stone-400 mt-6 pt-4 border-t border-white/[0.06]">
            Already a member?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
