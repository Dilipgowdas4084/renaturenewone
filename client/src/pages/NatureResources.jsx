import { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { LibraryHeader, ReadingNook } from '../components/pixel/LibraryScene';
import { useDayNight } from '../context/DayNightContext';
import api from '../utils/api';
import { texture } from '../utils/pixelTextures';
import { Globe, ExternalLink, Leaf, Search, TreePine, Bird, Mountain, Droplets, BookOpen, Sprout } from 'lucide-react';

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

const CATEGORY_COLORS = {
  Nature: '#4f9a47',
  Environment: '#3b8fb0',
  Wildlife: '#d19a3a',
  'Natural Estates': '#8a5d31',
  Sustainability: '#7fb04a',
  Conservation: '#2f6b3a',
  Education: '#4c6fb0',
  'Eco-friendly': '#2f9a8f',
};

function Thumb({ resource, color, CatIcon, className = 'h-40' }) {
  return resource.image_url ? (
    <div className={`${className} overflow-hidden bg-bark`}>
      <img src={resource.image_url} alt={resource.title} className="w-full h-full object-cover" />
    </div>
  ) : (
    <div
      className={`${className} flex items-center justify-center`}
      style={{ backgroundColor: color, boxShadow: 'inset 0 -8px 0 rgba(0,0,0,0.2), inset 0 6px 0 rgba(255,255,255,0.2)' }}
      aria-hidden="true"
    >
      <CatIcon className="w-14 h-14 text-cream drop-shadow-[3px_3px_0_rgba(0,0,0,0.3)]" />
    </div>
  );
}

function Details({ resource, tags }) {
  return (
    <>
      <span className="self-start font-pixel text-[11px] tracking-[0.1em] uppercase px-2 py-0.5 mb-3 bg-sage/50 text-deep">
        {resource.category}
      </span>
      <p className="text-sm text-bark/80 leading-relaxed mb-4 flex-1 line-clamp-3">{resource.description}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map(tag => (
            <span key={tag} className="font-pixel text-[10px] uppercase tracking-wider px-2 py-0.5 bg-earth/15 text-earth">{tag}</span>
          ))}
        </div>
      )}
      {resource.external_url && (
        <a
          href={resource.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-btn px-btn--grass px-btn--sm self-start"
        >
          Explore Organization
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      )}
    </>
  );
}

const BOOKS = [
  { cover: '#2f7a3a', spine: '#1f5a2c', title: 'text-cream' },
  { cover: '#8a5d31', spine: '#5b3a1e', title: 'text-cream' },
  { cover: '#3b6ea5', spine: '#274d78', title: 'text-cream' },
  { cover: '#d8c49a', spine: '#a58a55', title: 'text-bark' },
  { cover: '#1f4a2a', spine: '#123219', title: 'text-cream' },
  { cover: '#8a3f2b', spine: '#5e2a1c', title: 'text-cream' },
];
const LIFT = ['pt-0', 'pt-6', 'pt-3', 'pt-9', 'pt-2', 'pt-5'];
const SHELF_SIZE = 3;

const hoverLift = 'transition-all duration-200 hover:-translate-y-3 hover:scale-[1.03] focus-within:-translate-y-3 focus-within:scale-[1.03] hover:z-10 focus-within:z-10 hover:brightness-110 active:translate-y-0 active:scale-100 motion-reduce:transition-none motion-reduce:transform-none';

function OpenTag() {
  return (
    <span aria-hidden="true" className="absolute -bottom-3 right-3 z-20 px-panel--thin bg-sun text-bark font-pixel text-[11px] uppercase tracking-wider px-2 py-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
      Open book →
    </span>
  );
}

