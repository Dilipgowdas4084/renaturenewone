import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import ContactVillage from '../components/pixel/ContactVillage';
import { texture } from '../utils/pixelTextures';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
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

// Village props shown on each contact card (visual only)
const CARD_DECOR = [
  { object: 'Mailbox', emoji: '📮', tag: 'Send us a message' },
  { object: 'Wooden Sign', emoji: '🪧', tag: 'Call the club' },
  { object: 'Map', emoji: '🗺️', tag: 'Find us' },
];

function Parchment({ children, className = '' }) {
  return (
    <div className={`px-panel p-6 sm:p-8 ${className}`} style={texture('parchment', 64)}>
      {children}
    </div>
  );
}

function IconTile({ children, size = 'w-14 h-14' }) {
  return (
    <div className={`${size} shrink-0 bg-forest px-panel--thin flex items-center justify-center`}>
      {children}
    </div>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const [siteContact, setSiteContact] = useState({
    email: 'renature.nmamit.nitte@gmail.com',
    phone: '+91 8258 281263 / +91 94812 34567',
    address: 'NMAM Institute of Technology, Nitte, Karkala Taluk, Udupi - 574110, Karnataka',
    room: 'Student Activity Center, Cabin 104, Green Wing',
    hours: 'Mon – Sat: 9:00 AM – 5:30 PM',
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

  const labelCls = 'block font-pixel text-xs tracking-[0.15em] uppercase text-earth mb-2';

  return (
    <PublicLayout>
      <ContactVillage
        sent={submitted}
        eyebrow="CONTACT"
        title="GET IN TOUCH"
        subtitle="Have questions about upcoming drives, ecological fieldwork, or want to collaborate with renature? We'd love to connect."
      />

      <div className="relative pb-24" style={texture('darkPlanks', 72)}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50 pointer-events-none" />

        {/* ─── Contact Info Cards ─── */}
        <section className="relative max-w-6xl mx-auto px-6 pt-16 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map(({ icon: Icon, label, value, href, description }, i) => {
              const decor = CARD_DECOR[i % CARD_DECOR.length];
              return (
                <Parchment key={label} className="cv-obj relative text-center transition-transform duration-200 hover:-translate-y-1">
                  <span className="cv-tag absolute -top-4 left-1/2 -translate-x-1/2 px-panel--thin bg-sun text-bark font-pixel text-xs uppercase tracking-wider px-3 py-1 whitespace-nowrap">{decor.tag}</span>
                  <div className="flex justify-center mb-4">
                    <IconTile><span className="text-2xl" aria-hidden="true">{decor.emoji}</span></IconTile>
                  </div>
                  <h3 className="font-pixel text-xs tracking-[0.2em] uppercase text-earth mb-2">
                    <Icon className="inline w-4 h-4 mr-1 -mt-1" aria-hidden="true" />{decor.object} · {label}
                  </h3>
                  {href ? (
                    <a
                      href={href}
                      className="text-base sm:text-lg font-bold text-bark hover:text-forest transition-colors block mb-2 break-words"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-base sm:text-lg font-bold text-bark mb-2">{value}</p>
                  )}
                  <p className="text-sm text-bark/70">{description}</p>
                </Parchment>
              );
            })}
          </div>
        </section>

        {/* ─── Social Links ─── */}
        <section className="relative max-w-6xl mx-auto px-6 mb-16">
          <div className="text-center mb-8">
            <div className="inline-block px-panel px-panel--thin px-6 py-2" style={texture('planks', 48)}>
              <h2 className="px-title text-cream text-2xl sm:text-3xl tracking-wide"><span aria-hidden="true">📜 </span>Connect Online</h2>
            </div>
            <p className="mt-5 text-cream/80">Stay updated with event photos and environmental dispatches</p>
          </div>
          <div className="flex justify-center gap-5">
            {socialLinks.map(({ name, icon: Icon, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={name}
                aria-label={name}
                className="w-14 h-14 px-panel--thin bg-[#2a2622] text-cream flex items-center justify-center transition-colors hover:bg-sun hover:text-bark"
              >
                <Icon className="w-6 h-6" />
              </a>
            ))}
          </div>
        </section>

        {/* ─── Contact Form + Org Info ─── */}
        <section className="relative max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form, inside a little cabin */}
            <div className="relative flex flex-col">
              {/* roof */}
              <div className="h-4 mx-3 bg-[#8a3f2b] border-4 border-b-0 border-[#3a2a1a]" aria-hidden="true" />
              <div className="h-4 bg-[#9c4a33] border-4 border-b-0 border-[#3a2a1a]" aria-hidden="true" />
              <div className="relative flex-1 border-x-4 border-[#3a2a1a]">
                {/* log pillars */}
                <div className="absolute inset-y-0 left-0 w-3 bg-[#5b3a1e] border-r-2 border-[#3a2a1a]" aria-hidden="true" />
                <div className="absolute inset-y-0 right-0 w-3 bg-[#5b3a1e] border-l-2 border-[#3a2a1a]" aria-hidden="true" />
                <div className="h-full p-6 sm:p-8 px-9 sm:px-11" style={texture('planks', 64)}>
                  <div className="px-panel p-5 sm:p-6 h-full flex flex-col" style={texture('parchment', 64)}>
                    <h2 className="font-pixel text-2xl text-bark uppercase mb-2">Send Us a Dispatch</h2>
                    <p className="text-bark/70 text-sm mb-6">Fill in your inquiry and our coordinator team will respond within 48 hours.</p>

                    {submitted && (
                      <div className="mb-6 px-4 py-3 px-panel--thin bg-forest text-cream" role="status">
                        <p className="font-pixel text-lg tracking-wider">MESSAGE SENT!</p>
                        <p className="text-sm font-semibold">Message sent successfully! We'll get back to you soon.</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="contact-name" className={labelCls}>Your Name *</label>
                          <input
                            id="contact-name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Jane Doe"
                            className="px-input w-full"
                          />
                        </div>
                        <div>
                          <label htmlFor="contact-email" className={labelCls}>Email Address *</label>
                          <input
                            id="contact-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="jane@nmamit.in"
                            className="px-input w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="contact-subject" className={labelCls}>Subject</label>
                        <input
                          id="contact-subject"
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Event partnership, volunteering, etc."
                          className="px-input w-full"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <label htmlFor="contact-message" className={labelCls}>Message *</label>
                        <textarea
                          id="contact-message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          placeholder="Tell us about your proposal or question..."
                          className="px-input w-full resize-none flex-1 min-h-[8rem]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={sending}
                        className="px-btn px-btn--grass"
                      >
                        {sending ? 'Dispatching Message...' : 'Send Message'}
                        <Send className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              {/* cobblestone foundation */}
              <div className="h-6 border-4 border-[#3a2a1a] cv-slot" style={texture('stone', 32)} aria-hidden="true" />
            </div>

            {/* Organization Info */}
            <div className="space-y-8">
              <Parchment>
                <h2 className="font-pixel text-2xl text-bark uppercase mb-4">About renature Club</h2>
                <p className="text-bark/85 leading-relaxed mb-4">
                  {siteContact.about_club_summary || 'renature is a student-led ecological and sustainability movement at NMAMIT dedicated to fostering biodiversity consciousness, hands-on afforestation, clean-up drives, and conservation education.'}
                </p>
                <p className="text-bark/70 text-sm leading-relaxed">
                  Whether you are passionate about botanical restoration, wildlife surveys, or campus greening, our community welcomes every student voice.
                </p>
              </Parchment>

              <Parchment>
                <h2 className="font-pixel text-2xl text-bark uppercase mb-4">Visit Us</h2>
                <div className="px-panel--thin min-h-48 p-5 flex items-center justify-center bg-[#b9d9a0]">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-forest mx-auto mb-2" aria-hidden="true" />
                    <p className="text-bark font-semibold text-sm">{siteContact.room}</p>
                    <p className="text-bark/70 text-xs mt-1">{siteContact.address}</p>
                  </div>
                </div>
              </Parchment>

              <Parchment>
                <h2 className="font-pixel text-lg text-bark uppercase mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-forest" aria-hidden="true" />
                  Club Desk & Field Hours
                </h2>
                <p className="text-sm text-bark font-semibold leading-relaxed">
                  {siteContact.hours || 'Mon – Sat: 9:00 AM – 5:30 PM (Field Expeditions on Weekends)'}
                </p>
              </Parchment>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
