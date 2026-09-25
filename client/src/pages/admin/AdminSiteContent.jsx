import { useState, useEffect } from 'react';
import { 
  Globe, Save, CheckCircle2, Sparkles, User, 
  Mail, Share2, Layers, Plus, Trash2 
} from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DEFAULT_CONTENT = {
  about: {
    hero_title: 'About renature',
    hero_subtitle: 'A passionate community of engineering students and nature enthusiasts cultivating biodiversity, ecological action, and campus sustainability.',
    story_title: 'From a small weekend initiative to a campus-wide movement.',
    story_paragraph1: 'renature started with a simple idea: that students have the power to create tangible environmental change. What began as a small group of nature enthusiasts has grown into a structured platform supporting native afforestation, wetland cleaning, and wildlife censuses.',
    story_paragraph2: 'We believe that by reconnecting with nature and combining field action with modern tracking tools, we can build a resilient, green campus that inspires sustainable practices for decades to come.',
    president_name: 'Ashmit',
    president_dept: 'Biotechnology',
    vice_president_name: 'Shia Bangera',
    vice_president_dept: 'Mechanical Eng',
    benefits: [
      'Gain hands-on experience in environmental conservation & fieldwork',
      'Connect with like-minded peers, researchers, and ecology experts',
      'Earn verified volunteer hours and certificates for active participation',
      'Develop leadership, project coordination, and organizational skills',
      'Contribute directly to a healthier, greener campus and surrounding lakes'
    ]
  },
  contact: {
    email: 'renature.nmamit.nitte@gmail.com',
    phone: '+91 8258 281263 / +91 94812 34567',
    address: 'NMAM Institute of Technology, Nitte, Karkala Taluk, Udupi - 574110, Karnataka',
    room: 'Student Activity Center, Cabin 104, Green Wing',
    hours: 'Mon – Sat: 9:00 AM – 5:30 PM (Field Expeditions on Weekends)',
    instagram: 'https://instagram.com/renature_nmamit/',
    linkedin: 'https://linkedin.com/company/renature-nmamit/',
    twitter: 'https://x.com/renature_club',
    about_club_summary: 'renature is a student-led ecological and sustainability movement at NMAMIT dedicated to fostering biodiversity consciousness, hands-on afforestation, clean-up drives, and conservation education.'
  },
  home: {
    headline: 'Modern Environmental Action. Rooted in Community.',
    subtitle: 'Join student engineers, scientists, and naturalists cultivating campus sustainability through hands-on reforestation, biodiversity tracking, and verified ecological drives.',
    announcement: 'Upcoming Campus Tree Plantation Drive on Oct 15! Registrations open to all students.',
    announcement_active: true
  }
};

