import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Globe, ExternalLink, Leaf, Search, TreePine, Bird, Mountain, Droplets, BookOpen, Sprout, Sparkles } from 'lucide-react';

/* ─── Placeholder data shown when API is unavailable ─── */
const SAMPLE_RESOURCES = [
  { id: 1, title: 'World Wildlife Fund', description: 'Global conservation organization working to protect endangered wildlife and fragile ecosystems around the world.', category: 'Wildlife', image_url: null, external_url: 'https://www.worldwildlife.org', tags: 'conservation,wildlife,global' },
  { id: 2, title: 'IUCN Red List', description: 'The world\'s most comprehensive information source on the global conservation status of animal, fungi and plant species.', category: 'Conservation', image_url: null, external_url: 'https://www.iucnredlist.org', tags: 'endangered,species,research' },
  { id: 3, title: 'National Geographic – Environment', description: 'Explore the latest news, articles, and scientific features about climate change, biodiversity, and sustainability.', category: 'Environment', image_url: null, external_url: 'https://www.nationalgeographic.com/environment', tags: 'environment,climate,news' },
  { id: 4, title: 'The Jane Goodall Institute', description: 'A global community conservation organization advancing the vision and field work of Dr. Jane Goodall.', category: 'Wildlife', image_url: null, external_url: 'https://www.janegoodall.org', tags: 'primates,conservation,education' },
  { id: 5, title: 'UN Environment Programme', description: 'The leading global environmental authority setting ecological agendas and promoting sustainable development goals.', category: 'Sustainability', image_url: null, external_url: 'https://www.unep.org', tags: 'un,sustainability,policy' },
  { id: 6, title: 'eBird – Cornell Lab', description: 'A real-time, online checklist program revolutionizing how bird enthusiasts report and access ecological data.', category: 'Nature', image_url: null, external_url: 'https://ebird.org', tags: 'birds,citizen-science,data' },
  { id: 7, title: 'Down To Earth', description: 'India\'s leading environment magazine covering wildlife, forests, pollution, clean energy, and climate policy.', category: 'Education', image_url: null, external_url: 'https://www.downtoearth.org.in', tags: 'india,environment,magazine' },
  { id: 8, title: 'India Biodiversity Portal', description: 'An open repository of information on India\'s rich biodiversity including species distribution and datasets.', category: 'Nature', image_url: null, external_url: 'https://indiabiodiversity.org', tags: 'india,biodiversity,species' },
];

const CATEGORIES = ['All', 'Nature', 'Environment', 'Wildlife', 'Natural Estates', 'Sustainability', 'Conservation', 'Education', 'Eco-friendly'];

const CATEGORY_ICONS = {
  Nature: Leaf,
  Environment: Globe,
  Wildlife: Bird,
  'Natural Estates': Mountain,
  Sustainability: Sprout,
  Conservation: TreePine,
  Education: BookOpen,
  'Eco-friendly': Droplets,
};

function getCategoryGradient(category) {
  const gradients = {
    Nature: 'from-emerald-900/40 via-[#0a1e16] to-[#040d0a]',
    Environment: 'from-teal-900/40 via-[#081f1d] to-[#040d0a]',
    Wildlife: 'from-amber-900/40 via-[#1c1509] to-[#040d0a]',
    'Natural Estates': 'from-stone-900/40 via-[#191919] to-[#040d0a]',
    Sustainability: 'from-emerald-800/40 via-[#0a1e16] to-[#040d0a]',
    Conservation: 'from-teal-900/40 via-[#071f18] to-[#040d0a]',
    Education: 'from-sky-900/40 via-[#0a1c22] to-[#040d0a]',
    'Eco-friendly': 'from-cyan-900/40 via-[#081e20] to-[#040d0a]',
  };
  return gradients[category] || 'from-emerald-900/40 via-[#0a1e16] to-[#040d0a]';
}

export default function NatureResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [usingSample, setUsingSample] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await api.get('/resources');
        if (res.data && res.data.length > 0) {
          setResources(res.data);
        } else {
          setResources(SAMPLE_RESOURCES);
          setUsingSample(true);
        }
      } catch {
        setResources(SAMPLE_RESOURCES);
        setUsingSample(true);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filtered = resources.filter(r => {
    const matchCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#040d0a] text-stone-200 pb-24 selection:bg-emerald-500/20 selection:text-emerald-300">
        
        {/* Hero */}
        <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 overflow-hidden px-4 sm:px-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08)_0%,_transparent_60%)]" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 sm:mb-6 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Globe className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-3 sm:mb-4">
              Nature & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Resources</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Explore curated portals, wildlife research repositories, and global organizations championing conservation.
            </p>
          </div>
        </section>

        {usingSample && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
            <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated nature directory preview.</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-8 sm:mb-10">
          {/* Search */}
          <div className="relative max-w-md mx-auto mb-6 sm:mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search resources, topics, or domains..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#091a14]/90 border border-white/[0.08] text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-lg shadow-black/20 min-h-[44px]"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 justify-start sm:justify-center px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[44px] flex items-center shrink-0 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#04110b] font-bold shadow-md shadow-emerald-500/20 scale-105'
                    : 'bg-[#091a14]/70 border border-white/[0.08] text-stone-400 hover:text-white hover:border-emerald-500/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Content */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          {loading ? (
            <LoadingSpinner message="Loading resources..." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No resources found"
              description={searchQuery ? 'Try adjusting your search query.' : 'No resources available in this category yet.'}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(resource => {
                const CatIcon = CATEGORY_ICONS[resource.category] || Globe;
                return (
                  <div
                    key={resource.id}
                    className="group rounded-3xl border border-white/[0.08] bg-[#091a14]/60 overflow-hidden hover:border-emerald-500/35 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 flex flex-col backdrop-blur-xl"
                  >
                    {/* Header Banner */}
                    {resource.image_url ? (
                      <div className="h-44 overflow-hidden relative">
                        <img src={resource.image_url} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#091a14] via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className={`h-40 bg-gradient-to-br ${getCategoryGradient(resource.category)} flex items-center justify-center relative border-b border-white/[0.04]`}>
                        <CatIcon className="w-12 h-12 text-white/20 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}

                    {/* Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Category badge */}
                        <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 mb-3">
                          <CatIcon className="w-3 h-3" />
                          {resource.category}
                        </span>

                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-400 leading-relaxed mb-4 line-clamp-3">
                          {resource.description}
                        </p>

                        {/* Tags */}
                        {resource.tags && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {(typeof resource.tags === 'string' ? resource.tags.split(',') : resource.tags).slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-semibold bg-white/[0.04] text-stone-400 border border-white/[0.06]">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Link */}
                      {resource.external_url && (
                        <div className="pt-2 border-t border-white/[0.06]">
                          <a
                            href={resource.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] text-stone-200 font-semibold text-xs hover:bg-emerald-500/15 hover:text-emerald-300 hover:border-emerald-500/30 border border-white/[0.08] transition-all duration-200"
                          >
                            Explore Organization
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </PublicLayout>
  );
}
