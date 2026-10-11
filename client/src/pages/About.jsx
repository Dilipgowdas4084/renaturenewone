import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import PixelBanner from '../components/pixel/PixelBanner';
import { texture } from '../utils/pixelTextures';
import api from '../utils/api';

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

// A wooden signboard used as a section heading.
function SectionSign({ eyebrow, title, sub }) {
  return (
    <div className="text-center mb-12">
      <div className="inline-block px-panel px-panel--thin px-6 sm:px-10 py-3" style={texture('planks', 48)}>
        {eyebrow && <p className="font-pixel text-sun text-xs tracking-[0.3em] mb-1 uppercase">{eyebrow}</p>}
        <h2 className="px-title text-cream text-2xl sm:text-4xl tracking-wide uppercase">{title}</h2>
      </div>
      {sub && <p className="mt-5 text-cream/80 max-w-2xl mx-auto">{sub}</p>}
    </div>
  );
}

const AVATAR_COLORS = ['#3f7d3a', '#7a5230', '#c9a94a', '#3b6ea5'];

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
    team_members: [],
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
    // Extra members added from the admin Website Content page
    ...(Array.isArray(siteData.team_members) ? siteData.team_members : [])
      .filter(m => m && m.name && m.name.trim())
      .map(m => ({
        name: m.name.trim(),
        role: (m.position || '').trim() || 'Team Member',
        avatar: m.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        dept: (m.dept || '').trim(),
      })),
  ];

  return (
    <PublicLayout>
      <PixelBanner
        eyebrow="OUR STORY & MOVEMENT"
        title={siteData.hero_title || 'About renature'}
        subtitle={siteData.hero_subtitle}
      />

      <div className="relative pb-24" style={texture('darkPlanks', 72)}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50 pointer-events-none" />

        {/* ─── Introduction & Story ─── */}
        <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
            <div className="px-panel p-6 sm:p-8" style={texture('parchment', 64)}>
              <p className="font-pixel text-sm tracking-[0.2em] uppercase text-earth mb-2">Origin Story</p>
              <h2 className="font-pixel text-2xl sm:text-3xl text-bark uppercase mb-5">{siteData.story_title}</h2>
              <p className="text-bark/85 leading-relaxed mb-4">{siteData.story_paragraph1}</p>
              <p className="text-bark/75 leading-relaxed text-sm">{siteData.story_paragraph2}</p>
            </div>

            <figure className="mx-auto w-full max-w-sm rotate-[1deg]">
              <div className="px-panel p-3 sm:p-4" style={texture('planks', 56)}>
                <div className="px-panel--thin overflow-hidden bg-bark">
                  <img
                    src="/IMG_9183.jpeg"
                    alt="renature Tree Planting"
                    className="w-full aspect-[4/5] object-cover"
                  />
                </div>
              </div>
              <figcaption className="mx-auto -mt-1 w-fit max-w-[90%] px-4 py-1.5 bg-[#3a2a1a] text-cream text-center">
                <span className="font-pixel text-sun text-xs tracking-[0.15em] uppercase block">Field Archive</span>
                <span className="text-xs">Volunteers planting native saplings during the annual green sprint.</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ─── What We Do ─── */}
        <section className="relative max-w-6xl mx-auto px-6 py-16">
          <SectionSign eyebrow="Action in Practice" title="What We Do" sub="Regular activities organized throughout the academic year." />
          <div className="flex flex-col gap-16">
            {ACTIVITIES.map((activity, i) => (
              <div key={activity.title} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                <div className={`px-panel p-6 sm:p-8 ${i % 2 !== 0 ? 'lg:order-2' : ''}`} style={texture('parchment', 64)}>
                  <span className="inline-block font-pixel text-[11px] tracking-[0.1em] uppercase px-2 py-0.5 mb-3 bg-sage/50 text-deep">{activity.tag}</span>
                  <h3 className="font-pixel text-xl sm:text-2xl text-bark uppercase mb-3">{activity.title}</h3>
                  <p className="text-bark/85 leading-relaxed">{activity.description}</p>
                </div>
                <div className={`px-panel p-3 ${i % 2 !== 0 ? 'lg:order-1 -rotate-[0.8deg]' : 'rotate-[0.8deg]'}`} style={texture('planks', 56)}>
                  <div className="px-panel--thin h-56 sm:h-72 overflow-hidden bg-bark">
                    <img src={activity.image} alt={activity.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Why Participate ─── */}
        <section className="relative max-w-4xl mx-auto px-6 py-16">
          <div className="px-panel p-6 sm:p-10" style={texture('parchment', 64)}>
            <h2 className="font-pixel text-2xl sm:text-3xl text-bark uppercase mb-7">Why Join renature as a Student?</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(siteData.benefits || DEFAULT_BENEFITS).map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span aria-hidden="true" className="w-6 h-6 mt-0.5 shrink-0 bg-forest px-panel--thin flex items-center justify-center text-cream text-xs">✔</span>
                  <span className="text-bark/90">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Team ─── */}
        <section className="relative max-w-6xl mx-auto px-6 py-16">
          <SectionSign eyebrow="Leadership" title="Meet the Team" sub="The student coordinators leading our conservation expeditions." />
          <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)] max-w-sm px-panel p-6 flex flex-col items-center text-center transition-transform duration-200 hover:-translate-y-1" style={texture('parchment', 64)}>
                <div
                  className="w-20 h-20 px-panel--thin flex items-center justify-center mb-4 font-pixel text-3xl text-cream px-shadow-sm"
                  style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  aria-hidden="true"
                >
                  {member.avatar}
                </div>
                <h4 className="font-bold text-lg text-bark">{member.name}</h4>
                <p className="font-pixel text-forest text-sm uppercase tracking-[0.1em]">{member.role}</p>
                {member.dept && <p className="text-bark/65 text-sm">{member.dept}</p>}
              </div>
            ))}
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
