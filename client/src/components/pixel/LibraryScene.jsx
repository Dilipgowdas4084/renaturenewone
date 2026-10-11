import { texture } from '../../utils/pixelTextures';
import { useDayNight } from '../../context/DayNightContext';
import { Cloud, Tree, Lantern, Flower, Steve } from './ContactVillage';

const SKIES = {
  day: 'linear-gradient(#5db7e8 0 35%, #86cdf0 35% 65%, #b6e2f5 65%)',
  night: 'linear-gradient(#141b44 0 35%, #1d2550 35% 65%, #262f60 65%)',
};

function Bird({ y, dur, delay }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <g className="px-fly" style={{ '--dur': `${dur}s`, '--delay': `${delay}s` }}>
        <g className="px-flap-a"><rect x={0} y={2} width={2} height={1} fill="#3a2a1a" /><rect x={2} y={1} width={2} height={1} fill="#3a2a1a" /><rect x={4} y={2} width={2} height={1} fill="#3a2a1a" /></g>
        <g className="px-flap-b"><rect x={0} y={0} width={2} height={1} fill="#3a2a1a" /><rect x={2} y={1} width={2} height={1} fill="#3a2a1a" /><rect x={4} y={0} width={2} height={1} fill="#3a2a1a" /></g>
      </g>
    </g>
  );
}

