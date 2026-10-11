import { memo } from 'react';

// Whole scene lives on a 480×270 "pixel" grid; 1 unit = 1 block pixel.
const W = 480;
const H = 270;
const GROUND = 222;

function seeded(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function stepPath(heights, step, base = H) {
  let d = `M0 ${base}`;
  heights.forEach((h, i) => { d += ` V${h} H${(i + 1) * step}`; });
  return `${d} V${base} Z`;
}

const FAR_HILLS = [178, 174, 170, 166, 166, 162, 166, 170, 174, 178, 176, 172, 168, 164, 160, 158, 160, 164, 168, 172, 174, 170, 166, 162, 160, 164, 168, 172, 176, 180];
const NEAR_HILLS = Array.from({ length: 60 }, (_, i) => 200 + Math.round((Math.sin(i * 0.32) * 7 + Math.sin(i * 0.11 + 2) * 6) / 3) * 3);
const TREE_LINE = [2, 5, 9, 13, 17, 23, 27, 33, 38, 44, 49, 53, 57];

const DIRT = (() => {
  const rand = seeded(99);
  const colors = ['#6b4628', '#8b6038', '#5e3d22', '#94693f'];
  const specks = Array.from({ length: 170 }, () => [Math.floor(rand() * W), 229 + Math.floor(rand() * 41), rand() < 0.3 ? 2 : 1, colors[Math.floor(rand() * colors.length)]]);
  const stones = Array.from({ length: 9 }, () => [Math.floor(rand() * (W - 6)), 238 + Math.floor(rand() * 28)]);
  const drips = [];
  for (let x = 2; x < W; x += 5 + Math.floor(rand() * 7)) drips.push([x, 2 + Math.floor(rand() * 2), 2 + Math.floor(rand() * 2)]);
  return { specks, stones, drips };
})();

const STARS = (() => {
  const rand = seeded(5);
  return Array.from({ length: 38 }, () => ({
    x: 6 + Math.floor(rand() * 468),
    y: 4 + Math.floor(rand() * 104),
    s: rand() < 0.2 ? 2 : 1,
    dur: 2 + rand() * 3,
    delay: -rand() * 4,
  })).filter(s => !(s.x > 388 && s.x < 430 && s.y < 58));
})();

const FLOWERS = [104, 136, 150, 190, 206, 228, 248, 280, 418, 434];
const FLOWER_COLORS = ['#e05a5a', '#f2c94c', '#9b7fd4', '#f4f0e6', '#f08fb0'];
const TUFTS = Array.from({ length: 34 }, (_, i) => 6 + i * 14 + (i % 3) * 3).filter(x => x < 294 || x > 398);
const LEAVES = [
  { x: 12, y: 176, c: '#d9a441', dur: 9, delay: 0, drift: 10 },
  { x: 30, y: 172, c: '#6fae4a', dur: 11, delay: -4, drift: -8 },
  { x: 42, y: 178, c: '#c96a2b', dur: 10, delay: -7, drift: 12 },
  { x: 72, y: 186, c: '#d9a441', dur: 12, delay: -2, drift: 6 },
  { x: 432, y: 174, c: '#c96a2b', dur: 10, delay: -5, drift: -10 },
  { x: 450, y: 170, c: '#6fae4a', dur: 9, delay: -1, drift: 8 },
  { x: 462, y: 178, c: '#d9a441', dur: 12, delay: -8, drift: -6 },
  { x: 404, y: 190, c: '#c96a2b', dur: 11, delay: -3, drift: 9 },
];
const FIREFLIES = [
  [40, 196], [64, 208], [96, 184], [122, 212], [150, 198], [176, 186], [214, 210], [244, 192],
  [276, 204], [312, 190], [338, 208], [362, 182], [392, 200], [424, 190], [452, 210], [470, 186],
].map(([x, y], i) => ({ x, y, dur: 4 + (i % 5), delay: -(i * 0.7) }));

function Oak({ x, h, s = 1 }) {
  const top = -h - 22;
  return (
    <g transform={`translate(${x} ${GROUND}) scale(${s})`}>
      <rect x={-3} y={-h} width={6} height={h} fill="#6b4226" />
      <rect x={-2} y={-h} width={1} height={h} fill="#86552f" />
      <rect x={1} y={-h + 4} width={1} height={h - 8} fill="#573419" />
      <rect x={-16} y={top} width={32} height={10} fill="#3e8a35" />
      <rect x={-20} y={top + 8} width={40} height={14} fill="#3e8a35" />
      <rect x={-14} y={top + 20} width={28} height={6} fill="#3e8a35" />
      <rect x={-20} y={top + 18} width={40} height={4} fill="#2b6526" />
      <rect x={-14} y={top + 24} width={28} height={2} fill="#2b6526" />
      <rect x={-12} y={top + 2} width={6} height={4} fill="#58a84a" />
      <rect x={2} y={top + 4} width={4} height={4} fill="#58a84a" />
      <rect x={-16} y={top + 10} width={4} height={4} fill="#58a84a" />
      <rect x={10} y={top + 12} width={4} height={4} fill="#58a84a" />
      <rect x={-4} y={top + 12} width={4} height={4} fill="#58a84a" />
      <rect x={6} y={top + 2} width={4} height={4} fill="#2b6526" />
      <rect x={-8} y={top + 14} width={4} height={4} fill="#2b6526" />
    </g>
  );
}

function Pine({ x, s = 1 }) {
  const layers = [[-14, -20, 28, 12], [-11, -30, 22, 11], [-8, -39, 16, 10], [-5, -47, 10, 9], [-2, -52, 4, 6]];
  return (
    <g transform={`translate(${x} ${GROUND}) scale(${s})`}>
      <rect x={-2} y={-9} width={4} height={9} fill="#5a3a20" />
      {layers.map(([lx, ly, lw, lh], i) => (
        <g key={i}>
          <rect x={lx} y={ly} width={lw} height={lh} fill="#2f6b3a" />
          <rect x={lx} y={ly + lh - 2} width={lw} height={2} fill="#22502b" />
          <rect x={lx + 2} y={ly + 1} width={3} height={3} fill="#3f8a4c" />
        </g>
      ))}
    </g>
  );
}

function Rock({ x, s = 1 }) {
  return (
    <g transform={`translate(${x} ${GROUND}) scale(${s})`}>
      <rect x={-8} y={-6} width={16} height={6} fill="#8a8a80" />
      <rect x={-5} y={-9} width={10} height={4} fill="#8a8a80" />
      <rect x={-5} y={-9} width={6} height={2} fill="#a5a59b" />
      <rect x={-8} y={-6} width={4} height={2} fill="#a5a59b" />
      <rect x={-8} y={-2} width={16} height={2} fill="#6b6b62" />
      <rect x={3} y={-7} width={3} height={3} fill="#74746b" />
    </g>
  );
}

function Flower({ x, color, i }) {
  return (
    <g className="px-sway" style={{ '--dur': `${2.6 + (i % 4) * 0.5}s`, '--delay': `${-i * 0.4}s` }}>
      <rect x={x} y={GROUND - 6} width={1} height={6} fill="#3c7d2f" />
      <rect x={x + 1} y={GROUND - 3} width={2} height={1} fill="#4f9636" />
      <rect x={x - 1} y={GROUND - 11} width={3} height={5} fill={color} />
      <rect x={x - 2} y={GROUND - 10} width={5} height={3} fill={color} />
      <rect x={x} y={GROUND - 9} width={1} height={1} fill="#f6e27a" />
    </g>
  );
}

function Mushroom({ x }) {
  return (
    <g>
      <rect x={x - 1} y={GROUND - 5} width={3} height={5} fill="#efe3c8" />
      <rect x={x - 3} y={GROUND - 8} width={7} height={3} fill="#d64b3c" />
      <rect x={x - 2} y={GROUND - 9} width={5} height={1} fill="#d64b3c" />
      <rect x={x - 2} y={GROUND - 7} width={1} height={1} fill="#fff" />
      <rect x={x + 1} y={GROUND - 8} width={1} height={1} fill="#fff" />
      <rect x={x + 2} y={GROUND - 6} width={1} height={1} fill="#fff" />
    </g>
  );
}

function Tuft({ x, i }) {
  return (
    <g className="px-sway" style={{ '--dur': `${2.2 + (i % 5) * 0.4}s`, '--delay': `${-i * 0.3}s` }}>
      <rect x={x} y={GROUND - 4} width={1} height={4} fill="#4f9636" />
      <rect x={x + 1} y={GROUND - 6} width={1} height={6} fill="#6fb84a" />
      <rect x={x + 2} y={GROUND - 3} width={1} height={3} fill="#4f9636" />
    </g>
  );
}

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

function Bird({ y, dur, delay }) {
  const up = [[0, 0, 2, 1], [2, 1, 1, 1], [3, 2, 1, 1], [4, 1, 1, 1], [5, 0, 2, 1]];
  const down = [[0, 3, 2, 1], [2, 2, 1, 1], [3, 2, 1, 1], [4, 2, 1, 1], [5, 3, 2, 1]];
  return (
    <g transform={`translate(0 ${y})`}>
      <g className="px-fly" style={{ '--dur': `${dur}s`, '--delay': `${delay}s` }}>
        <g transform="scale(1.6)" fill="#2f2f2f">
          <g className="px-flap-a">{up.map((r, i) => <rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} />)}</g>
          <g className="px-flap-b">{down.map((r, i) => <rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} />)}</g>
        </g>
      </g>
    </g>
  );
}

