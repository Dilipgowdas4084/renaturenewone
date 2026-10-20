import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { storeTokens } from '../utils/auth';
import CaveScene from '../components/pixel/CaveScene';
import { texture } from '../utils/pixelTextures';
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

  // ─── Pixel cave UI (presentation only) ───
  const labelCls = 'block font-pixel text-xs tracking-[0.15em] uppercase text-earth mb-2';
  const iconCls = 'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-earth pointer-events-none';
  const inputCls = 'px-input w-full !pl-10';
  const errCls = 'text-[#9c3d33] text-sm font-semibold mt-1.5';

  return (
    <div className="relative min-h-[100dvh] w-full font-body text-cream overflow-x-hidden selection:bg-sun/40 selection:text-bark">
      <CaveScene />

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center p-4 sm:p-6 md:p-8">
        {/* Top bar */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-6">
          <Link to="/" className="px-btn px-btn--stone px-btn--sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-2 font-pixel text-sm uppercase tracking-[0.15em] text-sun px-shadow-sm">
            <span className="w-2 h-2 bg-[#86c95e] animate-pulse" />
            NMAMIT Portal
          </span>
        </div>

        <div className="w-full max-w-5xl flex-1 grid grid-cols-1 md:grid-cols-[1fr_460px] gap-8 items-start md:items-center">

          {/* Left — branding (the explorer walks up below it) */}
          <div className="hidden md:block self-start pt-4">
            <div className="inline-block px-panel px-panel--thin px-6 py-4" style={texture('planks', 48)}>
              <p className="font-pixel text-sun text-xs tracking-[0.3em] mb-1 flex items-center gap-2">
                <TreePine className="w-3.5 h-3.5" />
                JOIN THE ECOLOGICAL MOVEMENT
              </p>
              <h1 className="px-title text-cream text-4xl lg:text-5xl tracking-wide leading-tight">Join Our Community</h1>
            </div>
            <p className="mt-5 text-cream/90 max-w-sm leading-relaxed" style={{ textShadow: '0 2px 0 rgba(0,0,0,0.6)' }}>
              Become part of renature. Create your steward account to register for weekend expeditions and document campus biodiversity.
            </p>
            <p className="mt-5 flex items-center gap-2 font-pixel text-sm uppercase tracking-[0.12em] text-cream/75 px-shadow-sm">
              <span className="w-2 h-2 bg-[#86c95e]" />
              NMAMIT Student Environmental Guild
            </p>
          </div>

          {/* Right — form */}
          <div className="px-panel p-6 sm:p-8" style={texture('parchment', 64)}>
            <div className="mb-6">
              <h2 className="font-pixel text-2xl uppercase text-bark mb-1">Create Account</h2>
              <p className="text-sm text-bark/70">Register with your college details.</p>
            </div>

            {apiError && (
              <div className="mb-5 px-4 py-3 px-panel--thin bg-[#9c3d33] text-cream" role="alert">
                <p className="text-sm text-center font-semibold">⚠ {apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              {/* Full Name */}
              <div>
                <label className={labelCls}>Full Name</label>
                <div className="relative">
                  <User className={iconCls} />
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Alex Morgan"
                    className={inputCls}
                  />
                </div>
                {errors.name && <p className={errCls}>{errors.name.message}</p>}
              </div>

              {/* College Email */}
              <div>
                <label className={labelCls}>College Email</label>
                <div className="relative">
                  <Mail className={iconCls} />
                  <input
                    {...register("collegeEmail")}
                    type="email"
                    placeholder="student@nmamit.in"
                    className={inputCls}
                  />
                </div>
                {errors.collegeEmail && <p className={errCls}>{errors.collegeEmail.message}</p>}
              </div>

              {/* USN & Phone in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>USN / Roll</label>
                  <div className="relative">
                    <Hash className={iconCls} />
                    <input
                      {...register("usn")}
                      type="text"
                      placeholder="4NM22CS001"
                      className={`${inputCls} uppercase`}
                    />
                  </div>
                  {errors.usn && <p className={errCls}>{errors.usn.message}</p>}
                </div>

                <div>
                  <label className={labelCls}>Phone</label>
                  <div className="relative">
                    <Phone className={iconCls} />
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="+91 9876543210"
                      className={inputCls}
                    />
                  </div>
                  {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
                </div>
              </div>

              {/* Department & Year in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Department</label>
                  <select {...register("department")} className="px-input w-full cursor-pointer">
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics & Communication">Electronics & Comm.</option>
                    <option value="Mechanical Engineering">Mechanical Eng.</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Information Science">Information Science</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Environmental Sciences">Environmental Sciences</option>
                  </select>
                  {errors.department && <p className={errCls}>{errors.department.message}</p>}
                </div>

                <div>
                  <label className={labelCls}>Academic Year</label>
                  <select {...register("year")} className="px-input w-full cursor-pointer">
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  {errors.year && <p className={errCls}>{errors.year.message}</p>}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <Lock className={iconCls} />
                  <input
                    type="password"
                    {...register("password")}
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    className={inputCls}
                  />
                </div>
                {errors.password && <p className={errCls}>{errors.password.message}</p>}
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={isLoading} className="px-btn px-btn--grass w-full mt-1">
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Register Member Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-sm text-bark/75 mt-6 pt-5 border-t-2 border-dashed border-earth/30">
              Already a member?{' '}
              <Link to="/login" className="text-forest hover:text-deep font-bold underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
