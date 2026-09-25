import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Target, Leaf, Users, Globe, BookOpen, TreePine, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../utils/api';

const OBJECTIVES = [
  {
    icon: Target,
    title: 'Focused Action',
    description: 'We organize targeted cleanups and conservation drives to restore natural habitats on and off campus.'
  },
  {
    icon: Leaf,
    title: 'Sustainable Growth',
    description: 'Promoting long-term sustainability through continuous tree-planting and nurturing initiatives.'
  },
  {
    icon: Users,
    title: 'Community Engagement',
    description: 'Empowering students to take leadership roles in environmental stewardship and advocacy.'
  },
  {
    icon: Globe,
    title: 'Global Impact',
    description: 'Thinking globally while acting locally to combat climate change and biodiversity loss.'
  },
  {
    icon: BookOpen,
    title: 'Education & Awareness',
    description: 'Conducting workshops and seminars to spread knowledge about ecological conservation.'
  },
  {
    icon: TreePine,
    title: 'Biodiversity Preservation',
    description: 'Protecting and documenting local flora and fauna to ensure a thriving ecosystem.'
  }
];

const ACTIVITIES = [
  {
    title: 'Nature Walks & Expeditions',
    description: 'Explore the hidden beauty of our surroundings. Our guided nature walks are designed to connect students with local ecosystems, learn about native species, and appreciate the outdoors.',
    image: '/IMG_9723.jpeg',
    tag: 'Field Ecology'
  },
  {
    title: 'Tree Plantation Drives',
    description: 'Leave a lasting legacy by planting native trees around the campus and neighboring areas. We ensure long-term care and soil monitoring for every sapling planted.',
    image: '/IMG_9183.jpeg',
    tag: 'Reforestation'
  },
  {
    title: 'Workshops & Seminars',
    description: 'Learn from experts in the field of conservation, sustainable agriculture, and climate science through interactive sessions and telemetry data analysis.',
    image: '/IMG_9279.jpeg',
    tag: 'Hands-on Learning'
  }
];

const DEFAULT_BENEFITS = [
  'Gain hands-on experience in environmental conservation & fieldwork',
  'Connect with like-minded peers, researchers, and ecology experts',
  'Earn verified volunteer hours and certificates for active participation',
  'Develop leadership, project coordination, and organizational skills',
  'Contribute directly to a healthier, greener campus and surrounding lakes'
];