// A resource shown as a book standing on a shelf.
function Book({ resource, index }) {
  const CatIcon = CATEGORY_ICONS[resource.category] || Globe;
  const color = CATEGORY_COLORS[resource.category] || CATEGORY_COLORS.Nature;
  const tags = (typeof resource.tags === 'string' ? resource.tags.split(',') : (resource.tags || [])).map(t => t.trim()).filter(Boolean).slice(0, 3);
  const b = BOOKS[index % BOOKS.length];
  return (
    <article className={`group relative ${LIFT[index % LIFT.length]}`}>
      <div className={`h-full ${hoverLift} drop-shadow-[6px_6px_0_rgba(0,0,0,0.35)] hover:drop-shadow-[10px_10px_0_rgba(0,0,0,0.4)] group-hover:outline group-hover:outline-2 group-hover:outline-sun`}>
        <div className="flex h-full border-4 border-[#3a2a1a]" style={{ backgroundColor: b.cover }}>
          <div
            className="w-4 shrink-0 border-r-4 border-[#3a2a1a]"
            style={{ backgroundColor: b.spine, backgroundImage: 'linear-gradient(transparent 12%, rgba(0,0,0,0.35) 12% 16%, transparent 16% 84%, rgba(0,0,0,0.35) 84% 88%, transparent 88%)' }}
            aria-hidden="true"
          />
          <div className="flex-1 flex flex-col gap-3 p-3">
            <div className="border-4 border-[#3a2a1a]">
              <Thumb resource={resource} color={color} CatIcon={CatIcon} className="h-28" />
            </div>
            <h3 className={`font-pixel text-lg leading-snug uppercase ${b.title}`}>{resource.title}</h3>
            <div className="border-4 border-[#3a2a1a] flex-1 flex flex-col p-3" style={texture('parchment', 64)}>
              <Details resource={resource} tags={tags} />
            </div>
          </div>
        </div>
        <div className="h-2 mx-1 border-x-4 border-b-4 border-[#3a2a1a] bg-[#f3e6bf]" aria-hidden="true" />
      </div>
      <OpenTag />
    </article>
  );
}

// A picture-led resource mounted on the wall in a wooden item frame.
function FramedResource({ resource, index }) {
  const CatIcon = CATEGORY_ICONS[resource.category] || Globe;
  const color = CATEGORY_COLORS[resource.category] || CATEGORY_COLORS.Nature;
  const tags = (typeof resource.tags === 'string' ? resource.tags.split(',') : (resource.tags || [])).map(t => t.trim()).filter(Boolean).slice(0, 3);
  return (
    <article className={`group relative ${LIFT[index % LIFT.length]}`}>
      <div className={`h-full flex flex-col ${hoverLift} drop-shadow-[6px_6px_0_rgba(0,0,0,0.35)] group-hover:outline group-hover:outline-2 group-hover:outline-sun`}>
        <div className="px-panel p-3" style={texture('planks', 56)}>
          <div className="border-4 border-[#3a2a1a] overflow-hidden">
            <div className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none">
              <Thumb resource={resource} color={color} CatIcon={CatIcon} className="h-36" />
            </div>
          </div>
        </div>
        <div className="mx-auto -mt-1 px-4 py-1 bg-[#3a2a1a] text-cream font-pixel text-sm uppercase tracking-wide text-center">{resource.title}</div>
        <div className="px-panel flex-1 flex flex-col p-4 mt-1" style={texture('parchment', 64)}>
          <Details resource={resource} tags={tags} />
        </div>
      </div>
      <OpenTag />
    </article>
  );
}

