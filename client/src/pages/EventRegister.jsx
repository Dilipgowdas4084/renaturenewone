import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import { isLoggedIn, getCurrentRole, dashboardPathFor } from '../utils/auth';
import { texture } from '../utils/pixelTextures';

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

  // Logged-in members: pre-fill from their account so the registration shows on their dashboard
  useEffect(() => {
    if (!isLoggedIn()) return;
    api.get('/auth/me')
      .then(res => {
        const u = res.data?.user;
        if (!u) return;
        setFormData(prev => ({
          ...prev,
          full_name: prev.full_name || u.name || '',
          email: prev.email || u.email || '',
          student_id: prev.student_id || u.usn || '',
          phone: prev.phone || u.phone || '',
        }));
      })
      .catch(() => { /* not critical — the form can still be filled in by hand */ });
  }, []);

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
      setSubmitError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wrap = (children) => (
    <PublicLayout>
      <div className="relative min-h-screen pb-24" style={texture('darkPlanks', 72)}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 pt-10 sm:pt-14">{children}</div>
      </div>
    </PublicLayout>
  );

  const labelCls = 'block font-pixel text-xs tracking-[0.15em] uppercase text-earth mb-2';

  if (loading) {
    return wrap(
      <div className="py-24 flex flex-col items-center gap-4" role="status">
        <div className="flex gap-2" aria-hidden="true">
          {[0, 1, 2].map(i => <span key={i} className="w-4 h-4 bg-sun px-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
        </div>
        <p className="font-pixel text-cream tracking-[0.2em] px-shadow-sm">PREPARING YOUR QUEST…</p>
      </div>
    );
  }

  if (isSuccess) {
    return wrap(
      <div className="max-w-lg mx-auto mt-6">
        <div className="px-panel p-8 sm:p-10 text-center" style={texture('parchment', 64)}>
          <div className="w-16 h-16 mx-auto mb-5 bg-forest px-panel--thin flex items-center justify-center text-3xl" aria-hidden="true">🏆</div>
          <p className="font-pixel text-forest text-sm tracking-[0.3em] mb-1">QUEST ACCEPTED!</p>
          <h1 className="font-pixel text-2xl sm:text-3xl uppercase text-bark mb-3">You're In</h1>
          <p className="text-bark/80 mb-6 leading-relaxed">
            You are officially registered for <strong className="text-bark">{eventTitle}</strong>.
          </p>

          <div className="px-panel--thin p-4 mb-8 bg-bark">
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-sun mb-2">Quest Reference</p>
            <p className="font-num text-sm sm:text-base text-cream break-all">{refId}</p>
            <p className="text-xs text-cream/70 mt-2">Keep this ID for check-in on the day.</p>
          </div>

          <div className="flex flex-col gap-5">
            <Link to="/events" className="px-btn px-btn--wood w-full">◂ Back to Quest Board</Link>
            {isLoggedIn() && (
              <Link to={dashboardPathFor(getCurrentRole())} className="px-btn px-btn--grass w-full">
                View My Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return wrap(
    <>
      <Link to={`/events/${id}`} className="px-btn px-btn--stone px-btn--sm mb-8">◂ Back to Quest Details</Link>

      {/* Title sign */}
      <div className="mb-10">
        <div className="inline-block max-w-full px-panel px-panel--thin px-5 sm:px-7 py-4" style={texture('planks', 48)}>
          <p className="font-pixel text-sun text-xs sm:text-sm tracking-[0.3em] mb-1">ACCEPT QUEST</p>
          <h1 className="px-title text-cream text-3xl sm:text-4xl tracking-wide leading-tight break-words">{eventTitle || 'Quest Sign-up'}</h1>
        </div>
        <p className="mt-5 text-cream/85">Fill in your details to join this quest.</p>
      </div>

      <form onSubmit={handleSubmit} className="px-panel p-6 sm:p-8 flex flex-col gap-6" style={texture('parchment', 64)}>
        <h2 className="font-pixel text-2xl uppercase text-bark">Quest Contract</h2>

        {submitError && (
          <div className="px-4 py-3 px-panel--thin bg-[#9c3d33] text-cream text-sm font-semibold" role="alert">⚠ {submitError}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="reg-full_name" className={labelCls}>Full Name *</label>
            <input id="reg-full_name" type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className="px-input w-full" placeholder="e.g. Alex Morgan" />
          </div>

          <div>
            <label htmlFor="reg-student_id" className={labelCls}>Student ID / Roll No *</label>
            <input id="reg-student_id" type="text" name="student_id" required value={formData.student_id} onChange={handleChange} className="px-input w-full uppercase" placeholder="4NM22CS001" />
          </div>

          <div>
            <label htmlFor="reg-email" className={labelCls}>College Email *</label>
            <input id="reg-email" type="email" name="email" required value={formData.email} onChange={handleChange} onBlur={handleEmailBlur} className="px-input w-full" placeholder="alex@nmamit.in" />
            {emailWarning && <p className="text-sm font-semibold text-[#9c3d33] mt-2">{emailWarning}</p>}
            {emailCheckLoading && <p className="text-xs text-bark/60 mt-2">Checking eligibility...</p>}
          </div>

          <div>
            <label htmlFor="reg-phone" className={labelCls}>Phone Number *</label>
            <input id="reg-phone" type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="px-input w-full" placeholder="+91 9876543210" />
          </div>

          <div>
            <label htmlFor="reg-department" className={labelCls}>Department</label>
            <select id="reg-department" name="department" value={formData.department} onChange={handleChange} className="px-input w-full cursor-pointer">
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="reg-year" className={labelCls}>Academic Year</label>
            <select id="reg-year" name="year" value={formData.year} onChange={handleChange} className="px-input w-full cursor-pointer">
              <option value="">Select year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-5 border-t-2 border-dashed border-earth/30">
          <button type="submit" disabled={isSubmitting || !!emailWarning} className="px-btn px-btn--grass w-full">
            {isSubmitting ? 'Signing the contract…' : <><span aria-hidden="true">▶</span> Accept Quest</>}
          </button>
          <p className="text-xs text-bark/65 text-center mt-4">
            By registering, you agree to attend on time and adhere to campus safety guidelines.
          </p>
        </div>
      </form>
    </>
  );
}
