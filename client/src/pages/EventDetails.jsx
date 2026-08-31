import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Calendar, MapPin, Users, Clock, Award, ArrowLeft, Info, FileText, CheckCircle2 } from 'lucide-react';

const SAMPLE_EVENT = {
  id: 'sample-1',
  title: 'Campus Cleanup Drive',
  category: 'Cleanup Drive',
  description: 'Join us for our monthly campus cleanup. Help us keep our environment clean and beautiful. This is a great opportunity to meet fellow students who care about the environment while making a tangible impact on our campus. We will provide all necessary equipment including gloves, trash bags, and pickers.',
  date: '2026-09-10',
  time: '09:00 AM - 12:00 PM',
  venue: 'Main Gate',
  status: 'Upcoming',
  registered_count: 45,
  max_participants: 100,
  points: 20,
  deadline: '2026-09-08',
  organizer: 'Renature Core Team',
  rules: [
    'Wear comfortable clothing and closed-toe shoes.',
    'Carry a reusable water bottle.',
    'Follow instructions given by the team leads.',
    'Respect wildlife and do not disturb natural habitats during the drive.'
  ],
  eligibility: 'Open to all current students and faculty members.',
  image_url: null
};

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/api/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error('Failed to fetch event details:', err);
      setError(true);
      setEvent({ ...SAMPLE_EVENT, id });
    } finally {
      setLoading(false);
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

  if (!event) return null;

  const isFull = event.max_participants && event.registered_count >= event.max_participants;
  const isPast = event.status === 'Completed';
  const isClosed = isPast || isFull;
  
  const progressPercent = event.max_participants 
    ? Math.min(100, (event.registered_count / event.max_participants) * 100) 
    : 0;

  return (
    <PublicLayout>
      <div className="min-h-screen bg-black text-stone-200 pb-24">
        
        {/* ─── Hero Banner ─── */}
        <section className="relative w-full h-[40vh] min-h-[300px] flex flex-col justify-end overflow-hidden">
          {event.image_url ? (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.image_url})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(134,239,172,0.15)_0%,_transparent_70%)] bg-stone-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12 w-full">
            <Link to="/events" className="inline-flex items-center gap-2 text-stone-400 hover:text-[#86efac] transition-colors mb-6 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={event.status} />
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white">
                {event.category}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              {event.title}
            </h1>
          </div>
        </section>

        {error && (
           <div className="max-w-4xl mx-auto px-6 mt-6">
             <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
               Could not load live event details. Showing sample data.
             </div>
           </div>
        )}

        {/* ─── Content Grid ─── */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column (Main Info) */}
            <div className="md:col-span-2 space-y-10">
              
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#86efac]" /> About the Event
                </h2>
                <p className="text-stone-400 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Rules */}
              {event.rules && event.rules.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-[#86efac]" /> Rules & Guidelines
                  </h2>
                  <ul className="space-y-3">
                    {event.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-stone-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#86efac] mt-2 shrink-0" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Eligibility */}
              {event.eligibility && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Info className="w-6 h-6 text-[#86efac]" /> Eligibility
                  </h2>
                  <p className="text-stone-400 leading-relaxed">
                    {event.eligibility}
                  </p>
                </div>
              )}

            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">
              
              {/* Info Card */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-6">Event Details</h3>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#86efac] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-500 font-medium uppercase tracking-wider">Date</p>
                      <p className="text-stone-300">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  
                  {event.time && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#86efac] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-stone-500 font-medium uppercase tracking-wider">Time</p>
                        <p className="text-stone-300">{event.time}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#86efac] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-500 font-medium uppercase tracking-wider">Venue</p>
                      <p className="text-stone-300">{event.venue}</p>
                    </div>
                  </div>

                  {event.points && (
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-[#86efac] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-stone-500 font-medium uppercase tracking-wider">Points</p>
                        <p className="text-stone-300">{event.points} pts available</p>
                      </div>
                    </div>
                  )}
                  
                  {event.organizer && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-[#86efac] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-stone-500 font-medium uppercase tracking-wider">Organizer</p>
                        <p className="text-stone-300">{event.organizer}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Card */}
              <div className="rounded-2xl bg-emerald-950/30 border border-emerald-900/30 p-6 backdrop-blur-xl">
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-stone-400">Available Seats</span>
                    <span className="font-medium text-white">{event.registered_count} / {event.max_participants || '∞'}</span>
                  </div>
                  {event.max_participants && (
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${progressPercent >= 100 ? 'bg-red-500' : progressPercent > 80 ? 'bg-amber-500' : 'bg-[#86efac]'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                  {event.deadline && (
                    <p className="text-xs text-stone-500 mt-3 text-center">
                      Registration closes on {new Date(event.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {!isClosed ? (
                  <Link
                    to={`/events/${id}/register`}
                    className="block w-full py-4 rounded-xl bg-[#86efac] hover:bg-[#a7f3d0] text-black text-center font-bold text-lg transition-all shadow-lg shadow-[#86efac]/20"
                  >
                    Register Now
                  </Link>
                ) : (
                  <div className="w-full py-4 rounded-xl bg-white/[0.05] border border-white/10 text-stone-500 text-center font-bold text-lg cursor-not-allowed">
                    {isPast ? 'Event Completed' : 'Registration Closed'}
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
