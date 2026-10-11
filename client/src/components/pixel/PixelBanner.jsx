import { texture } from '../../utils/pixelTextures';
import { useDayNight } from '../../context/DayNightContext';

const SKIES = {
  day: 'linear-gradient(#7ec8e3 0 30%, #a2d8ec 30% 60%, #c8e8ef 60%)',
  night: 'linear-gradient(#1d2550 0 30%, #232d5c 30% 60%, #2a3567 60%)',
};

const STARS = [[24, 20], [60, 48], [96, 14], [132, 38], [170, 22], [210, 54], [250, 16], [292, 42], [330, 24], [372, 58], [420, 18], [452, 46], [70, 82], [190, 90], [310, 84], [440, 96]];

function Cloud({ y, s, dur, delay, night }) {
  const fill = night ? '#8791b5' : '#ffffff';
  const shade = night ? '#6d769a' : '#dce9ef';
  return (
    <g transform={`translate(0 ${y})`} opacity={night ? 0.5 : 0.95}>
      <g className="px-drift" style={{ '--dur': `${dur}s`, '--delay': `${delay}s` }}>
        <g transform={`scale(${s})`}>
          <rect x={0} y={0} width={28} height={6} fill={fill} />
          <rect x={6} y={-5} width={14} height={5} fill={fill} />
          <rect x={18} y={-3} width={8} height={3} fill={fill} />
          <rect x={-4} y={4} width={36} height={6} fill={fill} />
          <rect x={-4} y={9} width={36} height={2} fill={shade} />
        </g>
      </g>
    </g>
  );
}

function HillsWithTrees({ night }) {
  const colors = night
    ? { far: '#3b5446', near: '#2c4633', tree: '#223a2a', trunk: '#3a2a1a', leaf: '#1f4a2a' }
    : { far: '#a3c48c', near: '#6fa35a', tree: '#4f8a45', trunk: '#6b4226', leaf: '#3e8a35' };
  const far = [30, 26, 22, 22, 18, 22, 26, 30, 28, 24, 20, 16, 14, 18, 22, 26, 28, 24, 20, 18, 22, 26, 30, 32, 28, 24, 20, 22, 26, 30];
  const near = Array.from({ length: 60 }, (_, i) => 40 + Math.round((Math.sin(i * 0.35) * 5 + Math.sin(i * 0.12 + 1) * 4) / 2) * 2);
  const path = (hs, step, base) => `M0 ${base}` + hs.map((y, i) => ` V${y} H${(i + 1) * step}`).join('') + ` V${base} Z`;
  return (
    <svg viewBox="0 0 480 60" preserveAspectRatio="xMidYMax slice" className="block w-full h-16 sm:h-24" shapeRendering="crispEdges" aria-hidden="true">
      <path d={path(far, 16, 60)} fill={colors.far} />
      <path d={path(near, 8, 60)} fill={colors.near} />
      {[3, 9, 16, 24, 31, 39, 46, 53].map(i => (
        <rect key={i} x={i * 8} y={near[i] - 6} width={6} height={6} fill={colors.tree} />
      ))}
      {[[14, 0], [96, 1], [188, 0], [268, 1], [352, 0], [440, 1]].map(([x, pine], i) => {
        const base = near[Math.floor(x / 8)] + 1;
        return pine ? (
          <g key={i} transform={`translate(${x} ${base})`}>
            <rect x={-1} y={-6} width={2} height={6} fill={colors.trunk} />
            <rect x={-5} y={-12} width={10} height={6} fill={colors.leaf} />
            <rect x={-3} y={-18} width={6} height={6} fill={colors.leaf} />
            <rect x={-1} y={-22} width={2} height={4} fill={colors.leaf} />
          </g>
        ) : (
          <g key={i} transform={`translate(${x} ${base})`}>
            <rect x={-1} y={-9} width={2} height={9} fill={colors.trunk} />
            <rect x={-6} y={-17} width={12} height={9} fill={colors.leaf} />
            <rect x={-4} y={-21} width={8} height={4} fill={colors.leaf} />
          </g>
        );
      })}
      <rect x={0} y={56} width={480} height={4} fill="#5fa843" />
      <rect x={0} y={56} width={480} height={1} fill="#86c95e" />
    </svg>
  );
}

// Page header used by the inner pages: pixel sky + hills, with the title on a wooden sign.
export default function PixelBanner({ eyebrow, title, subtitle }) {
  const { night } = useDayNight();

  return (
    <header className="relative overflow-hidden transition-[background] duration-700" style={{ background: night ? SKIES.night : SKIES.day }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 480 130"
        preserveAspectRatio="xMidYMin slice"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        {night ? (
          <>
            {STARS.map(([x, y], i) => (
              <rect key={i} className="px-twinkle" x={x} y={y} width={i % 4 === 0 ? 2 : 1} height={i % 4 === 0 ? 2 : 1} fill="#fdf6d8" style={{ '--dur': `${2 + (i % 4)}s`, '--delay': `${-i * 0.5}s` }} />
            ))}
            <rect x={398} y={20} width={22} height={22} fill="#f1ead2" />
            <rect x={404} y={26} width={4} height={4} fill="#d9d0b4" />
            <rect x={412} y={34} width={3} height={3} fill="#d9d0b4" />
          </>
        ) : (
          <>
            <rect x={396} y={18} width={26} height={26} fill="#f6d365" />
            <rect x={400} y={22} width={18} height={18} fill="#ffe79a" />
          </>
        )}
        <Cloud y={26} s={1.2} dur={95} delay={-12} night={night} />
        <Cloud y={70} s={0.9} dur={125} delay={-72} night={night} />
        <Cloud y={12} s={0.8} dur={150} delay={-40} night={night} />
      </svg>

      <div className="relative z-10 max-w-4xl mx-auto px-5 pt-12 sm:pt-16 pb-8 sm:pb-10 text-center">
        <div className="inline-block px-sign-swing">
          <div className="flex justify-between px-10" aria-hidden="true">
            <span className="w-1 h-6 bg-[#3a2a1a]" />
            <span className="w-1 h-6 bg-[#3a2a1a]" />
          </div>
          <div className="px-panel px-6 sm:px-12 py-4 sm:py-5" style={texture('planks', 56)}>
            {eyebrow && <p className="font-pixel text-sun text-xs sm:text-sm tracking-[0.35em] mb-1">{eyebrow}</p>}
            <h1 className="px-title text-cream text-3xl sm:text-5xl lg:text-6xl tracking-wide leading-tight">{title}</h1>
          </div>
        </div>
        {subtitle && (
          <p
            className={`mt-6 max-w-2xl mx-auto text-base sm:text-lg font-semibold leading-relaxed ${night ? 'text-cream' : 'text-deep'}`}
            style={{ textShadow: night ? '0 2px 0 rgba(0,0,0,0.45)' : '0 1px 0 rgba(255,255,255,0.5)' }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <HillsWithTrees night={night} />
    </header>
  );
}
