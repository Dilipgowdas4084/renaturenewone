import { Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Image
} from 'lucide-react';

import Navbar from '../components/Navbar';

// ─── Full-Width Draggable Gallery Carousel ───
function GalleryCarousel() {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const rafRef = useRef(null);
  const interactTimeoutRef = useRef(null);
  const dragRef = useRef({ startX: 0, startScrollLeft: 0 });

  const itemCount = 10;

  const updateActiveIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
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
  }, []);

  // Auto-scroll slowly to the right
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isInteracting) return;

    const speed = 0.35; // very slow

    const animate = () => {
      if (!isInteracting && container) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 2) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += speed;
        }
        updateActiveIndex();
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isInteracting, updateActiveIndex]);

  // Scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => updateActiveIndex();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [updateActiveIndex]);

  // Wheel -> horizontal scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 0.6;
        updateActiveIndex();
      }
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [updateActiveIndex]);

  const startInteraction = () => {
    setIsInteracting(true);
    if (interactTimeoutRef.current) clearTimeout(interactTimeoutRef.current);
  };

  const endInteraction = () => {
    interactTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 3000);
  };

  // Mouse drag
  const handleMouseDown = (e) => {
    startInteraction();
    setIsDragging(true);
    dragRef.current.startX = e.clientX;
    dragRef.current.startScrollLeft = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const walk = (e.clientX - dragRef.current.startX) * 1.5;
    containerRef.current.scrollLeft = dragRef.current.startScrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    endInteraction();
  };

  // Touch drag
  const handleTouchStart = (e) => {
    startInteraction();
    dragRef.current.startX = e.touches[0].clientX;
    dragRef.current.startScrollLeft = containerRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    const walk = (e.touches[0].clientX - dragRef.current.startX) * 1.5;
    containerRef.current.scrollLeft = dragRef.current.startScrollLeft - walk;
  };

  const handleTouchEnd = () => {
    endInteraction();
  };

  const items = Array.from({ length: itemCount }, (_, i) => i);

  return (
    <div className="relative w-full mt-4">
      {/* Section label */}
      <div className="text-center mb-8">
        <h3 className="text-sm text-stone-500 uppercase tracking-[0.3em] font-medium">Gallery</h3>
      </div>

      <div 
        ref={containerRef}
        className={`flex w-full h-[55vh] sm:h-[60vh] overflow-x-auto select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
        {items.map((i) => (
          <div 
            key={i}
            className="min-w-[85vw] sm:min-w-[75vw] lg:min-w-[60vw] h-full flex items-center justify-center px-[2.5vw] shrink-0"
            style={{ scrollSnapAlign: 'center' }}
          >
            <div 
              className={`w-full h-full rounded-2xl overflow-hidden border transition-all duration-700 ease-out ${
                activeIndex === i 
                  ? 'border-[#86efac]/20 scale-100 opacity-100' 
                  : 'border-white/[0.04] scale-[0.86] opacity-30'
              }`}
            >
              <div className="w-full h-full bg-white/[0.015] flex flex-col items-center justify-center gap-4 relative">
                <Image className={`w-14 h-14 sm:w-16 sm:h-16 transition-colors duration-700 ${activeIndex === i ? 'text-[#86efac]/30' : 'text-stone-800'}`} />
                <span className={`text-xs sm:text-sm uppercase tracking-[0.2em] font-medium transition-colors duration-700 ${activeIndex === i ? 'text-stone-400' : 'text-stone-700'}`}>
                  Photo {i + 1}
                </span>
                {activeIndex === i && (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(134,239,172,0.03)_0%,_transparent_70%)] pointer-events-none" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {items.map((i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${
              activeIndex === i ? 'w-8 bg-[#86efac]' : 'w-1.5 bg-stone-800'
            }`} 
          />
        ))}
      </div>
    </div>
  );
}