function Exterior({ night }) {
  const grass = night ? ['#2f5e2d', '#25501f'] : ['#5fa843', '#4c8f36'];
  return (
    <svg
      viewBox="0 0 480 150"
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      className="block w-full h-64 sm:h-80 lg:h-[24rem]"
      role="img"
      aria-label="A cozy blocky library built in a forest, with an explorer walking up the path"
    >
      {night ? (
        <rect x={60} y={14} width={20} height={20} fill="#f1ead2" />
      ) : (
        <>
          <rect x={60} y={12} width={26} height={26} fill="#f6d365" />
          <rect x={64} y={16} width={18} height={18} fill="#ffe79a" />
        </>
      )}
      <Cloud y={22} s={1.2} dur={100} delay={-30} night={night} />
      <Cloud y={50} s={0.9} dur={130} delay={-90} night={night} />
      <Bird y={38} dur={26} delay={-4} />
      <Bird y={58} dur={34} delay={-18} />

      <path d="M0 104 V84 H28 V70 H56 V58 H84 V70 H110 V84 H140 V104 Z" fill={night ? '#3b4a63' : '#8fb0c8'} />
      <path d="M340 104 V80 H370 V62 H400 V48 H430 V64 H456 V80 H480 V104 Z" fill={night ? '#34435a' : '#7ea2bd'} />
      <path d="M0 104 V94 H50 V88 H120 V96 H360 V90 H480 V104 Z" fill={night ? '#2b4a36' : '#6fa35a'} />

      <Tree x={20} y={104} s={1.15} />
      <Tree x={78} y={104} s={0.9} delay={-1} />
      <Tree x={372} y={104} s={1.2} delay={-2} />
      <Tree x={424} y={104} s={0.95} delay={-3} />
      <Tree x={464} y={104} s={1.15} delay={-1.5} />

      <rect x={0} y={104} width={480} height={46} fill={grass[0]} />
      <rect x={0} y={104} width={480} height={3} fill="#86c95e" />
      <rect x={0} y={122} width={480} height={4} fill={grass[1]} />
      <rect x={0} y={140} width={480} height={10} fill="#7a5230" />
      <rect x={0} y={140} width={480} height={2} fill="#5fa843" />

      {/* path */}
      <rect x={228} y={108} width={24} height={34} fill="#9b7448" />
      <rect x={216} y={126} width={48} height={16} fill="#9b7448" />
      {[[230, 112], [242, 116], [232, 122], [244, 128], [222, 132], [238, 136], [252, 134]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={8} height={5} fill="#8b8b8b" />
      ))}

      {/* library */}
      <rect x={146} y={104} width={188} height={6} fill="#7d7d7d" />
      {[150, 168, 186, 204, 262, 280, 298, 316].map(x => <rect key={x} x={x} y={105} width={10} height={3} fill="#9a9a9a" />)}
      <rect x={150} y={64} width={180} height={40} fill="#b8894f" />
      {[72, 82, 92].map(y => <rect key={y} x={150} y={y} width={180} height={1} fill="#8f6a3a" />)}
      {[148, 214, 264, 326].map(x => (
        <g key={x}>
          <rect x={x} y={58} width={6} height={48} fill="#5b3a1e" />
          <rect x={x} y={58} width={2} height={48} fill="#43290f" />
        </g>
      ))}
      {/* roof */}
      <rect x={138} y={54} width={204} height={9} fill="#8a3f2b" />
      <rect x={146} y={45} width={188} height={9} fill="#9c4a33" />
      <rect x={158} y={37} width={164} height={8} fill="#8a3f2b" />
      <rect x={176} y={30} width={128} height={7} fill="#9c4a33" />
      <rect x={138} y={62} width={204} height={2} fill="#5e2a1c" />
      {/* nameplate */}
      <rect x={196} y={39} width={88} height={13} fill="#3a2a1a" />
      <rect x={197} y={40} width={86} height={11} fill="#c9985a" />
      <text x={240} y={48.6} textAnchor="middle" fontSize="6" fill="#3a2a1a" className="font-pixel">NATURE LIBRARY</text>
      {/* windows */}
      {[162, 188, 274, 300].map(x => (
        <g key={x}>
          <rect x={x} y={72} width={16} height={18} fill="#3a2a1a" />
          <rect x={x + 2} y={74} width={12} height={14} fill={night ? '#f4c95d' : '#bfe4f5'} />
          <rect x={x + 7} y={74} width={2} height={14} fill="#3a2a1a" />
          <rect x={x + 2} y={80} width={12} height={2} fill="#3a2a1a" />
        </g>
      ))}
      {/* double door */}
      <rect x={224} y={76} width={32} height={28} fill="#2a1a0d" />
      <rect x={226} y={78} width={13} height={26} fill="#6e4a26" />
      <rect x={241} y={78} width={13} height={26} fill="#6e4a26" />
      <rect x={228} y={80} width={9} height={9} fill="#82592e" />
      <rect x={243} y={80} width={9} height={9} fill="#82592e" />
      <rect x={236} y={92} width={2} height={2} fill="#e8d28a" />
      <rect x={242} y={92} width={2} height={2} fill="#e8d28a" />
      <Lantern x={216} y={80} />
      <Lantern x={262} y={80} delay={-0.6} />

      {/* fences */}
      {[100, 336].map(x0 => (
        <g key={x0}>
          {[0, 8, 16, 24, 32].map(dx => <rect key={dx} x={x0 + dx} y={106} width={3} height={12} fill="#7a5230" />)}
          <rect x={x0} y={109} width={35} height={2} fill="#96683a" />
          <rect x={x0} y={114} width={35} height={2} fill="#96683a" />
        </g>
      ))}
      <Lantern x={99} y={101} delay={-0.3} />
      <Lantern x={370} y={101} delay={-0.8} />

      {/* pond */}
      <rect x={20} y={124} width={54} height={14} fill="#6d4a2b" />
      <rect x={22} y={125} width={50} height={11} fill="#3b8fd0" />
      <rect x={22} y={125} width={50} height={3} fill="#5fb0e8" />
      {[[28, 130], [46, 133], [58, 128]].map(([x, y], i) => (
        <rect key={x} className="px-shimmer" x={x} y={y} width={6} height={1} fill="#d9f0ff" style={{ '--delay': `${i * 0.6}s` }} />
      ))}

      {[[86, 122, '#ff8fb1'], [96, 130, '#ffd54a'], [200, 132, '#ffffff'], [286, 130, '#ff6b6b'], [390, 126, '#c78bff'], [412, 134, '#ffd54a'], [448, 130, '#ff8fb1'], [10, 118, '#ffffff']].map(([x, y, c]) => (
        <Flower key={`${x}${y}`} x={x} y={y} c={c} />
      ))}
      {[[186, 136], [330, 134]].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <rect x={1} y={2} width={2} height={3} fill="#f1e8d6" />
          <rect x={0} y={0} width={4} height={2} fill="#d94b3d" />
          <rect x={1} y={0} width={1} height={1} fill="#fff" />
        </g>
      ))}
      {[[110, 132], [300, 138]].map(([x, y]) => (
        <g key={x}>
          <rect x={x} y={y} width={7} height={4} fill="#8a8a8a" />
          <rect x={x} y={y} width={7} height={1} fill="#b0b0b0" />
        </g>
      ))}

      {[[380, 60], [434, 70], [24, 64], [96, 72], [456, 58]].map(([x, y], i) => (
        <rect key={x} className="px-leaf" x={x} y={y} width={3} height={3} fill="#67b85a" style={{ '--dur': `${8 + i}s`, '--delay': `${-i * 2}s`, '--drift': `${6 + i * 2}px` }} />
      ))}
      {night && [[120, 100], [180, 112], [300, 108], [356, 116], [60, 110]].map(([x, y], i) => (
        <rect key={x} className="px-firefly" x={x} y={y} width={2} height={2} fill="#eaff8a" style={{ '--dur': `${5 + i}s`, '--delay': `${-i}s` }} />
      ))}

      <g className="px-walk" style={{ '--dur': '38s', '--delay': '-12s' }}>
        <Steve x={0} y={127} />
      </g>

      {night && <rect x={0} y={0} width={480} height={150} fill="#0a1030" opacity={0.28} pointerEvents="none" />}
    </svg>
  );
}

