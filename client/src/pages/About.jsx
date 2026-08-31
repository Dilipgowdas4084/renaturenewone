import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Target, Leaf, Users, Globe, BookOpen, TreePine, CheckCircle } from 'lucide-react';

const OBJECTIVES = [
  {
    icon: <Target className="w-6 h-6 text-[#86efac]" />,
    title: 'Focused Action',
    description: 'We organize targeted cleanups and conservation drives to restore natural habitats on and off campus.'
  },
  {
    icon: <Leaf className="w-6 h-6 text-[#86efac]" />,
    title: 'Sustainable Growth',
    description: 'Promoting long-term sustainability through continuous tree-planting and nurturing initiatives.'
  },
  {
    icon: <Users className="w-6 h-6 text-[#86efac]" />,
    title: 'Community Engagement',
    description: 'Empowering students to take leadership roles in environmental stewardship and advocacy.'
  },
  {
    icon: <Globe className="w-6 h-6 text-[#86efac]" />,
    title: 'Global Impact',
    description: 'Thinking globally while acting locally to combat climate change and biodiversity loss.'
  },
  {
    icon: <BookOpen className="w-6 h-6 text-[#86efac]" />,
    title: 'Education & Awareness',
    description: 'Conducting workshops and seminars to spread knowledge about ecological conservation.'
  },
  {
    icon: <TreePine className="w-6 h-6 text-[#86efac]" />,
    title: 'Biodiversity Preservation',
    description: 'Protecting and documenting local flora and fauna to ensure a thriving ecosystem.'
  }
];

const ACTIVITIES = [
  {
    title: 'Nature Walks & Expeditions',
    description: 'Explore the hidden beauty of our surroundings. Our guided nature walks are designed to connect students with local ecosystems, learn about native species, and appreciate the outdoors.',
    imagePlaceholder: 'Nature Walk Image Placeholder'
  },
  {
    title: 'Tree Plantation Drives',
    description: 'Leave a lasting legacy by planting native trees around the campus and neighboring areas. We ensure long-term care for every sapling planted.',
    imagePlaceholder: 'Tree Planting Image Placeholder'
  },
  {
    title: 'Workshops & Seminars',
    description: 'Learn from experts in the field of conservation, sustainable agriculture, and climate science through our interactive sessions.',
    imagePlaceholder: 'Workshop Image Placeholder'
  }
];

const BENEFITS = [
  'Gain hands-on experience in environmental conservation',
  'Connect with like-minded peers and industry experts',
  'Earn volunteer hours and certificates for active participation',
  'Develop leadership and organizational skills',
  'Contribute to a healthier, greener planet'
];

const TEAM = [
  { name: 'Alice Walker', role: 'President', avatar: 'AW' },
  { name: 'Bob Smith', role: 'Vice President', avatar: 'BS' },
  { name: 'Charlie Green', role: 'Events Coordinator', avatar: 'CG' },
  { name: 'Diana Ross', role: 'Outreach Lead', avatar: 'DR' },
];

export default function About() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-black text-stone-200 selection:bg-[#86efac]/30 selection:text-[#86efac] pb-24">
        
        {/* ─── Hero Banner ─── */}
        <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/PHOTO-2026-08-13-19-44-48.png)' }}
          />
          <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              About <span className="text-[#86efac]">Renature</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
              We are a passionate community of students dedicated to protecting our environment, fostering sustainability, and nurturing nature.
            </p>
          </div>
        </section>

        {/* ─── Introduction ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
              <p className="text-stone-400 leading-relaxed mb-4">
                Renature started with a simple idea: that students have the power to create meaningful environmental change. What began as a small group of nature enthusiasts has grown into a campus-wide movement.
              </p>
              <p className="text-stone-400 leading-relaxed">
                We believe that by reconnecting with nature and taking collective action, we can build a more sustainable future for our campus and beyond.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] h-80 flex items-center justify-center backdrop-blur-xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(134,239,172,0.1)_0%,_transparent_70%)]" />
               <span className="text-stone-500 font-medium tracking-widest uppercase">Nature Image Placeholder</span>
            </div>
          </div>
        </section>

        {/* ─── Mission & Vision ─── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-900/30 backdrop-blur-xl transition-all duration-300 hover:border-[#86efac]/30">
              <div className="w-12 h-12 rounded-full bg-[#86efac]/10 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-[#86efac]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-stone-400 leading-relaxed">
                To inspire and empower students to take proactive steps in environmental conservation through education, hands-on activities, and community engagement.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-900/30 backdrop-blur-xl transition-all duration-300 hover:border-[#86efac]/30">
              <div className="w-12 h-12 rounded-full bg-[#86efac]/10 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-[#86efac]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-stone-400 leading-relaxed">
                A world where every campus is a thriving, self-sustaining ecosystem, and every student is a responsible steward of the environment.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Objectives ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Our Objectives</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">The core goals that drive our initiatives and shape our impact.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OBJECTIVES.map((obj, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04]">
                <div className="mb-4">{obj.icon}</div>
                <h4 className="text-xl font-semibold text-white mb-2">{obj.title}</h4>
                <p className="text-stone-400 text-sm leading-relaxed">{obj.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── What We Do ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">What We Do</h2>
          </div>
          <div className="flex flex-col gap-20">
            {ACTIVITIES.map((activity, i) => (
              <div key={i} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={i % 2 !== 0 ? 'lg:order-2' : ''}>
                  <h3 className="text-2xl font-bold text-white mb-4">{activity.title}</h3>
                  <p className="text-stone-400 leading-relaxed">{activity.description}</p>
                </div>
                <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] h-72 flex items-center justify-center backdrop-blur-xl ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                  <span className="text-stone-500 font-medium tracking-widest uppercase text-sm text-center px-4">
                    {activity.imagePlaceholder}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Why Participate ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="p-10 rounded-3xl bg-emerald-950/20 border border-emerald-900/30 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_right,_rgba(134,239,172,0.05)_0%,_transparent_70%)] pointer-events-none" />
             <h2 className="text-3xl font-bold text-white mb-8">Why Participate?</h2>
             <div className="flex flex-col gap-4">
               {BENEFITS.map((benefit, i) => (
                 <div key={i} className="flex items-start gap-3">
                   <CheckCircle className="w-6 h-6 text-[#86efac] shrink-0" />
                   <span className="text-stone-300">{benefit}</span>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* ─── Team ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Meet the Team</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">The passionate individuals leading our movement.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center transition-all duration-300 hover:bg-white/[0.04]">
                <div className="w-24 h-24 rounded-full bg-emerald-950/50 border border-[#86efac]/20 flex items-center justify-center mb-4 text-2xl font-bold text-[#86efac]">
                  {member.avatar}
                </div>
                <h4 className="text-lg font-semibold text-white">{member.name}</h4>
                <p className="text-stone-400 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
