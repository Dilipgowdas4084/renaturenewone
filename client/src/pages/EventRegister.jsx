import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

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
        const res = await api.get(`/api/events/${id}`);
        setEventTitle(res.data.title);
      } catch (err) {
        setEventTitle('Event Registration');
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
      const res = await api.get(`/api/registrations/check/${id}/${formData.email}`);
      if (res.data.registered) {
        setEmailWarning('This email is already registered for this event.');
      }
    } catch (err) {
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
      const res = await api.post('/api/registrations', {
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
        <div className="min-h-screen bg-black flex justify-center pt-32">
          <LoadingSpinner size="xl" color="#86efac" />
        </div>
      </PublicLayout>
    );
  }

  if (isSuccess) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl bg-white/[0.02] border border-white/[0.06] p-8 text-center backdrop-blur-xl">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Registration Successful!</h2>
            <p className="text-stone-400 mb-6">You have successfully registered for <strong className="text-white">{eventTitle}</strong>.</p>
            
            <div className="bg-black/50 border border-white/[0.06] rounded-xl p-4 mb-8">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Reference ID</p>
              <p className="text-xl font-mono text-[#86efac]">{refId}</p>
            </div>
            
            <Link 
              to="/events"
              className="block w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-black text-stone-200 py-24 px-6">
        <div className="max-w-2xl mx-auto">
          
          <Link to={`/events/${id}`} className="inline-flex items-center gap-2 text-stone-400 hover:text-[#86efac] transition-colors mb-8 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Event Details
          </Link>
          
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Register for Event</h1>
            <p className="text-stone-400 text-lg">{eventTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white/[0.02] border border-white/[0.06] p-6 sm:p-8 rounded-3xl backdrop-blur-xl">
            
            {submitError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">Full Name</label>
                <input 
                  type="text" 
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:border-[#86efac]/50 focus:ring-1 focus:ring-[#86efac]/50 transition-all"
                  placeholder="John Doe"
                />
              </div>

              {/* Student ID */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">Student ID / Roll No</label>
                <input 
                  type="text" 
                  name="student_id"
                  required
                  value={formData.student_id}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:border-[#86efac]/50 focus:ring-1 focus:ring-[#86efac]/50 transition-all"
                  placeholder="4NM20CS000"
                />
              </div>

              {/* Email */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-stone-300 flex items-center justify-between">
                  Email Address
                  {emailCheckLoading && <span className="text-xs text-stone-500">Checking...</span>}
                </label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:ring-1 transition-all ${emailWarning ? 'border-amber-500/50 focus:border-amber-500/50 focus:ring-amber-500/50' : 'border-white/[0.08] focus:border-[#86efac]/50 focus:ring-[#86efac]/50'}`}
                  placeholder="john.doe@example.com"
                />
                {emailWarning && <p className="text-amber-400 text-xs mt-1">{emailWarning}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-stone-300">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:border-[#86efac]/50 focus:ring-1 focus:ring-[#86efac]/50 transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">Department</label>
                <select 
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#86efac]/50 focus:ring-1 focus:ring-[#86efac]/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-300">Year of Study</label>
                <select 
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#86efac]/50 focus:ring-1 focus:ring-[#86efac]/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Year</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isSubmitting || !!emailWarning}
                className="w-full py-4 rounded-xl bg-[#86efac] hover:bg-[#a7f3d0] text-black font-bold text-lg transition-all shadow-lg shadow-[#86efac]/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-14"
              >
                {isSubmitting ? <LoadingSpinner size="sm" color="#000" /> : 'Confirm Registration'}
              </button>
              <p className="text-xs text-stone-500 text-center mt-4">
                By registering, you agree to follow the event guidelines and our community standards.
              </p>
            </div>
            
          </form>

        </div>
      </div>
    </PublicLayout>
  );
}