// Page header: sky, wooden title sign and the library exterior.
export function LibraryHeader({
  eyebrow = 'NATURE LIBRARY',
  title = 'NATURE & RESOURCES',
  subtitle = 'Explore curated websites, organizations, and resources related to nature, wildlife, conservation, and sustainability.',
}) {
  const { night } = useDayNight();
  return (
    <header className="relative overflow-hidden transition-[background] duration-700" style={{ background: night ? SKIES.night : SKIES.day }}>
      <div className="relative z-10 max-w-4xl mx-auto px-5 pt-10 sm:pt-14 text-center">
        <div className="inline-block px-sign-swing">
          <div className="flex justify-between px-10" aria-hidden="true">
            <span className="w-1 h-6 bg-[#3a2a1a]" />
            <span className="w-1 h-6 bg-[#3a2a1a]" />
          </div>
          <div className="px-panel px-5 sm:px-12 py-4 sm:py-5" style={texture('planks', 56)}>
            <p className="font-pixel text-sun text-xs sm:text-sm tracking-[0.35em] mb-1">{eyebrow}</p>
            <h1 className="px-title text-cream text-3xl sm:text-5xl lg:text-6xl tracking-wide leading-tight">{title}</h1>
          </div>
        </div>
        <p
          className={`mt-6 max-w-2xl mx-auto text-base sm:text-lg font-semibold leading-relaxed ${night ? 'text-cream' : 'text-deep'}`}
          style={{ textShadow: night ? '0 2px 0 rgba(0,0,0,0.45)' : '0 1px 0 rgba(255,255,255,0.5)' }}
        >
          {subtitle}
        </p>
      </div>
      <Exterior night={night} />
    </header>
  );
}

// Decorative cozy reading corner at the end of the library.
export function ReadingNook() {
  const { night } = useDayNight();
  return (
    <svg viewBox="0 0 200 70" shapeRendering="crispEdges" className="block w-full max-w-2xl mx-auto h-auto" aria-hidden="true" focusable="false">
      <rect width={200} height={70} fill="#6b4a2a" />
      {[0, 14, 28, 42, 56].map(y => <rect key={y} x={0} y={y} width={200} height={1} fill="#563a1f" />)}
      {/* window onto the forest */}
      <rect x={12} y={8} width={44} height={34} fill="#3a2a1a" />
      <rect x={15} y={11} width={38} height={28} fill={night ? '#1d2550' : '#8fd0f0'} />
      <rect x={15} y={30} width={38} height={9} fill="#5fa843" />
      <rect x={40} y={20} width={10} height={10} fill="#3e8a35" />
      <rect x={43} y={30} width={4} height={9} fill="#6b4226" />
      <rect x={33} y={11} width={2} height={28} fill="#3a2a1a" />
      <rect x={15} y={24} width={38} height={2} fill="#3a2a1a" />
      {/* nature map */}
      <rect x={140} y={10} width={34} height={24} fill="#3a2a1a" />
      <rect x={142} y={12} width={30} height={20} fill="#e9d9a8" />
      <rect x={146} y={16} width={10} height={6} fill="#86c95e" />
      <rect x={158} y={20} width={10} height={8} fill="#5fb0e8" />
      <rect x={150} y={26} width={2} height={2} fill="#c0392b" />
      {/* table */}
      <rect x={68} y={44} width={56} height={5} fill="#c9985a" />
      <rect x={68} y={44} width={56} height={1} fill="#dcb072" />
      <rect x={72} y={49} width={4} height={18} fill="#8a5d31" />
      <rect x={116} y={49} width={4} height={18} fill="#8a5d31" />
      {/* open book */}
      <rect x={78} y={39} width={14} height={5} fill="#f3e6bf" />
      <rect x={93} y={39} width={14} height={5} fill="#efe0b0" />
      <rect x={92} y={38} width={1} height={6} fill="#5b3a1e" />
      {/* lantern on table */}
      <rect x={110} y={36} width={6} height={8} fill="#3a3a3a" />
      <rect className="cv-flicker" x={111} y={38} width={4} height={5} fill="#ffd54a" />
      {/* chair */}
      <rect x={46} y={46} width={4} height={20} fill="#8a5d31" />
      <rect x={46} y={56} width={16} height={4} fill="#8a5d31" />
      {/* plant + chest */}
      <rect x={130} y={58} width={8} height={9} fill="#8a5d31" />
      <rect x={128} y={50} width={12} height={8} fill="#3e8a35" />
      <rect x={160} y={52} width={24} height={15} fill="#8a5d31" />
      <rect x={160} y={52} width={24} height={4} fill="#a5733c" />
      <rect x={170} y={55} width={4} height={5} fill="#ffd54a" />
      <rect x={0} y={67} width={200} height={3} fill="#3a2a1a" />
      <Steve x={30} y={54} walking={false} />
    </svg>
  );
}
