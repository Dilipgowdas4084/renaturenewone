import { memo } from 'react';

// Full-page pixel cave used behind the login & register pages. A tunnel recedes
// into darkness; an explorer walks out of it toward the viewer, lantern raised.
// Scene grid is 480×270 units; the explorer's feet are drawn at (0, 0) so the
// CSS animation (.cave-walker in index.css) can move + scale them from the far
// end of the tunnel to the foreground.

const VP = { x: 230, y: 118 }; // vanishing point (far end of the tunnel)

// Outline of the tunnel mouth around the vanishing point (unscaled, flat floor).
const MOUTH = [
  [-300, -150], [-230, -178], [-130, -196], [0, -204], [120, -196], [230, -176], [300, -146],
  [330, -60], [338, 40], [324, 170], [-324, 170], [-338, 40], [-330, -60],
];
const RINGS = [
  [1.0, '#4b4752'], [0.74, '#423e49'], [0.55, '#38353f'], [0.41, '#2e2b34'],
  [0.3, '#24222a'], [0.21, '#1b1a20'], [0.14, '#131216'], [0.08, '#09080b'],
];

function ringPoints(scale) {
  return MOUTH.map(([x, y]) => `${Math.round(VP.x + x * scale)},${Math.round(VP.y + y * scale)}`).join(' ');
}

function seeded(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const SPECKS = (() => {
  const rand = seeded(17);
  return Array.from({ length: 140 }, () => {
    const x = Math.floor(rand() * 480);
    const y = Math.floor(rand() * 270);
    // keep the far, dark centre clean
    const dx = (x - VP.x) / 120, dy = (y - VP.y) / 90;
    if (dx * dx + dy * dy < 1) return null;
    return [x, y, rand() < 0.3 ? 2 : 1, rand() < 0.5 ? '#3a3640' : '#1d1b21'];
  }).filter(Boolean);
})();

const STALACTITES = [[24, 26, 9], [62, 14, 13], [104, 9, 8], [150, 6, 15], [196, 4, 7], [262, 4, 11], [318, 8, 16], [362, 14, 9], [404, 22, 14], [446, 30, 10]];
const STALAGMITES = [[18, 270, 14], [46, 270, 9], [432, 270, 12], [462, 270, 18]];
const CRYSTALS = [
  { x: 34, y: 170, c: '#4fd1c5', hi: '#a7f3ec', s: 1.1 },
  { x: 444, y: 150, c: '#9b7fd4', hi: '#d6c8f5', s: 1.2 },
  { x: 372, y: 64, c: '#4fd1c5', hi: '#a7f3ec', s: 0.8 },
  { x: 86, y: 70, c: '#9b7fd4', hi: '#d6c8f5', s: 0.8 },
];
const DRIPS = [[108, 22, 3.2, -0.4], [332, 22, 3.8, -1.9], [410, 30, 2.9, -2.6], [60, 30, 3.5, -1.2]];

function Crystal({ x, y, c, hi, s, i }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="px-twinkle" style={{ '--dur': `${3 + i}s`, '--delay': `${-i}s` }}>
        <rect x={-10} y={-26} width={22} height={30} fill={c} opacity={0.12} />
      </g>
      <rect x={-6} y={-14} width={4} height={14} fill={c} />
      <rect x={-1} y={-22} width={5} height={22} fill={c} />
      <rect x={5} y={-11} width={4} height={11} fill={c} />
      <rect x={-1} y={-22} width={2} height={20} fill={hi} />
      <rect x={-6} y={-14} width={1} height={12} fill={hi} />
      <rect x={-8} y={0} width={19} height={3} fill="#3a3640" />
    </g>
  );
}

