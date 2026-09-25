import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Science', 'Electrical', 'Biotechnology', 'Chemical', 'Aeronautical', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function EventRegister() {
  const { id } = useParams();
  const [eventTitle, setEventTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    email: '',
    phone: '',
    department: '',
    year: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [refId, setRefId] = useState('');
  
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailWarning, setEmailWarning] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEventTitle(res.data.title);
      } catch (err) {
        console.warn('Could not load event title:', err.message);
        setEventTitle('Campus Environmental Drive');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'email') setEmailWarning('');
  };

  const handleEmailBlur = async () => {
    if (!formData.email) return;
    setEmailCheckLoading(true);
    try {
      const res = await api.get(`/registrations/check/${id}/${formData.email}`);
      if (res.data.registered) {
        setEmailWarning('This email is already registered for this event.');
      }
    } catch {
      // Ignore check errors silently to not block user
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailWarning) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const res = await api.post('/registrations', {
        event_id: id,
        ...formData
      });
      setRefId(res.data.reference_id || 'REG-' + Math.floor(Math.random() * 1000000));
      setIsSuccess(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Registration failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-[#040d0a] flex justify-center items-center pt-24">
          <LoadingSpinner size="lg" message="Preparing registration form..." />
        </div>
      </PublicLayout>
    );
  }

  if (isSuccess) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-[#040d0a] flex items-center justify-center p-6 selection:bg-emerald-500/20 selection:text-emerald-300">
          <div className="max-w-md w-full rounded-3xl bg-[#081813]/90 border border-emerald-500/30 p-8 text-center backdrop-blur-2xl shadow-2xl shadow-black/80 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Registration Confirmed!</h2>
            <p className="text-stone-300 text-sm mb-6 leading-relaxed">
              You are officially registered for <strong className="text-emerald-300">{eventTitle}</strong>.
            </p>
            
            <div className="bg-[#040d0a] border border-white/[0.08] rounded-2xl p-4 mb-8">
              <p className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold mb-1">Registration Reference</p>
              <p className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">{refId}</p>
              <p className="text-[11px] text-stone-400 mt-1">Please preserve this ID for field check-in.</p>
            </div>
            
            <Link 
              to="/events"
              className="block w-full py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-semibold transition-all border border-white/[0.08]"
            >
              Return to Events
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#040d0a] text-stone-200 py-16 sm:py-24 px-4 sm:px-6 selection:bg-emerald-500/20 selection:text-emerald-300">
        <div className="max-w-2xl mx-auto">
          
          <Link 
            to={`/events/${id}`} 
            className="inline-flex items-center gap-2 text-stone-400 hover:text-emerald-300 transition-colors mb-6 sm:mb-8 text-xs font-semibold uppercase tracking-wider bg-white/[0.04] px-3.5 py-2 rounded-full border border-white/[0.06] min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Event Details
          </Link>
          
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Event Registration
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">Confirm Your Spot</h1>
            <p className="text-stone-400 text-sm sm:text-base">{eventTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 bg-[#091a14]/70 border border-white/[0.08] p-5 sm:p-8 md:p-10 rounded-3xl backdrop-blur-2xl shadow-xl shadow-black/40">
            
            {submitError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-rose-300 text-xs">{submitError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Full Name */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">Full Name *</label>
                <input 
                  type="text" 
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-[#05110d] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all min-h-[44px]"
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              {/* Student ID */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">Student ID / Roll No *</label>
                <input 
                  type="text" 
                  name="student_id"
                  required
                  value={formData.student_id}
                  onChange={handleChange}
                  className="w-full bg-[#05110d] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all uppercase min-h-[44px]"
                  placeholder="4NM22CS001"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">College Email *</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  className="w-full bg-[#05110d] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all min-h-[44px]"
                  placeholder="alex@nmamit.in"
                />
                {emailWarning && (
                  <p className="text-xs text-rose-400">{emailWarning}</p>
                )}
                {emailCheckLoading && (
                  <p className="text-[11px] text-stone-500">Checking eligibility...</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#05110d] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all min-h-[44px]"
                  placeholder="+91 9876543210"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">Department</label>
                <select 
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-[#05110d] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-stone-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer min-h-[44px]"
                >
                  <option value="" className="bg-[#05110d] text-stone-500">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#05110d] text-stone-200">{d}</option>)}
                </select>
              </div>

              {/* Year */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">Academic Year</label>
                <select 
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-[#05110d] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-stone-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer min-h-[44px]"
                >
                  <option value="" className="bg-[#05110d] text-stone-500">Select year</option>
                  {YEARS.map(y => <option key={y} value={y} className="bg-[#05110d] text-stone-200">{y}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={isSubmitting || !!emailWarning}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-[#04110b] font-bold text-sm transition-all duration-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] min-h-[48px]"
              >
                {isSubmitting ? (
                  <span>Submitting Registration...</span>
                ) : (
                  <>
                    <span>Confirm Event Registration</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-stone-500 text-center mt-3">
                By registering, you agree to attend on time and adhere to campus safety guidelines.
              </p>
            </div>

          </form>

        </div>
      </div>
    </PublicLayout>
  );
}
