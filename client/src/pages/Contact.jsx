import { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
);
const LinkedinIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05C21.5 8.59 22 11 22 14.06V21h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.07 0-2.39 1.62-2.39 3.28V21h-4V9Z" /></svg>
);
const TwitterIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.9 3H21l-6.55 7.49L22.5 21h-6.9l-5.4-6.53L3.9 21H1.8l7.02-8.03L1 3h7.05l4.88 5.96L18.9 3Zm-1.2 16.17h1.15L7.4 4.72H6.16L17.7 19.17Z" /></svg>
);

/* ─── Contact information — replace with real values ─── */
const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'renature.nmamit.nitte@gmail.com',
    href: 'mailto:renature.nmamit.nitte@gmail.com',
    description: 'Reach out for inquiries and collaborations',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 73384 61410',
    href: 'tel:+917338461410',
    description: 'Available during college hours',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'NMAMIT Campus, Nitte, Karnataka',
    href: null,
    description: 'Nitte Mahalinga Adyanthaya Memorial Institute of Technology',
  },
];

const SOCIAL_LINKS = [
  { name: 'Instagram', icon: InstagramIcon, href: 'https://instagram.com/renature_nmamit/', color: 'hover:text-pink-400 hover:border-pink-400/30 hover:bg-pink-400/10' },
  { name: 'LinkedIn', icon: LinkedinIcon, href: 'https://linkedin.com/company/renature-nmamit/', color: 'hover:text-blue-400 hover:border-blue-400/30 hover:bg-blue-400/10' },
  { name: 'Twitter', icon: TwitterIcon, href: 'https://x.com/renature_club', color: 'hover:text-sky-400 hover:border-sky-400/30 hover:bg-sky-400/10' },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSending(true);
    // Simulate sending (frontend only for now)
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(134,239,172,0.06)_0%,_transparent_60%)]" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#86efac]/10 border border-[#86efac]/20 mb-6">
            <Mail className="w-8 h-8 text-[#86efac]" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
            Contact <span className="text-[#86efac]">Us</span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Have questions, ideas, or want to collaborate? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONTACT_INFO.map(({ icon: Icon, label, value, href, description }) => (
            <div
              key={label}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-[#86efac]/30 transition-all duration-300 text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-900/30 mb-4 group-hover:bg-[#86efac]/10 group-hover:border-[#86efac]/20 transition-all">
                <Icon className="w-6 h-6 text-[#86efac]" />
              </div>
              <h3 className="text-sm uppercase tracking-wider text-stone-500 font-medium mb-2">{label}</h3>
              {href ? (
                <a
                  href={href}
                  className="text-lg font-semibold text-white hover:text-[#86efac] transition-colors block mb-2"
                >
                  {value}
                </a>
              ) : (
                <p className="text-lg font-semibold text-white mb-2">{value}</p>
              )}
              <p className="text-sm text-stone-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Follow Us</h2>
          <p className="text-stone-500">Stay connected on social media</p>
        </div>
        <div className="flex justify-center gap-4">
          {SOCIAL_LINKS.map(({ name, icon: Icon, href, color }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={name}
              className={`w-14 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-stone-400 transition-all duration-300 ${color}`}
            >
              <Icon className="w-6 h-6" />
            </a>
          ))}
        </div>
      </section>

      {/* Contact Form + Org Info */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>

            {submitted && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-emerald-400 text-sm">Message sent successfully! We'll get back to you soon.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-stone-400 mb-1.5">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#86efac]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone-400 mb-1.5">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#86efac]/40 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-stone-400 mb-1.5">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#86efac]/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-400 mb-1.5">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Your message..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#86efac]/40 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#86efac] hover:bg-[#a7f3d0] text-black font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#86efac]/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Message'}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Organization Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About Renature</h2>
              <p className="text-stone-400 leading-relaxed mb-4">
                Renature is a student-led nature and sustainability club dedicated to fostering environmental awareness and conservation among college students. We organize nature walks, photography workshops, cleanup drives, and educational events.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                Whether you're passionate about wildlife photography, bird watching, or simply want to make our campus greener — there's a place for you at Renature.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Visit Us</h2>
              <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                  <p className="text-stone-500 text-sm">NMAMIT Campus, Nitte</p>
                  <p className="text-stone-600 text-xs">Karnataka, India</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
              <h2 className="text-lg font-bold text-white mb-3">Club Hours</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-400">
                  <span>Monday – Friday</span>
                  <span className="text-stone-300">9:00 AM – 5:00 PM</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Saturday</span>
                  <span className="text-stone-300">10:00 AM – 2:00 PM</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Sunday</span>
                  <span className="text-stone-500">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