// Explorer sprite, feet at (0,0), facing the viewer and holding up a lantern.
function Explorer() {
  return (
    <g>
      {/* lantern light — blended as light so it warms the rock around them */}
      <g className="px-flicker" style={{ mixBlendMode: 'screen' }}>
        {/* stepped falloff so the light fades out instead of ending in a hard box */}
        <rect x={-56} y={-86} width={146} height={104} fill="#1a1203" />
        <rect x={-40} y={-72} width={114} height={84} fill="#2a1e05" />
        <rect x={-24} y={-58} width={82} height={64} fill="#3e2e07" />
        <rect x={-10} y={-46} width={54} height={46} fill="#56420a" />
        <rect x={2} y={-36} width={30} height={30} fill="#6e560d" />
      </g>
      {/* pool of light on the ground */}
      <rect className="px-flicker" x={-26} y={-2} width={56} height={4} fill="#c79a3a" fillOpacity={0.35} />

      <g className="cave-stride">
        {/* hat */}
        <rect x={-8} y={-53} width={14} height={6} fill="#6d4a26" />
        <rect x={-8} y={-49} width={14} height={1} fill="#3f7d3a" />
        <rect x={-11} y={-48} width={20} height={2} fill="#5b3a1e" />
        {/* head */}
        <rect x={-8} y={-46} width={14} height={11} fill="#e8b88a" />
        <rect x={-8} y={-46} width={14} height={2} fill="#3b2616" />
        <rect x={-5} y={-42} width={2} height={2} fill="#2b1d12" />
        <rect x={1} y={-42} width={2} height={2} fill="#2b1d12" />
        <rect x={-3} y={-38} width={4} height={1} fill="#b86f52" />
        <rect className="px-flicker" x={3} y={-45} width={3} height={9} fill="#ffd27a" fillOpacity={0.35} />
        {/* scarf + tunic */}
        <rect x={-7} y={-35} width={12} height={2} fill="#c0392b" />
        <rect x={-9} y={-33} width={16} height={14} fill="#3f7d3a" />
        <rect x={-9} y={-33} width={3} height={14} fill="#346b30" />
        <rect x={-9} y={-23} width={16} height={2} fill="#5b3a1e" />
        <rect x={-2} y={-23} width={2} height={2} fill="#e9c46a" />
        {/* backpack straps */}
        <rect x={-6} y={-33} width={2} height={10} fill="#8a5a2e" />
        {/* left arm down */}
        <rect x={-12} y={-32} width={3} height={11} fill="#346b30" />
        <rect x={-12} y={-21} width={3} height={3} fill="#e8b88a" />
        {/* right arm raised with the lantern */}
        <rect x={7} y={-32} width={3} height={6} fill="#3f7d3a" />
        <rect x={7} y={-28} width={7} height={3} fill="#3f7d3a" />
        <rect x={14} y={-29} width={3} height={4} fill="#e8b88a" />
        <rect x={15} y={-25} width={1} height={3} fill="#2b2b2b" />
        <rect x={12} y={-22} width={7} height={2} fill="#3a3a3a" />
        <rect className="px-flicker" x={13} y={-20} width={5} height={6} fill="#ffd54a" />
        <rect className="px-flicker" x={14} y={-19} width={2} height={3} fill="#fff3b0" style={{ '--delay': '-0.4s' }} />
        <rect x={12} y={-20} width={1} height={6} fill="#3a3a3a" />
        <rect x={18} y={-20} width={1} height={6} fill="#3a3a3a" />
        <rect x={12} y={-14} width={7} height={2} fill="#3a3a3a" />
        {/* legs: two walking frames */}
        <g className="cave-step-a">
          <rect x={-7} y={-19} width={5} height={15} fill="#3b4a6b" />
          <rect x={0} y={-19} width={5} height={15} fill="#3b4a6b" />
          <rect x={-8} y={-4} width={7} height={4} fill="#2b1d12" />
          <rect x={-1} y={-4} width={7} height={4} fill="#2b1d12" />
        </g>
        <g className="cave-step-b">
          <rect x={-6} y={-19} width={5} height={13} fill="#3b4a6b" />
          <rect x={0} y={-19} width={5} height={15} fill="#3b4a6b" />
          <rect x={-7} y={-6} width={7} height={4} fill="#2b1d12" />
          <rect x={-1} y={-4} width={7} height={4} fill="#2b1d12" />
        </g>
      </g>
    </g>
  );
}

function CaveScene() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" className="w-full h-full block">
        <rect width={480} height={270} fill="#4b4752" />

        {/* tunnel rings receding into darkness */}
        {RINGS.map(([scale, fill]) => <polygon key={scale} points={ringPoints(scale)} fill={fill} />)}

        {/* floor of the tunnel */}
        <polygon points={`${VP.x - 8},${VP.y + 12} ${VP.x + 8},${VP.y + 12} 430,270 30,270`} fill="#2f2824" />
        <polygon points={`${VP.x - 3},${VP.y + 12} ${VP.x + 3},${VP.y + 12} 280,270 150,270`} fill="#3a312b" />

        {SPECKS.map(([x, y, s, c], i) => <rect key={i} x={x} y={y} width={s} height={s} fill={c} />)}

        {/* stalactites & stalagmites */}
        {STALACTITES.map(([x, y, h]) => (
          <g key={`t${x}`}>
            <rect x={x - 4} y={0} width={9} height={y} fill="#2c2930" />
            <rect x={x - 3} y={y} width={7} height={Math.round(h * 0.5)} fill="#2c2930" />
            <rect x={x - 1} y={y} width={3} height={h} fill="#2c2930" />
            <rect x={x - 1} y={y} width={1} height={h - 2} fill="#45414b" />
          </g>
        ))}
        {STALAGMITES.map(([x, y, h]) => (
          <g key={`m${x}`}>
            <rect x={x - 6} y={y - Math.round(h * 0.5)} width={13} height={Math.round(h * 0.5)} fill="#2c2930" />
            <rect x={x - 2} y={y - h} width={5} height={h} fill="#2c2930" />
            <rect x={x - 2} y={y - h} width={1} height={h} fill="#45414b" />
          </g>
        ))}

        {CRYSTALS.map((c, i) => <Crystal key={i} {...c} i={i} />)}

        {/* water drips */}
        {DRIPS.map(([x, y, dur, delay]) => (
          <rect key={x} className="cave-drip" x={x} y={y} width={1} height={2} fill="#7ec8e3" style={{ '--dur': `${dur}s`, '--delay': `${delay}s` }} />
        ))}

        {/* the explorer, walking out of the dark */}
        <g className="cave-walker">
          <Explorer />
        </g>

        {/* soft vignette so the edges fall into darkness */}
        <rect x={0} y={0} width={480} height={18} fill="#0a090c" opacity={0.5} />
        <rect x={0} y={252} width={480} height={18} fill="#0a090c" opacity={0.35} />
      </svg>
    </div>
  );
}

export default memo(CaveScene);