export default function AdminSiteContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [newBenefit, setNewBenefit] = useState('');

  const notify = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/site-content');
      if (res.data && Object.keys(res.data).length > 0) {
        setContent({
          about: { ...DEFAULT_CONTENT.about, ...(res.data.about || {}) },
          contact: { ...DEFAULT_CONTENT.contact, ...(res.data.contact || {}) },
          home: { ...DEFAULT_CONTENT.home, ...(res.data.home || {}) }
        });
      }
    } catch (err) {
      console.warn('Could not fetch server content, using active default values:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/site-content', content);
      notify('success', 'Website content updated successfully! Live pages will reflect your changes immediately.');
    } catch (err) {
      console.error('Error saving content:', err);
      notify('error', 'Failed to save website content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setContent(prev => ({
      ...prev,
      about: {
        ...prev.about,
        benefits: [...(prev.about.benefits || []), newBenefit.trim()]
      }
    }));
    setNewBenefit('');
  };

  const removeBenefit = (index) => {
    setContent(prev => ({
      ...prev,
      about: {
        ...prev.about,
        benefits: prev.about.benefits.filter((_, i) => i !== index)
      }
    }));
  };

  if (loading) return <LoadingSpinner fullPage message="Loading website content..." />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">
      {/* Feedback Alert */}
      {feedback.message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            Website Content Manager (CMS)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Website Content & About / Contact Editor
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm">
            Update about page stories, club leadership, contact channels, announcements, and benefits in real-time.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer disabled:opacity-50"
        >
          <Save size={16} />
          <span>{saving ? 'Publishing Changes...' : 'Publish to Live Site'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        {[
          { id: 'about', label: 'About & Leadership' },
          { id: 'contact', label: 'Contact & Location' },
          { id: 'home', label: 'Home & Announcements' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: ABOUT PAGE CMS ─── */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          {/* Leadership Section */}
          <div className="p-6 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              Club Leadership (President & Vice President)
            </h3>
            <p className="text-xs text-stone-400">
              Update the names and departments for the president and vice president shown on the public About page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">President</span>
                <div>
                  <label className="block text-[11px] text-stone-400 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={content.about.president_name}
                    onChange={(e) => setContent({
                      ...content,
                      about: { ...content.about, president_name: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={content.about.president_dept}
                    onChange={(e) => setContent({
                      ...content,
                      about: { ...content.about, president_dept: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Vice President</span>
                <div>
                  <label className="block text-[11px] text-stone-400 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={content.about.vice_president_name}
                    onChange={(e) => setContent({
                      ...content,
                      about: { ...content.about, vice_president_name: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={content.about.vice_president_dept}
                    onChange={(e) => setContent({
                      ...content,
                      about: { ...content.about, vice_president_dept: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Story & Narrative */}
          <div className="p-6 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Story & Mission Narrative
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Hero Title</label>
              <input
                type="text"
                value={content.about.hero_title}
                onChange={(e) => setContent({
                  ...content,
                  about: { ...content.about, hero_title: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={content.about.hero_subtitle}
                onChange={(e) => setContent({
                  ...content,
                  about: { ...content.about, hero_subtitle: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Origin Story Headline</label>
              <input
                type="text"
                value={content.about.story_title}
                onChange={(e) => setContent({
                  ...content,
                  about: { ...content.about, story_title: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Story Paragraph 1</label>
              <textarea
                rows={3}
                value={content.about.story_paragraph1}
                onChange={(e) => setContent({
                  ...content,
                  about: { ...content.about, story_paragraph1: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Story Paragraph 2</label>
              <textarea
                rows={3}
                value={content.about.story_paragraph2}
                onChange={(e) => setContent({
                  ...content,
                  about: { ...content.about, story_paragraph2: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Student Benefits List */}
          <div className="p-6 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              "Why Join renature as a Student?" Key Benefits
            </h3>

            <div className="space-y-2">
              {(content.about.benefits || []).map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/[0.06]">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => {
                      const updated = [...content.about.benefits];
                      updated[i] = e.target.value;
                      setContent({
                        ...content,
                        about: { ...content.about, benefits: updated }
                      });
                    }}
                    className="flex-1 bg-transparent text-xs text-stone-200 focus:outline-none"
                  />
                  <button
                    onClick={() => removeBenefit(i)}
                    className="p-1.5 text-stone-500 hover:text-rose-400"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add a new student benefit..."
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-emerald-500/20 border border-white/10 text-xs font-semibold text-emerald-300"
              >
                <Plus size={14} className="inline mr-1" /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: CONTACT PAGE CMS ─── */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              Official Contact & Communication Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Official Club Email</label>
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(e) => setContent({
                    ...content,
                    contact: { ...content.contact, email: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Helpline / Phone Numbers</label>
                <input
                  type="text"
                  value={content.contact.phone}
                  onChange={(e) => setContent({
                    ...content,
                    contact: { ...content.contact, phone: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Campus Physical Address</label>
              <input
                type="text"
                value={content.contact.address}
                onChange={(e) => setContent({
                  ...content,
                  contact: { ...content.contact, address: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Room / Cabin Location</label>
                <input
                  type="text"
                  value={content.contact.room}
                  onChange={(e) => setContent({
                    ...content,
                    contact: { ...content.contact, room: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={content.contact.hours}
                  onChange={(e) => setContent({
                    ...content,
                    contact: { ...content.contact, hours: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">About Club Summary (Sidebar on Contact Page)</label>
              <textarea
                rows={3}
                value={content.contact.about_club_summary}
                onChange={(e) => setContent({
                  ...content,
                  contact: { ...content.contact, about_club_summary: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="p-6 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              Social Media Accounts
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={content.contact.instagram}
                  onChange={(e) => setContent({
                    ...content,
                    contact: { ...content.contact, instagram: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={content.contact.linkedin}
                  onChange={(e) => setContent({
                    ...content,
                    contact: { ...content.contact, linkedin: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">X / Twitter URL</label>
                <input
                  type="text"
                  value={content.contact.twitter}
                  onChange={(e) => setContent({
                    ...content,
                    contact: { ...content.contact, twitter: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: HOME & ANNOUNCEMENTS ─── */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Homepage Copy & Urgent Announcement
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Hero Headline</label>
              <input
                type="text"
                value={content.home.headline}
                onChange={(e) => setContent({
                  ...content,
                  home: { ...content.home, headline: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={content.home.subtitle}
                onChange={(e) => setContent({
                  ...content,
                  home: { ...content.home, subtitle: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Announcement Banner</div>
                  <div className="text-[11px] text-stone-400">Display an alert bar at the top of the homepage</div>
                </div>
                <input
                  type="checkbox"
                  checked={content.home.announcement_active}
                  onChange={(e) => setContent({
                    ...content,
                    home: { ...content.home, announcement_active: e.target.checked }
                  })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <input
                type="text"
                placeholder="e.g. Next tree drive registrations open!"
                value={content.home.announcement}
                onChange={(e) => setContent({
                  ...content,
                  home: { ...content.home, announcement: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Action Footer */}
      <div className="sticky bottom-6 p-4 rounded-2xl bg-[#071712]/90 border border-emerald-500/30 backdrop-blur-xl flex items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-stone-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Any updates saved here will immediately propagate to public visitors.</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#04110b] font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer disabled:opacity-50"
        >
          <Save size={15} />
          <span>{saving ? 'Publishing...' : 'Publish to Live Site'}</span>
        </button>
      </div>

    </div>
  );
}
