import { Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import PixelForestScene from '../components/pixel/PixelForestScene';
import { texture } from '../utils/pixelTextures';
import { useDayNight } from '../context/DayNightContext';
import { isLoggedIn } from '../utils/auth';

const SKY_TOP = { day: '#7ec8e3', night: '#161b40' };

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
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section header: wooden sign + controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <SectionSign title="GALLERY" align="left" />
        <div className="flex items-center gap-4 self-center sm:self-auto">
          <button
            onClick={handlePrev}
            aria-label="Previous photo"
            className="px-btn px-btn--stone px-btn--sm !px-2.5"
            title="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next photo"
            className="px-btn px-btn--wood px-btn--sm"
            title="Next photo"
          >
            Next photo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`flex w-full h-[50vh] sm:h-[58vh] overflow-x-auto select-none scroll-smooth ${
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
            className="min-w-[82vw] sm:min-w-[70vw] lg:min-w-[56vw] h-full flex items-center justify-center px-[2.5vw] py-4 shrink-0"
            style={{ scrollSnapAlign: 'center' }}
          >
            {/* Wooden frame */}
            <div
              onClick={() => {
                if (!dragRef.current.hasMoved) {
                  scrollToIndex(i, true);
                  pauseAutoSlide();
                }
              }}
              className={`w-full h-full p-3 sm:p-4 px-panel transition-all duration-500 ease-out cursor-pointer ${
                activeIndex === i ? 'scale-100 opacity-100' : 'scale-[0.86] opacity-40'
              }`}
              style={texture('planks', 48)}
            >
              <div className="relative w-full h-full overflow-hidden px-panel--thin bg-bark">
                <img
                  src={item.image}
                  alt={item.title}
                  draggable="false"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80';
                  }}
                />

                <span className="absolute top-3 left-3 font-pixel text-[11px] tracking-[0.1em] uppercase px-2 py-1 bg-sun text-bark px-panel--thin">
                  {item.tag}
                </span>

                {/* Caption plaque */}
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-[80%] px-panel--thin px-4 py-2.5" style={texture('parchment', 48)}>
                  <h4 className="font-pixel text-base sm:text-lg uppercase text-bark leading-snug">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-bark/75 flex items-center gap-1.5">
                    <span aria-hidden="true">📍</span>
                    {item.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <span className="font-num text-[10px] text-cream/80">
          {String(activeIndex + 1).padStart(2, '0')}/{String(GALLERY_ITEMS.length).padStart(2, '0')}
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
              className={`h-2 transition-all duration-300 cursor-pointer ${
                activeIndex === i ? 'w-6 bg-sun' : 'w-2 bg-[#2b1d12]/70 hover:bg-sun/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// A wooden signboard used as a section heading.
function SectionSign({ eyebrow, title, sub, align = 'center' }) {
  return (
    <div className={align === 'left' ? 'text-center sm:text-left' : 'text-center mb-12'}>
      <div className="inline-block px-panel px-panel--thin px-6 sm:px-10 py-3" style={texture('planks', 48)}>
        {eyebrow && <p className="font-pixel text-sun text-xs tracking-[0.3em] mb-1">{eyebrow}</p>}
        <h2 className="px-title text-cream text-2xl sm:text-4xl tracking-wide">{title}</h2>
      </div>
      {sub && <p className="mt-5 text-cream/80 max-w-2xl mx-auto">{sub}</p>}
    </div>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { night } = useDayNight();
  // Same login check the navbar uses; logged-in members don't need the sign-up prompt.
  const isAuthed = isLoggedIn();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const reveal = (delay) => `transition-all duration-700 ${delay} ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-body text-cream bg-night selection:bg-sun/40 selection:text-bark pb-16 lg:pb-0">
      <Navbar />

      {/* ─── HERO: pixel forest ─── */}
      <section
        className="relative min-h-[calc(100svh-5rem)] lg:min-h-[100svh] overflow-hidden transition-colors duration-700"
        style={{ backgroundColor: night ? SKY_TOP.night : SKY_TOP.day }}
      >
        {/* Wide screens: the scene covers the whole hero (clouds up top, ground + walker at the bottom).
            Tall screens: it fills the lower part at a sensible size; the sky colour above matches its top band. */}
        <div className="absolute inset-0 portrait:inset-auto portrait:bottom-0 portrait:left-1/2 portrait:-translate-x-1/2 portrait:h-[75%] portrait:aspect-[480/232] portrait:min-w-full">
          <PixelForestScene night={night} dirtDepth={10} className="w-full h-full block" />
        </div>

        {/* RENATURE sits at the vertical middle of the visible hero (above the mobile bottom bar); the sign hangs below it */}
        <div className="relative z-10 max-w-4xl mx-auto px-5 min-h-[calc(100svh-5rem)] lg:min-h-[100svh] flex flex-col items-center justify-center text-center">
          <div className="relative">
            <h1 className={`px-title text-cream text-5xl sm:text-8xl lg:text-9xl tracking-wide leading-none ${reveal('delay-100')}`}>
              RENATURE
            </h1>

            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 sm:mt-6 whitespace-nowrap px-panel px-panel--thin px-4 py-2 ${reveal('delay-300')}`} style={texture('planks', 48)}>
              <p className="font-pixel text-cream text-sm sm:text-xl tracking-[0.12em] px-shadow-sm">
                Explore. Create. Protect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GALLERY: underground dirt layer ─── */}
      <section className="relative py-16 sm:py-20" style={texture('dirt', 64)}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/35 pointer-events-none" />

        <div className="relative z-10">
          <GalleryCarousel />
        </div>
      </section>

      {/* ─── CTA: wooden sign on stone (only for visitors who aren't logged in) ─── */}
      {!isAuthed && (
        <section id="cta" className="relative py-20 sm:py-28" style={texture('stone', 64)}>
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <div className="px-panel p-8 sm:p-12 text-center" style={texture('darkPlanks', 64)}>
              <p className="font-pixel text-sun text-xs sm:text-sm tracking-[0.3em] mb-4 uppercase">Join Our Next Weekend Drive</p>
              <h2 className="px-title text-cream text-3xl sm:text-5xl mb-6 leading-tight">
                Ready to nurture our <span className="text-sun">green campus</span>?
              </h2>
              <p className="text-lg text-cream/85 mb-10 max-w-xl mx-auto leading-relaxed">
                Connect with fellow students, participate in upcoming afforestation events, and earn verified volunteer recognition.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <Link to="/register" className="px-btn px-btn--grass">
                  <span aria-hidden="true">▶</span> Create Volunteer Account
                </Link>
                <Link to="/events" className="px-btn px-btn--stone">
                  Browse Upcoming Drives
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