function Explorer({ night }) {
  return (
    <g transform={`translate(0 ${GROUND - 20})`}>
      <g className="px-walk" style={{ '--dur': '46s' }}>
        <g className="px-bob">
          {night && <rect x={5} y={9} width={13} height={13} fill="#ffe08a" opacity={0.14} />}
          {/* hat */}
          <rect x={2} y={0} width={8} height={3} fill="#6d4a26" />
          <rect x={2} y={2} width={8} height={1} fill="#3f7d3a" />
          <rect x={-1} y={3} width={14} height={2} fill="#5b3a1e" />
          {/* head */}
          <rect x={2} y={5} width={8} height={6} fill="#e8b88a" />
          <rect x={2} y={5} width={2} height={3} fill="#3b2616" />
          <rect x={7} y={7} width={1} height={2} fill="#2b1d12" />
          <rect x={8} y={9} width={1} height={1} fill="#e39a7a" />
          {/* backpack */}
          <rect x={-1} y={11} width={4} height={6} fill="#8a5a2e" />
          <rect x={-1} y={11} width={4} height={2} fill="#a0703f" />
          {/* body */}
          <rect x={2} y={11} width={8} height={6} fill="#3f7d3a" />
          <rect x={3} y={11} width={2} height={5} fill="#4f9a47" />
          <rect x={4} y={11} width={1} height={6} fill="#6b4226" />
          <rect x={2} y={16} width={8} height={1} fill="#5b3a1e" />
          {/* arm + legs, two walk frames */}
          <g className="px-frame-a">
            <rect x={8} y={12} width={2} height={4} fill="#3f7d3a" />
            <rect x={8} y={16} width={2} height={1} fill="#e8b88a" />
            <rect x={2} y={17} width={2} height={2} fill="#3b4a6b" />
            <rect x={8} y={17} width={2} height={2} fill="#3b4a6b" />
            <rect x={1} y={19} width={3} height={1} fill="#2b1d12" />
            <rect x={8} y={19} width={3} height={1} fill="#2b1d12" />
          </g>
          <g className="px-frame-b">
            <rect x={6} y={12} width={2} height={4} fill="#3f7d3a" />
            <rect x={6} y={16} width={2} height={1} fill="#e8b88a" />
            <rect x={4} y={17} width={2} height={2} fill="#3b4a6b" />
            <rect x={6} y={17} width={2} height={2} fill="#3b4a6b" />
            <rect x={4} y={19} width={2} height={1} fill="#2b1d12" />
            <rect x={6} y={19} width={3} height={1} fill="#2b1d12" />
          </g>
          {night && (
            <g>
              <rect x={10} y={13} width={3} height={1} fill="#3a2a1a" />
              <rect x={10} y={14} width={3} height={4} fill="#3a2a1a" />
              <rect x={11} y={15} width={1} height={2} fill="#ffe08a" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
}

// `dirtDepth` trims how much soil shows under the grass line (full scene = 48).
function PixelForestScene({ night = false, className = '', dirtDepth = H - GROUND }) {
  const sky = night
    ? ['#1d2550', '#232d5c', '#2a3567', '#323e72', '#3a477c']
    : ['#7ec8e3', '#8fd0e8', '#a2d8ec', '#b6e0ee', '#c8e8ef'];
  const hills = night
    ? { far: '#3b5446', near: '#2c4633', line: '#223a2a', lineHi: '#2c4a35' }
    : { far: '#a3c48c', near: '#6fa35a', line: '#4f8a45', lineHi: '#5d9a4f' };

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${GROUND + dirtDepth}`}
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="px-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* sky */}
      {sky.map((c, i) => <rect key={c} x={0} y={i * 42} width={W} height={i === 4 ? H : 42} fill={c} />)}

      {/* sun (day) */}
      {!night && (
        <g>
          <rect x={396} y={24} width={26} height={26} fill="#f6d365" />
          <rect x={400} y={28} width={18} height={18} fill="#ffe79a" />
        </g>
      )}

      <Cloud y={30} s={1.2} dur={95} delay={-12} night={night} />
      <Cloud y={56} s={0.9} dur={125} delay={-72} night={night} />
      <Cloud y={18} s={0.8} dur={150} delay={-40} night={night} />
      <Cloud y={78} s={1} dur={115} delay={-98} night={night} />
      {/* lower clouds that drift past the middle of the scene */}
      <Cloud y={104} s={1.1} dur={135} delay={-55} night={night} />
      <Cloud y={128} s={0.85} dur={105} delay={-20} night={night} />

      {!night && (
        <>
          <Bird y={66} dur={26} delay={-6} />
          <Bird y={80} dur={33} delay={-19} />
        </>
      )}

      {/* hills */}
      <path d={stepPath(FAR_HILLS, 16)} fill={hills.far} />
      <path d={stepPath(NEAR_HILLS, 8)} fill={hills.near} />
      {TREE_LINE.map(i => (
        <g key={i}>
          <rect x={i * 8} y={NEAR_HILLS[i] - 7} width={6} height={7} fill={hills.line} />
          <rect x={i * 8 + 1} y={NEAR_HILLS[i] - 7} width={2} height={2} fill={hills.lineHi} />
        </g>
      ))}

      {/* trees & props on the ground line */}
      <Oak x={26} h={44} />
      <Oak x={78} h={32} s={0.85} />
      <Pine x={118} s={0.8} />
      <Pine x={372} s={0.9} />
      <Oak x={410} h={30} s={0.8} />
      <Oak x={446} h={46} />

      {/* ground: grass top + dirt */}
      <rect x={0} y={GROUND} width={W} height={H - GROUND} fill="#7a5230" />
      <rect x={0} y={GROUND} width={W} height={5} fill="#5fa843" />
      <rect x={0} y={GROUND} width={W} height={1} fill="#86c95e" />
      {DIRT.drips.map(([x, w, h], i) => <rect key={`d${i}`} x={x} y={GROUND + 5} width={w} height={h} fill="#5fa843" />)}
      {DIRT.specks.map(([x, y, s, c], i) => <rect key={`s${i}`} x={x} y={y} width={s} height={s} fill={c} />)}
      {DIRT.stones.map(([x, y], i) => (
        <g key={`st${i}`}>
          <rect x={x} y={y} width={5} height={3} fill="#8a8a80" />
          <rect x={x} y={y} width={2} height={1} fill="#a5a59b" />
        </g>
      ))}

      <Rock x={170} />
      <Rock x={262} s={0.7} />
      <Rock x={466} s={0.6} />
      {[50, 160, 398].map(x => <Mushroom key={x} x={x} />)}
      {TUFTS.map((x, i) => <Tuft key={x} x={x} i={i} />)}
      {FLOWERS.map((x, i) => <Flower key={x} x={x} i={i} color={FLOWER_COLORS[i % FLOWER_COLORS.length]} />)}

      {/* pond + bridge */}
      <rect x={300} y={225} width={92} height={5} fill="#3f86bf" />
      <rect x={304} y={230} width={84} height={5} fill="#3a7bb0" />
      <rect x={310} y={235} width={72} height={4} fill="#336e9f" />
      <rect x={300} y={225} width={92} height={1} fill="#7bb8e0" />
      <rect className="px-shimmer" x={314} y={228} width={8} height={1} fill="#bfe3f5" style={{ '--delay': '0s' }} />
      <rect className="px-shimmer" x={344} y={231} width={6} height={1} fill="#bfe3f5" style={{ '--delay': '-0.8s' }} />
      <rect className="px-shimmer" x={366} y={227} width={10} height={1} fill="#bfe3f5" style={{ '--delay': '-1.6s' }} />
      <rect x={328} y={226} width={6} height={1} fill="#4f9636" />
      <rect x={330} y={225} width={2} height={1} fill="#f08fb0" />
      <rect x={297} y={213} width={98} height={2} fill="#8a5d31" />
      {[298, 346, 392].map(x => <rect key={x} x={x} y={213} width={2} height={9} fill="#6e4a26" />)}
      <rect x={296} y={GROUND} width={100} height={2} fill="#9a6a3a" />
      <rect x={296} y={GROUND + 2} width={100} height={1} fill="#6e4a26" />
      {[298, 392].map(x => <rect key={x} x={x} y={GROUND + 3} width={2} height={10} fill="#6e4a26" />)}

      <Explorer night={night} />

      {/* falling leaves */}
      {LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y})`}>
          <rect
            className="px-leaf"
            width={2}
            height={2}
            fill={l.c}
            style={{ '--dur': `${l.dur}s`, '--delay': `${l.delay}s`, '--drift': `${l.drift}px` }}
          />
        </g>
      ))}

      {/* night layer */}
      {night && (
        <>
          <rect x={0} y={0} width={W} height={H} fill="#0a0f2a" opacity={0.36} />
          {STARS.map((s, i) => (
            <rect key={i} className="px-twinkle" x={s.x} y={s.y} width={s.s} height={s.s} fill="#fdf6d8" style={{ '--dur': `${s.dur}s`, '--delay': `${s.delay}s` }} />
          ))}
          <rect x={398} y={24} width={22} height={22} fill="#f1ead2" />
          <rect x={404} y={30} width={4} height={4} fill="#d9d0b4" />
          <rect x={412} y={38} width={3} height={3} fill="#d9d0b4" />
          {FIREFLIES.map((f, i) => (
            <rect key={i} className="px-firefly" x={f.x} y={f.y} width={2} height={2} fill="#eaff8a" filter="url(#px-glow)" style={{ '--dur': `${f.dur}s`, '--delay': `${f.delay}s` }} />
          ))}
        </>
      )}
    </svg>
  );
}

export default memo(PixelForestScene);