function Shelf({ number, items, startIndex }) {
  return (
    <section aria-label={`Shelf ${number}`} className="relative">
      <div className="flex items-center gap-3 mb-3">
        <span className="px-panel--thin bg-[#3a2a1a] text-sun font-pixel text-xs tracking-[0.2em] px-3 py-1">SHELF {String(number).padStart(2, '0')}</span>
        <Lantern2 />
      </div>
      <div className="border-4 border-[#3a2a1a]" style={{ ...texture('darkPlanks', 64), boxShadow: 'inset 0 10px 0 rgba(0,0,0,0.35), inset 8px 0 0 rgba(0,0,0,0.25), inset -8px 0 0 rgba(0,0,0,0.25)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-end px-5 sm:px-8 pt-8 pb-1">
          {items.map((r, i) => {
            const idx = startIndex + i;
            return r.image_url && idx % 3 === 1
              ? <FramedResource key={r.id} resource={r} index={idx} />
              : <Book key={r.id} resource={r} index={idx} />;
          })}
        </div>
        {/* wooden shelf plank */}
        <div className="h-5 mt-6 border-t-4 border-[#3a2a1a] shadow-[0_6px_0_rgba(0,0,0,0.35)]" style={texture('planks', 48)} aria-hidden="true" />
      </div>
    </section>
  );
}

function Lantern2() {
  return (
    <span className="inline-flex flex-col items-center" aria-hidden="true">
      <span className="w-1 h-1 bg-[#2b2b2b]" />
      <span className="w-3 h-4 bg-[#3a3a3a] flex items-center justify-center"><span className="cv-flicker w-1.5 h-2 bg-[#ffd54a]" /></span>
    </span>
  );
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
        if (Array.isArray(res.data) && res.data.length > 0) {
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

  const { night } = useDayNight();
  const categories = CATEGORIES;
  const shelves = [];
  for (let i = 0; i < filtered.length; i += SHELF_SIZE) shelves.push(filtered.slice(i, i + SHELF_SIZE));

  return (
    <PublicLayout>
      <LibraryHeader
        eyebrow="NATURE LIBRARY"
        title="NATURE & RESOURCES"
        subtitle="Explore curated portals, wildlife research repositories, and global organizations championing conservation."
      />

      <div className="relative pb-24 overflow-hidden" style={texture('darkPlanks', 72)}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/50 pointer-events-none" />
        {night && <div className="absolute inset-0 bg-[#0a1030]/30 pointer-events-none" />}

        {/* roof beam */}
        <div className="relative h-5 border-b-4 border-[#3a2a1a] bg-[#5b3a1e]" aria-hidden="true" />

        {/* log pillars (large screens) */}
        <div className="hidden lg:block absolute inset-y-5 left-0 w-8 bg-[#5b3a1e] border-r-4 border-[#3a2a1a]" aria-hidden="true" />
        <div className="hidden lg:block absolute inset-y-5 right-0 w-8 bg-[#5b3a1e] border-l-4 border-[#3a2a1a]" aria-hidden="true" />

        {/* Sample data banner */}
        {usingSample && (
          <div className="relative max-w-6xl mx-auto px-6 pt-10">
            <div className="px-panel px-panel--thin px-4 py-3 bg-ember text-bark text-sm font-semibold text-center">
              Curated nature directory preview.
            </div>
          </div>
        )}

        {/* Search + category signs */}
        <section className="relative max-w-3xl mx-auto px-6 pt-12 mb-14">
          <div className="px-panel p-5 sm:p-6" style={texture('planks', 56)}>
            <div className="relative max-w-md mx-auto mb-5">
              <label htmlFor="resource-search" className="sr-only">Search resources</label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth pointer-events-none" aria-hidden="true" />
              <input
                id="resource-search"
                type="text"
                placeholder="Search resources, topics, or domains..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-input w-full !pl-12"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Filter by category">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                  className={`px-btn px-btn--sm ${activeCategory === cat ? 'px-btn--grass' : 'px-btn--wood'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* The shelves */}
        <section className="relative max-w-6xl mx-auto px-6 lg:px-14">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4" role="status">
              <div className="flex gap-2" aria-hidden="true">
                {[0, 1, 2].map(i => <span key={i} className="w-4 h-4 bg-sun px-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
              <p className="font-pixel text-cream tracking-[0.2em] px-shadow-sm">LOADING RESOURCES...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="max-w-md mx-auto px-panel p-8 text-center" style={texture('parchment', 64)}>
              <Globe className="w-10 h-10 text-forest mx-auto mb-3" aria-hidden="true" />
              <h2 className="font-pixel text-2xl text-bark mb-2">NO RESOURCES FOUND</h2>
              <p className="text-bark/75">{searchQuery ? 'Try adjusting your search query.' : 'No resources available in this category yet.'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-14">
              {shelves.map((items, s) => (
                <Shelf key={s} number={s + 1} items={items} startIndex={s * SHELF_SIZE} />
              ))}
            </div>
          )}
        </section>

        {/* reading corner */}
        <section className="relative max-w-3xl mx-auto px-6 mt-20" aria-hidden="true">
          <div className="border-4 border-[#3a2a1a] shadow-[6px_6px_0_rgba(0,0,0,0.35)]">
            <ReadingNook />
          </div>
        </section>
      </div>

      {/* cobblestone foundation */}
      <div className="h-8 border-y-4 border-[#3a2a1a]" style={texture('stone', 32)} aria-hidden="true" />
    </PublicLayout>
  );
}
