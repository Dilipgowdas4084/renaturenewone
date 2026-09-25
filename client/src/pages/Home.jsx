import { Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TreePine,
  Award,
  Compass,
  Activity,
  CheckCircle2,
  Users,
  Heart,
  Sprout,
  Quote
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

// ─── Real Club Photos & Curated Nature Images ───
const GALLERY_ITEMS = [
  {
    image: '/IMG_9183.jpeg',
    title: 'Native Tree Plantation Drive',
    tag: 'Afforestation',
    location: 'North Campus Grounds'
  },
  {
    image: '/IMG_9279.jpeg',
    title: 'Lakeside Wetland Cleanup',
    tag: 'Conservation',
    location: 'Bellandur Lakefront'
  },
  {
    image: '/IMG_9723.jpeg',
    title: 'Avian Biodiversity Survey',
    tag: 'Wildlife',
    location: 'Bannerghatta Trail'
  },
  {
    image: '/PHOTO-2026-08-13-19-44-48.png',
    title: 'renature Core Team & Volunteers',
    tag: 'Community',
    location: 'Campus Amphitheater'
  },
  {
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    title: 'Student Hands in the Soil',
    tag: 'Fieldwork',
    location: 'Botanical Garden'
  },
  {
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
    title: 'Canopy Canopy Ecology Study',
    tag: 'Research',
    location: 'Western Ghats Sector'
  }
];

// ─── Full-Width Interactive Gallery Carousel ───
function GalleryCarousel() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startScrollLeft: 0, hasMoved: false });
  const isProgrammaticScrollRef = useRef(false);
  const interactTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const pauseAutoSlide = useCallback(() => {
    setIsInteracting(true);
    if (interactTimeoutRef.current) clearTimeout(interactTimeoutRef.current);
    interactTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 6000);
  }, []);

  const scrollToIndex = useCallback((index, smooth = true) => {
    const container = containerRef.current;
    if (!container) return;
    const clampedIndex = (index + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
    
    // Immediately set activeIndex for instantaneous highlight reaction with zero gap
    setActiveIndex(clampedIndex);
    isProgrammaticScrollRef.current = true;

    const targetElement = container.children[clampedIndex];
    if (targetElement) {
      const containerWidth = container.clientWidth;
      const targetLeft = targetElement.offsetLeft - (containerWidth - targetElement.offsetWidth) / 2;
      container.scrollTo({
        left: targetLeft,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }

    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 450);
  }, []);

  const handleNext = useCallback(() => {
    pauseAutoSlide();
    scrollToIndex(activeIndex + 1, true);
  }, [activeIndex, scrollToIndex, pauseAutoSlide]);

  const handlePrev = useCallback(() => {
    pauseAutoSlide();
    scrollToIndex(activeIndex - 1, true);
  }, [activeIndex, scrollToIndex, pauseAutoSlide]);

  // Smooth auto-advance every 4.5 seconds when not interacting or hovered
  useEffect(() => {
    if (isHovered || isInteracting || isDragging) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % GALLERY_ITEMS.length;
        scrollToIndex(next, true);
        return next;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isHovered, isInteracting, isDragging, scrollToIndex]);

  // Scroll detection to update active index on user drag/scroll
  const handleScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const container = containerRef.current;
      if (!container || isProgrammaticScrollRef.current) return;
      const center = container.scrollLeft + container.clientWidth / 2;
      const items = container.children;
      let closest = 0;
      let minDist = Infinity;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const dist = Math.abs(center - itemCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      }
      setActiveIndex(closest);
    }, 40);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Mouse drag
  const handleMouseDown = (e) => {
    pauseAutoSlide();
    setIsDragging(true);
    dragRef.current.startX = e.clientX;
    dragRef.current.startScrollLeft = containerRef.current.scrollLeft;
    dragRef.current.hasMoved = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = e.clientX - dragRef.current.startX;
    if (Math.abs(diff) > 5) {
      dragRef.current.hasMoved = true;
    }
    containerRef.current.scrollLeft = dragRef.current.startScrollLeft - diff;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragRef.current.hasMoved) {
      handleScroll();
    }
  };

  // Touch drag
  const handleTouchStart = (e) => {
    pauseAutoSlide();
    dragRef.current.startX = e.touches[0].clientX;
    dragRef.current.startScrollLeft = containerRef.current.scrollLeft;
    dragRef.current.hasMoved = false;
  };

  const handleTouchMove = (e) => {
    const diff = e.touches[0].clientX - dragRef.current.startX;
    if (Math.abs(diff) > 5) {
      dragRef.current.hasMoved = true;
    }
    containerRef.current.scrollLeft = dragRef.current.startScrollLeft - diff;
  };

  const handleTouchEnd = () => {
    handleScroll();
  };

  return (
    <div 
      className="relative w-full my-8 group/gallery"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section Header with Side Navigation Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            Field Archive
          </div>
          <h3 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Moments on the Ground</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label="Previous photo"
            className="p-2 sm:p-2.5 rounded-full bg-white/[0.05] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-stone-300 hover:text-emerald-300 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next photo"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/10 min-h-[44px]"
            title="Next photo"
          >
            <span>Next photo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel Track Container */}
      <div className="relative w-full">
        {/* Soft edge fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-28 bg-gradient-to-r from-[#040d0a] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-28 bg-gradient-to-l from-[#040d0a] to-transparent z-10" />

        {/* Floating Side Action: Previous Photo (hidden on small mobile to avoid blocking thumb swipes) */}
        <button
          onClick={handlePrev}
          aria-label="Previous photo"
          className="hidden md:flex absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#040d0a]/85 backdrop-blur-md border border-white/15 text-stone-200 hover:text-white hover:border-emerald-400 hover:bg-[#071d15] shadow-2xl shadow-black/80 items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group"
          title="Previous photo"
        >
          <ChevronLeft className="w-6 h-6 text-stone-300 group-hover:text-emerald-300 transition-colors" />
        </button>

        {/* Floating Side Action: Next Photo (hidden on small mobile to avoid blocking thumb swipes) */}
        <button
          onClick={handleNext}
          aria-label="Next photo"
          className="hidden md:flex absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#040d0a]/85 backdrop-blur-md border border-white/15 text-stone-200 hover:text-white hover:border-emerald-400 hover:bg-[#071d15] shadow-2xl shadow-black/80 items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group"
          title="Next photo"
        >
          <ChevronRight className="w-6 h-6 text-stone-300 group-hover:text-emerald-300 transition-colors" />
        </button>

        {/* Carousel Track */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className={`flex w-full h-[52vh] sm:h-[58vh] overflow-x-auto select-none py-2 scroll-smooth ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ 
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {GALLERY_ITEMS.map((item, i) => (
            <div 
              key={i}
              className="min-w-[84vw] sm:min-w-[65vw] lg:min-w-[48vw] xl:min-w-[42vw] h-full flex items-center justify-center px-3 shrink-0"
              style={{ scrollSnapAlign: 'center' }}
            >
              <div 
                onClick={() => {
                  if (!dragRef.current.hasMoved) {
                    scrollToIndex(i, true);
                    pauseAutoSlide();
                  }
                }}
                className={`w-full h-full rounded-2xl overflow-hidden border transition-all duration-300 ease-out relative group cursor-pointer ${
                  activeIndex === i 
                    ? 'border-emerald-500/60 scale-100 shadow-2xl shadow-emerald-500/20 opacity-100 ring-1 ring-emerald-500/40' 
                    : 'border-white/[0.08] scale-[0.93] opacity-60 hover:opacity-85'
                }`}
              >
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80';
                  }}
                />
                
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#040d0a] via-black/40 to-transparent" />

                {/* Tag & Meta info */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md border border-white/10 text-emerald-300">
                    {item.tag}
                  </span>
                </div>

                {/* Caption */}
                <div className="absolute bottom-5 left-5 right-5">
                  <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-stone-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {item.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress & Slide Counter */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <span className="text-xs font-mono text-stone-400 tracking-wider">
          {String(activeIndex + 1).padStart(2, '0')} / {String(GALLERY_ITEMS.length).padStart(2, '0')}
        </span>
        <div className="flex items-center gap-2">
          {GALLERY_ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                pauseAutoSlide();
                scrollToIndex(i, true);
              }}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === i ? 'w-8 bg-emerald-400' : 'w-2 bg-stone-700 hover:bg-stone-500'
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Lightweight Ambient Particle Field ───
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];
    const count = 35;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * (w || 800),
        y: Math.random() * (h || 600),
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.35 + 0.1
      });
    }

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134, 239, 172, ${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />;
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
    const timer = setTimeout(() => setTypingStarted(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = useCallback((e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div 
      className="relative min-h-screen w-full bg-[#05110d] text-stone-200 overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-300 pb-16 lg:pb-0"
      onMouseMove={handleMouseMove}
    >
      {/* ─── Ambient Glow Grid ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />
        <div 
          className="absolute inset-0 transition-all duration-150 ease-out"
          style={{
            background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.08), transparent 75%)`
          }}
        />
      </div>

      {/* ─── Typing Keyframes ─── */}
      <style>{`
        @keyframes typing {
          from { max-width: 0; }
          to { max-width: 550px; }
        }
        @keyframes blink-caret {
          0%, 100% { border-color: #34d399; }
          50% { border-color: transparent; }
        }
        .typing-text {
          overflow: hidden;
          white-space: nowrap;
          display: inline-block;
          max-width: 0;
          border-right: 3px solid #34d399;
          animation: 
            typing 1.2s steps(8, end) forwards,
            blink-caret 0.8s step-end infinite;
        }
      `}</style>

      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Soft Radial Ambient Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-500/[0.08] blur-[120px] pointer-events-none" />
        
        <ParticleField />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center w-full flex-1 flex flex-col items-center justify-center">
          
          {/* Status Badge Pill */}
          <div className={`mb-6 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} transition-all duration-700`}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 shadow-md shadow-emerald-500/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                🌱 Growing a Greener Campus Together · NMAMIT
              </span>
            </div>
          </div>

          {/* Typing "renature" */}
          <div className="h-16 sm:h-20 lg:h-24 flex items-center justify-center mb-3">
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white ${typingStarted ? 'typing-text' : 'opacity-0'}`}>
              re<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300">nature</span>
            </h1>
          </div>

          {/* Headline */}
          <h2 className={`text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-[1.18] max-w-4xl mx-auto ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-300`}>
            Hands-On Campus Action. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
              Rooted in Friendship & Nature.
            </span>
          </h2>

          {/* Subtitle */}
          <p className={`text-base sm:text-lg lg:text-xl text-stone-200 max-w-2xl mx-auto mb-9 leading-relaxed font-normal ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-500`}>
            Join student volunteers, engineers, and naturalists cultivating our campus canopy through weekend tree plantings, wildlife surveys, and rewarding eco-stewardship.
          </p>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-700`}>
            <Link
              to="/register"
              className="group px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-[#04110b] font-bold text-sm transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] flex items-center gap-2 cursor-pointer"
            >
              <span>Join as Volunteer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/events"
              className="px-8 py-3.5 rounded-full border border-emerald-500/30 hover:border-emerald-400 text-stone-100 hover:text-white font-semibold text-sm transition-all duration-300 bg-emerald-950/30 hover:bg-emerald-900/40 backdrop-blur-sm shadow-sm"
            >
              Explore Field Drives
            </Link>
          </div>

          {/* Friendly Social Proof Community Strip */}
          <div className={`flex items-center justify-center gap-3 mb-14 text-xs text-stone-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-800`}>
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full border-2 border-[#061510] bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">🌱</div>
              <div className="w-7 h-7 rounded-full border-2 border-[#061510] bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">🌿</div>
              <div className="w-7 h-7 rounded-full border-2 border-[#061510] bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">🌻</div>
              <div className="w-7 h-7 rounded-full border-2 border-[#061510] bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">450+</div>
            </div>
            <span className="text-stone-300">Over <strong>450+ students</strong> active across 8 academic departments</span>
          </div>

          {/* Scroll cue */}
          <div 
            onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
            className={`cursor-pointer inline-flex flex-col items-center gap-1 text-stone-400 hover:text-emerald-300 transition-colors ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 delay-1000`}
          >
            <span className="text-[10px] tracking-widest uppercase font-semibold">Discover Impact</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── LIVE STATS STRIP ─── */}
      <section id="stats" className="relative z-10 max-w-7xl mx-auto px-6 -mt-4 mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c241c]/80 via-[#081a13]/85 to-[#061510]/90 border border-emerald-500/20 backdrop-blur-2xl shadow-xl shadow-black/40">
          <div className="flex flex-col items-center text-center p-3 rounded-2xl transition-all hover:bg-emerald-500/5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <TreePine className="w-5 h-5" />
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">500+</span>
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold mt-1">Native Trees</span>
            <p className="text-xs text-stone-400 mt-1">Planted across botanical zones</p>
          </div>

          <div className="flex flex-col items-center text-center p-3 rounded-2xl transition-all hover:bg-emerald-500/5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">1,200+</span>
            <span className="text-xs uppercase tracking-wider text-amber-300 font-bold mt-1">kg Waste Diverted</span>
            <p className="text-xs text-stone-400 mt-1">Cleared from campus waterbodies</p>
          </div>

          <div className="flex flex-col items-center text-center p-3 rounded-2xl transition-all hover:bg-emerald-500/5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-2">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">450+</span>
            <span className="text-xs uppercase tracking-wider text-teal-300 font-bold mt-1">Student Stewards</span>
            <p className="text-xs text-stone-400 mt-1">Volunteering & tracking progress</p>
          </div>

          <div className="flex flex-col items-center text-center p-3 rounded-2xl transition-all hover:bg-emerald-500/5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">15+</span>
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold mt-1">Bio-Expeditions</span>
            <p className="text-xs text-stone-400 mt-1">Field census & bird counts logged</p>
          </div>
        </div>
      </section>

      {/* ─── GALLERY CAROUSEL ─── */}
      <section className="relative z-10 w-full mb-24">
        <GalleryCarousel />
      </section>

      {/* ─── INITIATIVE PILLARS SECTION ─── */}
      <section className="relative py-12 max-w-7xl mx-auto px-6 mb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <TreePine className="w-3.5 h-3.5" />
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            A Welcoming Space for Practical Ecology
          </h2>
          <p className="text-stone-300 text-base leading-relaxed">
            We merge real boots-on-the-ground volunteer action with structured environmental data logging, verified attendance, and student recognition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-3xl p-8 bg-gradient-to-b from-[#0c241c]/70 to-[#071712]/80 border border-emerald-500/15 backdrop-blur-xl hover:border-emerald-500/35 transition-all duration-300 group hover:-translate-y-1.5 shadow-lg shadow-black/25">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <TreePine className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Urban Forestry & Care</h3>
            <p className="text-stone-300 text-sm leading-relaxed mb-6">
              We select climate-resilient native species (Neem, Peepal, Jamun), execute seasonal afforestation, and track sapling survival rates over 24-month cycles.
            </p>
            <ul className="space-y-2 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Soil microbiome balancing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Geotagged sapling registries
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl p-8 bg-gradient-to-b from-[#0c241c]/70 to-[#071712]/80 border border-emerald-500/15 backdrop-blur-xl hover:border-teal-500/35 transition-all duration-300 group hover:-translate-y-1.5 shadow-lg shadow-black/25">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Biodiversity Censuses</h3>
            <p className="text-stone-300 text-sm leading-relaxed mb-6">
              Guided birdwatching walks, pollinator counts, and tree cataloging expeditions that contribute open-source ecological data to global research portals.
            </p>
            <ul className="space-y-2 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                eBird & India Biodiversity sync
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Acoustic birdcall loggers
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl p-8 bg-gradient-to-b from-[#0c241c]/70 to-[#071712]/80 border border-emerald-500/15 backdrop-blur-xl hover:border-emerald-500/35 transition-all duration-300 group hover:-translate-y-1.5 shadow-lg shadow-black/25">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Eco-Points & Leaderboard</h3>
            <p className="text-stone-300 text-sm leading-relaxed mb-6">
              Every hour dedicated to cleanup drives and conservation earns verified Eco-Points, recognizing outstanding environmental stewardship on campus.
            </p>
            <ul className="space-y-2 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Verified QR-based attendance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Department & student rankings
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── COMMUNITY STORIES SECTION (Warm & Friendly) ─── */}
      <section className="relative py-12 max-w-7xl mx-auto px-6 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
            Community Voice
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Stories from our Campus Stewards
          </h2>
          <p className="text-stone-300 text-sm">
            Hear what makes our weekend expeditions both scientifically rewarding and full of warmth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-[#091e16]/75 border border-emerald-500/15 backdrop-blur-xl relative">
            <Quote className="w-7 h-7 text-emerald-400/30 mb-3" />
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6 italic">
              "Joining the Saturday plantation drive was the highlight of my first semester. We got our hands in the mud, planted 80 native saplings, and made great friends from across departments."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-white/[0.08]">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-xs">
                TS
              </div>
              <div>
                <div className="font-bold text-white text-xs">Tanvi Shetty</div>
                <div className="text-emerald-400/80 text-[11px]">Biotechnology · 2nd Year</div>
              </div>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-[#091e16]/75 border border-emerald-500/15 backdrop-blur-xl relative">
            <Quote className="w-7 h-7 text-teal-400/30 mb-3" />
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6 italic">
              "The birdwatching and bio-census walks showed me species on our campus grounds I walked past every day without noticing. The Eco-Points leaderboard makes contributing feel genuinely fun."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-white/[0.08]">
              <div className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-teal-300 text-xs">
                AP
              </div>
              <div>
                <div className="font-bold text-white text-xs">Aarav Patel</div>
                <div className="text-teal-400/80 text-[11px]">Electronics & Comm. · 3rd Year</div>
              </div>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-[#091e16]/75 border border-emerald-500/15 backdrop-blur-xl relative">
            <Quote className="w-7 h-7 text-amber-400/30 mb-3" />
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6 italic">
              "It's not just another college club—it's a supportive team where senior and junior students work side-by-side. The verified volunteer certificate helped significantly on my profile."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-white/[0.08]">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-xs">
                RD
              </div>
              <div>
                <div className="font-bold text-white text-xs">Rohan Deshmukh</div>
                <div className="text-amber-400/80 text-[11px]">Mechanical Eng. · 4th Year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section id="cta" className="relative py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-b from-[#0e2c21]/90 via-[#0a2018]/90 to-[#071712]/95 border border-emerald-500/25 backdrop-blur-2xl shadow-2xl shadow-black/60">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Join Our Next Weekend Drive
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight">
              Ready to nurture our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">green campus</span>?
            </h2>
            <p className="text-base sm:text-lg text-stone-200 mb-8 max-w-xl mx-auto leading-relaxed">
              Connect with fellow students, participate in upcoming afforestation events, and earn verified volunteer recognition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="group px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-[#04110b] font-bold text-sm transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] flex items-center gap-2 cursor-pointer"
              >
                <span>Create Volunteer Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/events"
                className="px-8 py-3.5 rounded-full border border-emerald-500/30 hover:border-emerald-400 text-stone-100 hover:text-white font-semibold text-sm transition-all duration-300 bg-white/[0.04] hover:bg-white/[0.08]"
              >
                Browse Upcoming Drives
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
