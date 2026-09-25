import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Calendar, MapPin, Users, Clock, Award, ArrowLeft, Info, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

const SAMPLE_EVENT = {
  id: 'sample-1',
  title: 'Campus Cleanup Drive',
  category: 'Cleanup Drive',
  description: 'Join us for our monthly campus cleanup. Help us keep our environment clean, collect discarded plastics, and restore natural habitats around the perimeter. This is a high-impact opportunity to connect with fellow students who care about sustainability while making a tangible difference on campus. All necessary equipment including puncture-resistant gloves, biodegradable collection bags, and pickers will be provided.',
  date: '2026-09-10',
  time: '09:00 AM - 12:00 PM',
  venue: 'Main Gate & East Lakefront',
  status: 'Upcoming',
  registered_count: 45,
  max_participants: 100,
  points: 20,
  deadline: '2026-09-08',
  organizer: 'renature Core Team & Volunteer Leads',
  rules: [
    'Wear comfortable clothing and closed-toe footwear.',
    'Carry a reusable water flask (hydration stations available).',
    'Follow instructions given by zone coordinators.',
    'Respect local wildlife and flora during collection.'
  ],
  eligibility: 'Open to all current undergraduate, postgraduate students, and faculty members.',
  image_url: '/IMG_9279.jpeg'
};

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/events/${id}`);
      if (res.data) {
        setEvent(res.data);
      } else {
        setEvent({ ...SAMPLE_EVENT, id });
      }
    } catch (err) {
      console.error('Failed to fetch event details:', err);
      setError(true);
      setEvent({ ...SAMPLE_EVENT, id });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-[#040d0a] flex justify-center items-center pt-24">
          <LoadingSpinner size="lg" message="Loading drive details..." />
        </div>
      </PublicLayout>
    );
  }

  if (!event) return null;

  const isFull = event.max_participants && event.registered_count >= event.max_participants;
  const isPast = event.status === 'Completed';
  const isClosed = isPast || isFull;
  
  const progressPercent = event.max_participants 
    ? Math.min(100, (event.registered_count / event.max_participants) * 100) 
    : 0;

  const eventDate = event.event_date || event.date;
  const formattedDate = eventDate 
    ? new Date(eventDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBA';

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#040d0a] text-stone-200 pb-24 selection:bg-emerald-500/20 selection:text-emerald-300">
        
        {/* ─── Hero Banner ─── */}
        <section className="relative w-full h-[38vh] sm:h-[45vh] min-h-[290px] sm:min-h-[340px] flex flex-col justify-end overflow-hidden">
          {event.image_url || event.banner_url ? (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.image_url || event.banner_url})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c261d] to-[#040d0a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#040d0a] via-[#040d0a]/80 to-black/40" />
          
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-6 sm:pb-10 w-full">
            <Link 
              to="/events" 
              className="inline-flex items-center gap-2 text-stone-300 hover:text-emerald-300 transition-colors mb-4 sm:mb-5 text-xs font-semibold uppercase tracking-wider bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Events
            </Link>
            
            <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
              <StatusBadge status={event.status} />
              <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider text-emerald-300">
                {event.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {event.title}
            </h1>
          </div>
        </section>

        {error && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              Notice: Viewing event preview details.
            </div>
          </div>
        )}

        {/* ─── Content Grid ─── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Left Column (Main Info) */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-10">
              
              {/* Description */}
              <div className="p-5 sm:p-8 rounded-3xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-emerald-400" /> About the Event
                </h2>
                <p className="text-stone-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Rules & Guidelines */}
              {event.rules && (
                <div className="p-5 sm:p-8 rounded-3xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Rules & Guidelines
                  </h2>
                  <ul className="space-y-3">
                    {(Array.isArray(event.rules) ? event.rules : [event.rules]).map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-stone-300 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Eligibility */}
              {event.eligibility && (
                <div className="p-5 sm:p-8 rounded-3xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 flex items-center gap-2.5">
                    <Info className="w-5 h-5 text-emerald-400" /> Eligibility
                  </h2>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    {event.eligibility}
                  </p>
                </div>
              )}

            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">
              
              {/* Info Card */}
              <div className="rounded-3xl bg-[#091a14]/70 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                <h3 className="text-base font-bold text-white mb-4 sm:mb-5 tracking-tight border-b border-white/[0.06] pb-3">
                  Logistics & Schedule
                </h3>
                
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-stone-400 uppercase font-semibold">Date</p>
                      <p className="text-stone-200 font-medium">{formattedDate}</p>
                    </div>
                  </div>
                  
                  {event.time && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-stone-400 uppercase font-semibold">Time</p>
                        <p className="text-stone-200 font-medium">{event.time}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-stone-400 uppercase font-semibold">Location / Venue</p>
                      <p className="text-stone-200 font-medium">{event.venue}</p>
                    </div>
                  </div>

                  {event.points && (
                    <div className="flex items-start gap-3">
                      <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-stone-400 uppercase font-semibold">Eco-Points</p>
                        <p className="text-emerald-300 font-bold">+{event.points} points awarded</p>
                      </div>
                    </div>
                  )}
                  
                  {event.organizer && (
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-stone-400 uppercase font-semibold">Coordinating Team</p>
                        <p className="text-stone-200 font-medium">{event.organizer}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Card */}
              <div className="rounded-3xl bg-gradient-to-b from-[#0b211a]/90 to-[#071712]/90 border border-emerald-500/25 p-5 sm:p-6 backdrop-blur-xl shadow-xl shadow-black/30">
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-stone-300 font-medium">Participant Capacity</span>
                    <span className="font-bold text-white">{event.registered_count || 0} / {event.max_participants || 'Unlimited'}</span>
                  </div>
                  {event.max_participants && (
                    <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          progressPercent >= 100 
                            ? 'bg-rose-500' 
                            : progressPercent > 80 
                            ? 'bg-amber-400' 
                            : 'bg-emerald-400 shadow-sm shadow-emerald-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                  {event.deadline && (
                    <p className="text-[11px] text-stone-400 mt-3 text-center">
                      Registration closes {new Date(event.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {!isClosed ? (
                  <Link
                    to={`/events/${id}/register`}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] text-center font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] min-h-[48px]"
                  >
                    Register for Event
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-stone-400 text-center font-semibold text-sm cursor-not-allowed min-h-[48px] flex items-center justify-center">
                    {isPast ? 'Event Concluded' : 'Registration Full'}
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