// ─── Particle Field ───
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];
    const count = 40;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.3 + 0.1
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />;
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
    const timer = setTimeout(() => setTypingStarted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = useCallback((e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div 
      className="relative min-h-screen w-full bg-black text-stone-200 overflow-x-hidden selection:bg-[#86efac]/30 selection:text-[#86efac]"
      onMouseMove={handleMouseMove}
    >
      {/* ─── Grid Background ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        <div 
          className="absolute inset-0 transition-all duration-75 ease-out"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(134,239,172,0.15), transparent 70%)`
          }}
        />
        <div 
          className="absolute inset-0 mix-blend-screen"
          style={{
            backgroundImage: `
              linear-gradient(rgba(134,239,172,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(134,239,172,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`
          }}
        />
      </div>

      {/* ─── Typing Animation Styles ─── */}
      <style>{`
        @keyframes typing {
          from { max-width: 0; }
          to { max-width: 500px; }
        }
        @keyframes blink-caret {
          0%, 100% { border-color: #86efac; }
          50% { border-color: transparent; }
        }
        .typing-text {
          overflow: hidden;
          white-space: nowrap;
          display: inline-block;
          max-width: 0;
          border-right: 3px solid #86efac;
          animation: 
            typing 1.4s steps(8, end) forwards,
            blink-caret 0.8s step-end infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(134,239,172,0.04)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(134,239,172,0.02)_0%,_transparent_40%)]" />
        
        <ParticleField />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center w-full flex-1 flex flex-col items-center justify-center">
          
          {/* Typing "Renature" */}
          <div className={`mb-6 ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 delay-200`}>
            <div className="h-20 sm:h-24 lg:h-28 flex items-center justify-center">
              <h1 className={`text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-[#86efac] ${typingStarted ? 'typing-text' : 'opacity-0'}`}>
                Renature
              </h1>
            </div>
          </div>

          {/* Headline */}
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 delay-500`}>
            Grow a <span className="text-[#86efac]">Greener</span> Campus.<br className="hidden sm:block" /> Together.
          </h2>

          {/* Subtitle */}
          <p className={`text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 delay-700`}>
            Join the student-led movement transforming our campus into a thriving, sustainable ecosystem — one event, one tree, one action at a time.
          </p>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 delay-900`}>
            <Link
              to="/register"
              className="group px-8 py-3.5 rounded-xl bg-[#86efac] hover:bg-[#a7f3d0] text-black font-semibold text-base transition-all duration-300 hover:shadow-xl hover:shadow-[#86efac]/20 flex items-center gap-2"
            >
              Join the Club
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button 
              onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 rounded-xl border border-white/[0.08] hover:border-stone-500 text-stone-300 hover:text-white font-semibold text-base transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.05]"
            >
              Learn More
            </button>
          </div>

          {/* Scroll indicator */}
          <div className={`flex flex-col items-center gap-2 text-stone-500 mb-4 ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 delay-1100`}>
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium">Scroll</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>

        {/* ─── GALLERY CAROUSEL ─── */}
        <div className="relative z-10 w-full">
          <GalleryCarousel />
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section id="cta" className="relative py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(134,239,172,0.05)_0%,_transparent_60%)]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to make an <span className="text-[#86efac]">impact</span>?
            </h2>
            <p className="text-lg text-stone-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Join hundreds of students already transforming our campus. Your first action is just one click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="group px-8 py-3.5 rounded-xl bg-[#86efac] hover:bg-[#a7f3d0] text-black font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-[#86efac]/20 flex items-center gap-2"
              >
                Get Started Today
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 rounded-xl border border-white/[0.08] hover:border-stone-500 text-stone-300 hover:text-white font-semibold transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.05]"
              >
                Member Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative py-12 border-t border-white/[0.06] bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col items-start gap-4">
              <img src="/logo.png" alt="Renature" className="h-12 w-auto object-contain" />
              <p className="text-stone-400 text-sm leading-relaxed">
                Transforming our campus into a thriving, sustainable ecosystem — one event at a time.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-sm text-stone-500 hover:text-[#86efac] transition-colors">Home</Link>
                <Link to="/about" className="text-sm text-stone-500 hover:text-[#86efac] transition-colors">About</Link>
                <Link to="/events" className="text-sm text-stone-500 hover:text-[#86efac] transition-colors">Events</Link>
                <Link to="/leaderboard" className="text-sm text-stone-500 hover:text-[#86efac] transition-colors">Leaderboard</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <div className="flex flex-col gap-2">
                <Link to="/nature" className="text-sm text-stone-500 hover:text-[#86efac] transition-colors">Nature</Link>
                <Link to="/contact" className="text-sm text-stone-500 hover:text-[#86efac] transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex flex-col gap-2">
                <Link to="/login" className="text-sm text-stone-500 hover:text-[#86efac] transition-colors">Login</Link>
                <Link to="/register" className="text-sm text-stone-500 hover:text-[#86efac] transition-colors">Register</Link>
                <div className="flex items-center gap-4 mt-2">
                  <a href="#" className="text-stone-500 hover:text-[#86efac] transition-colors text-sm">Instagram</a>
                  <a href="#" className="text-stone-500 hover:text-[#86efac] transition-colors text-sm">LinkedIn</a>
                  <a href="#" className="text-stone-500 hover:text-[#86efac] transition-colors text-sm">Twitter</a>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
            <p className="text-sm text-stone-500">
              © 2026 Renature Campus Club. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-stone-500 hover:text-[#86efac] transition-colors">Privacy</a>
              <a href="#" className="text-sm text-stone-500 hover:text-[#86efac] transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}