export default function About() {
  const [siteData, setSiteData] = useState({
    hero_title: 'About renature',
    hero_subtitle: 'A passionate community of engineering students and nature enthusiasts cultivating biodiversity, ecological action, and campus sustainability.',
    story_title: 'From a small weekend initiative to a campus-wide movement.',
    story_paragraph1: 'renature started with a simple idea: that students have the power to create tangible environmental change. What began as a small group of nature enthusiasts has grown into a structured platform supporting native afforestation, wetland cleaning, and wildlife censuses.',
    story_paragraph2: 'We believe that by reconnecting with nature and combining field action with modern tracking tools, we can build a resilient, green campus that inspires sustainable practices for decades to come.',
    president_name: 'Ashmit',
    president_dept: 'Biotechnology',
    vice_president_name: 'Shia Bangera',
    vice_president_dept: 'Mechanical Eng',
    benefits: DEFAULT_BENEFITS
  });

  useEffect(() => {
    const fetchSiteContent = async () => {
      try {
        const res = await api.get('/site-content');
        if (res.data?.about) {
          setSiteData(prev => ({
            ...prev,
            ...res.data.about,
            benefits: res.data.about.benefits?.length ? res.data.about.benefits : prev.benefits
          }));
        }
      } catch (err) {
        console.warn('Using default about content:', err);
      }
    };
    fetchSiteContent();
  }, []);

  const team = [
    { 
      name: siteData.president_name || 'Ashmit', 
      role: 'President', 
      avatar: (siteData.president_name || 'Ashmit').slice(0, 2).toUpperCase(), 
      dept: siteData.president_dept || 'Biotechnology' 
    },
    { 
      name: siteData.vice_president_name || 'Shia Bangera', 
      role: 'Vice President', 
      avatar: (siteData.vice_president_name || 'Shia Bangera').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(), 
      dept: siteData.vice_president_dept || 'Mechanical Eng' 
    },
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#061510] text-stone-200 selection:bg-emerald-500/20 selection:text-emerald-300 pb-24">
        
        {/* ─── Hero Banner ─── */}
        <section className="relative w-full min-h-[380px] sm:min-h-[460px] pt-28 sm:pt-32 pb-16 sm:pb-20 flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/PHOTO-2026-08-13-19-44-48.png)' }}
          />
          <div className="absolute inset-0 bg-[#061510]/85 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061510] via-transparent to-[#061510]/60" />
          
          <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 sm:mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Our Story & Movement
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight">
              {siteData.hero_title || 'About renature'}
            </h1>
            <p className="text-sm sm:text-base lg:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed font-normal">
              {siteData.hero_subtitle}
            </p>
          </div>
        </section>

        {/* ─── Introduction & Story ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Origin Story
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {siteData.story_title}
              </h2>
              <p className="text-stone-300 leading-relaxed text-sm sm:text-base">
                {siteData.story_paragraph1}
              </p>
              <p className="text-stone-400 leading-relaxed text-xs sm:text-sm">
                {siteData.story_paragraph2}
              </p>
            </div>
            
            <div className="rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40 group relative h-64 sm:h-96">
              <img 
                src="/IMG_9183.jpeg" 
                alt="renature Tree Planting" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  Field Archive
                </span>
                <p className="text-white font-medium text-xs sm:text-sm mt-2">
                  Volunteers planting native saplings during the annual green sprint.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Mission & Vision ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="p-6 sm:p-10 rounded-3xl bg-[#081813]/70 border border-white/[0.08] backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 sm:mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Our Mission</h3>
              <p className="text-stone-400 leading-relaxed text-xs sm:text-sm sm:text-base">
                To inspire and empower students to take proactive steps in environmental conservation through education, hands-on field projects, open ecological data, and community engagement.
              </p>
            </div>

            <div className="p-6 sm:p-10 rounded-3xl bg-[#081813]/70 border border-white/[0.08] backdrop-blur-xl transition-all duration-300 hover:border-teal-500/30 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4 sm:mb-6 text-teal-400 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Our Vision</h3>
              <p className="text-stone-400 leading-relaxed text-xs sm:text-sm sm:text-base">
                A world where every campus is a thriving, self-sustaining ecosystem with verified biodiversity corridors, and every student graduate is an environmentally conscious leader.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Objectives ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Strategic Focus
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Our Objectives</h2>
            <p className="text-stone-400 max-w-2xl mx-auto text-sm sm:text-base">The core goals that drive our initiatives and shape our impact.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OBJECTIVES.map((obj, i) => {
              const Icon = obj.icon;
              return (
                <div key={i} className="p-7 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{obj.title}</h4>
                  <p className="text-stone-400 text-sm leading-relaxed">{obj.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── What We Do (Visual Activities) ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Action in Practice
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">What We Do</h2>
            <p className="text-stone-400 max-w-2xl mx-auto text-sm sm:text-base">Regular activities organized throughout the academic year.</p>
          </div>
          
          <div className="flex flex-col gap-16">
            {ACTIVITIES.map((activity, i) => (
              <div 
                key={i} 
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${
                  i % 2 !== 0 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={`space-y-4 ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    {activity.tag}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{activity.title}</h3>
                  <p className="text-stone-400 leading-relaxed text-base">{activity.description}</p>
                </div>

                <div className={`rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl relative h-80 group ${
                  i % 2 !== 0 ? 'lg:order-1' : ''
                }`}>
                  <img 
                    src={activity.image} 
                    alt={activity.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Why Participate ─── */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#0b211a]/80 to-[#071712]/90 border border-white/[0.1] relative overflow-hidden backdrop-blur-2xl shadow-xl shadow-black/40">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_right,_rgba(16,185,129,0.08)_0%,_transparent_70%)] pointer-events-none" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8 tracking-tight">
              Why Join renature as a Student?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(siteData.benefits || DEFAULT_BENEFITS).map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-stone-300 text-sm leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Team ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Leadership
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Meet the Team</h2>
            <p className="text-stone-400 max-w-2xl mx-auto text-sm sm:text-base">The student coordinators leading our conservation expeditions.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#091a14]/60 border border-white/[0.08] flex flex-col items-center text-center transition-all duration-300 hover:border-emerald-500/30 hover:-translate-y-1 group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/25 flex items-center justify-center mb-4 text-xl font-extrabold text-emerald-300 group-hover:scale-105 transition-transform shadow-md">
                  {member.avatar}
                </div>
                <h4 className="text-base font-bold text-white">{member.name}</h4>
                <p className="text-emerald-400 text-xs font-semibold mt-1">{member.role}</p>
                <p className="text-stone-500 text-xs mt-1">{member.dept}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
