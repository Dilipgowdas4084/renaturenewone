import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import api from '../utils/api';

const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
);
const LinkedinIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05C21.5 8.59 22 11 22 14.06V21h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.07 0-2.39 1.62-2.39 3.28V21h-4V9Z" /></svg>
);
const TwitterIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.9 3H21l-6.55 7.49L22.5 21h-6.9l-5.4-6.53L3.9 21H1.8l7.02-8.03L1 3h7.05l4.88 5.96L18.9 3Zm-1.2 16.17h1.15L7.4 4.72H6.16L17.7 19.17Z" /></svg>
);

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const [siteContact, setSiteContact] = useState({
    email: 'renature.nmamit.nitte@gmail.com',
    phone: '+91 8258 281263 / +91 94812 34567',
    address: 'NMAM Institute of Technology, Nitte, Karkala Taluk, Udupi - 574110, Karnataka',
    room: 'Student Activity Center, Cabin 104, Green Wing',
    hours: 'Mon – Sat: 9:00 AM – 5:30 PM (Field Expeditions on Weekends)',
    instagram: 'https://instagram.com/renature_nmamit/',
    linkedin: 'https://linkedin.com/company/renature-nmamit/',
    twitter: 'https://x.com/renature_club',
    about_club_summary: 'renature is a student-led ecological and sustainability movement at NMAMIT dedicated to fostering biodiversity consciousness, hands-on afforestation, clean-up drives, and conservation education.'
  });

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const res = await api.get('/site-content');
        if (res.data?.contact) {
          setSiteContact(prev => ({ ...prev, ...res.data.contact }));
        }
      } catch (err) {
        console.warn('Using default contact info:', err);
      }
    };
    fetchContactData();
  }, []);

  const contactInfo = [
    {
      icon: Mail,
      label: 'Direct Email',
      value: siteContact.email,
      href: `mailto:${siteContact.email}`,
      description: 'General inquiries, collaborations & research partnerships',
    },
    {
      icon: Phone,
      label: 'Helpline Phone',
      value: siteContact.phone,
      href: `tel:${siteContact.phone.split('/')[0].trim()}`,
      description: 'Active during regular campus operational hours',
    },
    {
      icon: MapPin,
      label: 'Campus Base',
      value: siteContact.address,
      href: null,
      description: siteContact.room,
    },
  ];

  const socialLinks = [
    { name: 'Instagram', icon: InstagramIcon, href: siteContact.instagram, color: 'hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10' },
    { name: 'LinkedIn', icon: LinkedinIcon, href: siteContact.linkedin, color: 'hover:text-sky-400 hover:border-sky-500/30 hover:bg-sky-500/10' },
    { name: 'X / Twitter', icon: TwitterIcon, href: siteContact.twitter, color: 'hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10' },
  ];

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 800);
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#040d0a] text-stone-200 pb-24 selection:bg-emerald-500/20 selection:text-emerald-300">
        
        {/* ─── Hero ─── */}
        <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 overflow-hidden text-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08)_0%,_transparent_60%)]" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 sm:mb-6 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Mail className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-3 sm:mb-4">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Touch</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Have questions about upcoming drives, ecological fieldwork, or want to collaborate with renature? We'd love to connect.
            </p>
          </div>
        </section>

        {/* ─── Contact Info Cards ─── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {contactInfo.map(({ icon: Icon, label, value, href, description }) => (
              <div
                key={label}
                className="group rounded-3xl border border-white/[0.08] bg-[#091a14]/60 p-6 sm:p-7 hover:border-emerald-500/35 transition-all duration-300 text-center backdrop-blur-xl shadow-xl shadow-black/20 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 sm:mb-5 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-2">{label}</h3>
                {href ? (
                  <a
                    href={href}
                    className="text-sm sm:text-base font-bold text-white hover:text-emerald-300 transition-colors block mb-2 break-all"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-white mb-2">{value}</p>
                )}
                <p className="text-xs text-stone-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Social Links ─── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 text-center">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2 tracking-tight">Connect Online</h2>
          <p className="text-stone-400 text-xs mb-5 sm:mb-6">Stay updated with event photos and environmental dispatches</p>
          <div className="flex justify-center gap-3 sm:gap-4">
            {socialLinks.map(({ name, icon: Icon, href, color }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={name}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-white/[0.08] bg-[#091a14]/70 flex items-center justify-center text-stone-400 transition-all duration-200 backdrop-blur-xl hover:scale-105 min-h-[48px] min-w-[48px] ${color}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </section>

        {/* ─── Contact Form + Org Info ─── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            
            {/* Form */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#091a14]/70 p-5 sm:p-8 md:p-10 backdrop-blur-xl shadow-xl shadow-black/30">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">Send Us a Dispatch</h2>
              <p className="text-stone-400 text-xs mb-6">Fill in your inquiry and our coordinator team will respond within 48 hours.</p>

              {submitted && (
                <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-emerald-300 text-xs font-medium">Message sent successfully! We'll get back to you soon.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 rounded-xl bg-[#05110d] border border-white/[0.08] text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="jane@nmamit.in"
                      className="w-full px-4 py-3 rounded-xl bg-[#05110d] border border-white/[0.08] text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Event partnership, volunteering, etc."
                    className="w-full px-4 py-3 rounded-xl bg-[#05110d] border border-white/[0.08] text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us about your proposal or question..."
                    className="w-full px-4 py-3 rounded-xl bg-[#05110d] border border-white/[0.08] text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer hover:scale-[1.02] min-h-[48px]"
                >
                  {sending ? 'Dispatching Message...' : 'Send Message'}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Organization Info */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="rounded-3xl border border-white/[0.08] bg-[#091a14]/70 p-8 backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white mb-3 tracking-tight">About renature Club</h2>
                <p className="text-stone-300 text-sm leading-relaxed mb-4">
                  {siteContact.about_club_summary || 'renature is a student-led ecological and sustainability movement at NMAMIT dedicated to fostering biodiversity consciousness, hands-on afforestation, clean-up drives, and conservation education.'}
                </p>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Whether you are passionate about botanical restoration, wildlife surveys, or campus greening, our community welcomes every student voice.
                </p>
              </div>

              <div className="rounded-3xl border border-white/[0.08] bg-[#091a14]/70 p-8 backdrop-blur-xl">
                <h2 className="text-base font-bold text-white mb-4 tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Club Desk & Field Hours
                </h2>
                <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] text-xs text-stone-300 leading-relaxed">
                  {siteContact.hours || 'Mon – Sat: 9:00 AM – 5:30 PM (Field Expeditions on Weekends)'}
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
