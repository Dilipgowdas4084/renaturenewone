import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Globe, ExternalLink, Leaf, Search, TreePine, Bird, Mountain, Droplets, BookOpen, Sprout } from 'lucide-react';

/* ─── Placeholder data shown when API is unavailable ─── */
const SAMPLE_RESOURCES = [
  { id: 1, title: 'World Wildlife Fund', description: 'Global conservation organization working to protect wildlife and habitats around the world.', category: 'Wildlife', image_url: null, external_url: 'https://www.worldwildlife.org', tags: 'conservation,wildlife,global' },
  { id: 2, title: 'IUCN Red List', description: 'The world\'s most comprehensive information source on the global conservation status of animal, fungi and plant species.', category: 'Conservation', image_url: null, external_url: 'https://www.iucnredlist.org', tags: 'endangered,species,research' },
  { id: 3, title: 'National Geographic – Environment', description: 'Explore the latest news, articles, and features about the environment, climate change, and sustainability.', category: 'Environment', image_url: null, external_url: 'https://www.nationalgeographic.com/environment', tags: 'environment,climate,news' },
  { id: 4, title: 'The Jane Goodall Institute', description: 'A global community conservation organization that advances the vision and work of Dr. Jane Goodall.', category: 'Wildlife', image_url: null, external_url: 'https://www.janegoodall.org', tags: 'primates,conservation,education' },
  { id: 5, title: 'UN Environment Programme', description: 'The leading global environmental authority that sets the global environmental agenda and promotes sustainable development.', category: 'Sustainability', image_url: null, external_url: 'https://www.unep.org', tags: 'un,sustainability,policy' },
  { id: 6, title: 'eBird – Cornell Lab', description: 'A real-time, online checklist program that has revolutionized the way the birding community reports and accesses information about birds.', category: 'Nature', image_url: null, external_url: 'https://ebird.org', tags: 'birds,citizen-science,data' },
  { id: 7, title: 'Down To Earth', description: 'India\'s leading environment magazine and website covering wildlife, forests, pollution, energy, and climate change.', category: 'Education', image_url: null, external_url: 'https://www.downtoearth.org.in', tags: 'india,environment,magazine' },
  { id: 8, title: 'India Biodiversity Portal', description: 'A repository of information on India\'s biodiversity including species pages, observations, documents, and datasets.', category: 'Nature', image_url: null, external_url: 'https://indiabiodiversity.org', tags: 'india,biodiversity,species' },
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
    Nature: 'from-emerald-600/20 to-green-900/40',
    Environment: 'from-teal-600/20 to-cyan-900/40',
    Wildlife: 'from-amber-600/20 to-orange-900/40',
    'Natural Estates': 'from-stone-600/20 to-stone-900/40',
    Sustainability: 'from-lime-600/20 to-green-900/40',
    Conservation: 'from-emerald-600/20 to-teal-900/40',
    Education: 'from-blue-600/20 to-indigo-900/40',
    'Eco-friendly': 'from-cyan-600/20 to-teal-900/40',
  };
  return gradients[category] || 'from-emerald-600/20 to-green-900/40';
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
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(134,239,172,0.06)_0%,_transparent_60%)]" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#86efac]/10 border border-[#86efac]/20 mb-6">
            <Globe className="w-8 h-8 text-[#86efac]" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
            Nature & <span className="text-[#86efac]">Resources</span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Explore curated websites, organizations, and resources related to nature, wildlife, conservation, and sustainability.
          </p>
        </div>
      </section>

      {/* Sample data banner */}
      {usingSample && (
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm text-center">
            Showing sample resources — admin can add real resources from the dashboard.
          </div>
        </div>
      )}

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-6 mb-10">
        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#86efac]/40 transition-colors"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-[#86efac] text-black'
                  : 'bg-white/[0.03] border border-white/[0.08] text-stone-400 hover:text-white hover:border-stone-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <LoadingSpinner message="Loading resources..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No resources found"
            description={searchQuery ? 'Try a different search term.' : 'No resources available in this category yet.'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(resource => {
              const CatIcon = CATEGORY_ICONS[resource.category] || Globe;
              return (
                <div
                  key={resource.id}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-[#86efac]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#86efac]/5 flex flex-col"
                >
                  {/* Image / Gradient header */}
                  {resource.image_url ? (
                    <div className="h-40 overflow-hidden">
                      <img src={resource.image_url} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className={`h-40 bg-gradient-to-br ${getCategoryGradient(resource.category)} flex items-center justify-center`}>
                      <CatIcon className="w-12 h-12 text-white/20" />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Category badge */}
                    <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                      <CatIcon className="w-3 h-3" />
                      {resource.category}
                    </span>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#86efac] transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-stone-400 leading-relaxed mb-4 flex-1 line-clamp-3">
                      {resource.description}
                    </p>

                    {/* Tags */}
                    {resource.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(typeof resource.tags === 'string' ? resource.tags.split(',') : resource.tags).slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-medium bg-white/[0.04] text-stone-500 border border-white/[0.06]">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Link */}
                    {resource.external_url && (
                      <a
                        href={resource.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#86efac]/10 text-[#86efac] font-medium text-sm hover:bg-[#86efac] hover:text-black transition-all duration-300 self-start"
                      >
                        Visit Website
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
