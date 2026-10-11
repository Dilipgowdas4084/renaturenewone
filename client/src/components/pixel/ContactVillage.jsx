import { texture } from '../../utils/pixelTextures';
import { useDayNight } from '../../context/DayNightContext';
import './contact-village.css';

const SKIES = {
  day: 'linear-gradient(#5db7e8 0 35%, #86cdf0 35% 65%, #b6e2f5 65%)',
  night: 'linear-gradient(#141b44 0 35%, #1d2550 35% 65%, #262f60 65%)',
};

export function Cloud({ y, s, dur, delay, night }) {
  const fill = night ? '#8791b5' : '#ffffff';
  const shade = night ? '#6d769a' : '#dce9ef';
  return (
    <g transform={`translate(0 ${y})`} opacity={night ? 0.5 : 0.95}>
      <g className="px-drift" style={{ '--dur': `${dur}s`, '--delay': `${delay}s` }}>
        <g transform={`scale(${s})`}>
          <rect x={0} y={0} width={28} height={6} fill={fill} />
          <rect x={6} y={-5} width={14} height={5} fill={fill} />
          <rect x={-4} y={4} width={36} height={6} fill={fill} />
          <rect x={-4} y={9} width={36} height={2} fill={shade} />
        </g>
      </g>
    </g>
  );
}

// Cubic oak: log trunk + stacked leaf blocks.
export function Tree({ x, y, s = 1, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-2} y={-12} width={4} height={12} fill="#6b4226" />
      <rect x={-2} y={-12} width={1} height={12} fill="#54321b" />
      <g className="px-sway" style={{ '--dur': '5s', '--delay': `${delay}s` }}>
        <rect x={-10} y={-24} width={20} height={12} fill="#3e8a35" />
        <rect x={-7} y={-32} width={14} height={8} fill="#4a9d3f" />
        <rect x={-10} y={-16} width={20} height={4} fill="#2f6f2a" />
        <rect x={-4} y={-28} width={3} height={3} fill="#67b85a" />
        <rect x={3} y={-20} width={3} height={3} fill="#67b85a" />
      </g>
    </g>
  );
}

export function Lantern({ x, y, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={1} y={-2} width={2} height={2} fill="#2b2b2b" />
      <rect x={0} y={0} width={4} height={5} fill="#3a3a3a" />
      <rect className="cv-flicker" x={1} y={1} width={2} height={3} fill="#ffd54a" style={{ animationDelay: `${delay}s` }} />
    </g>
  );
}

export function Flower({ x, y, c }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={1} y={2} width={1} height={3} fill="#2f7a2a" />
      <rect x={0} y={0} width={3} height={2} fill={c} />
      <rect x={1} y={0} width={1} height={1} fill="#ffe27a" />
    </g>
  );
}

export function Steve({ x = 0, y = 0, walking = true }) {
  const legs = (a) => (
    <g>
      <rect x={a ? 0 : 1} y={9} width={2} height={4} fill="#3b4fa0" />
      <rect x={a ? 4 : 3} y={9} width={2} height={4} fill="#2d3c80" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={walking ? 'px-bob' : ''}>
        <rect x={0} y={0} width={6} height={5} fill="#e0ac82" />
        <rect x={0} y={0} width={6} height={2} fill="#4a2f1a" />
        <rect x={1} y={3} width={1} height={1} fill="#3a2a6a" />
        <rect x={4} y={3} width={1} height={1} fill="#3a2a6a" />
        <rect x={0} y={5} width={6} height={4} fill="#29a3a3" />
        <rect x={-1} y={5} width={1} height={4} fill="#e0ac82" />
        <rect x={6} y={5} width={1} height={4} fill="#e0ac82" />
        {walking ? (
          <>
            <g className="px-frame-a">{legs(true)}</g>
            <g className="px-frame-b">{legs(false)}</g>
          </>
        ) : legs(false)}
      </g>
    </g>
  );
}

const FLOWERS = [[92, 118, '#ff8fb1'], [100, 124, '#ffd54a'], [150, 130, '#ffffff'], [186, 132, '#ff6b6b'], [300, 130, '#c78bff'], [372, 128, '#ffd54a'], [396, 134, '#ff8fb1'], [420, 126, '#ffffff'], [448, 132, '#ff6b6b'], [12, 112, '#ffd54a']];
const PARTICLES = [[326, -8], [332, 6], [338, -3], [344, 9], [350, -6], [356, 4], [322, 2], [360, -10]];

function Scene({ sent, night }) {
  const grass = night ? ['#2f5e2d', '#25501f'] : ['#5fa843', '#4c8f36'];
  return (
    <svg
      viewBox="0 0 480 150"
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      className="block w-full h-64 sm:h-80 lg:h-[26rem]"
      role="img"
      aria-label="A small blocky village with a wooden contact house, a mailbox, a pond and an explorer walking along the path"
    >
      {night ? (
        <rect x={60} y={14} width={20} height={20} fill="#f1ead2" />
      ) : (
        <>
          <rect x={60} y={12} width={26} height={26} fill="#f6d365" />
          <rect x={64} y={16} width={18} height={18} fill="#ffe79a" />
        </>
      )}
      <Cloud y={22} s={1.2} dur={95} delay={-20} night={night} />
      <Cloud y={52} s={0.9} dur={125} delay={-80} night={night} />

      {/* distant blocky mountains */}
      <path d="M0 104 V78 H24 V64 H48 V52 H72 V64 H96 V76 H120 V90 H150 V104 Z" fill={night ? '#3b4a63' : '#8fb0c8'} />
      <path d="M300 104 V84 H330 V66 H354 V50 H384 V38 H408 V52 H432 V70 H456 V84 H480 V104 Z" fill={night ? '#34435a' : '#7ea2bd'} />
      <path d="M0 104 V92 H40 V84 H80 V92 H130 V98 H200 V92 H290 V96 H360 V88 H480 V104 Z" fill={night ? '#2b4a36' : '#6fa35a'} />

      {/* back forest */}
      <Tree x={22} y={104} s={1.1} />
      <Tree x={112} y={104} s={0.9} delay={-1} />
      <Tree x={372} y={104} s={1.2} delay={-2} />
      <Tree x={420} y={104} s={0.95} delay={-3} />
      <Tree x={462} y={104} s={1.15} delay={-1.5} />

      {/* ground: grass on top, dirt cross-section at the bottom */}
      <rect x={0} y={104} width={480} height={46} fill={grass[0]} />
      <rect x={0} y={104} width={480} height={3} fill="#86c95e" />
      <rect x={0} y={122} width={480} height={4} fill={grass[1]} />
      <rect x={0} y={140} width={480} height={10} fill="#7a5230" />
      <rect x={0} y={140} width={480} height={2} fill="#5fa843" />
      {[6, 40, 74, 118, 160, 204, 260, 300, 346, 392, 430, 466].map((x, i) => (
        <rect key={x} x={x} y={143 + (i % 3) * 2} width={3} height={2} fill="#5c3d22" />
      ))}

      {/* dirt + stone path */}
      <rect x={226} y={108} width={28} height={34} fill="#9b7448" />
      <rect x={218} y={128} width={44} height={14} fill="#9b7448" />
      {[[228, 112], [240, 116], [230, 122], [244, 128], [222, 132], [236, 136], [250, 134]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={8} height={5} fill="#8b8b8b" />
      ))}

      {/* pond */}
      <rect x={16} y={122} width={58} height={16} fill="#6d4a2b" />
      <rect x={18} y={123} width={54} height={13} fill="#3b8fd0" />
      <rect x={18} y={123} width={54} height={3} fill="#5fb0e8" />
      {[[24, 128], [44, 131], [58, 126]].map(([x, y], i) => (
        <rect key={x} className="px-shimmer" x={x} y={y} width={6} height={1} fill="#d9f0ff" style={{ '--delay': `${i * 0.6}s` }} />
      ))}
      <rect x={60} y={121} width={5} height={3} fill="#2f7a2a" />
      <rect x={62} y={119} width={2} height={2} fill="#ff8fb1" />

      {/* contact house */}
      <g className="cv-hot cv-house" tabIndex={0} aria-label="Contact Renature house">
        <rect x={196} y={104} width={88} height={6} fill="#7d7d7d" />
        {[198, 210, 222, 254, 266, 276].map(x => <rect key={x} x={x} y={105} width={6} height={3} fill="#9a9a9a" />)}
        <rect x={200} y={72} width={80} height={32} fill="#b8894f" />
        {[78, 86, 94].map(y => <rect key={y} x={200} y={y} width={80} height={1} fill="#8f6a3a" />)}
        <rect x={198} y={68} width={6} height={38} fill="#5b3a1e" />
        <rect x={276} y={68} width={6} height={38} fill="#5b3a1e" />
        <rect x={198} y={68} width={2} height={38} fill="#43290f" />
        <rect x={276} y={68} width={2} height={38} fill="#43290f" />
        <rect x={192} y={62} width={96} height={8} fill="#8a3f2b" />
        <rect x={198} y={54} width={84} height={8} fill="#9c4a33" />
        <rect x={208} y={47} width={64} height={7} fill="#8a3f2b" />
        <rect x={222} y={41} width={36} height={6} fill="#9c4a33" />
        <rect x={192} y={69} width={96} height={2} fill="#5e2a1c" />
        {[208, 262].map(x => (
          <g key={x}>
            <rect x={x} y={78} width={10} height={10} fill="#3a2a1a" />
            <rect x={x + 1} y={79} width={8} height={8} fill={night ? '#f4c95d' : '#bfe4f5'} />
            <rect x={x + 4} y={79} width={1} height={8} fill="#3a2a1a" />
            <rect x={x + 1} y={82} width={8} height={1} fill="#3a2a1a" />
          </g>
        ))}
        <rect x={230} y={80} width={20} height={24} fill="#2a1a0d" />
        <rect className="cv-glow" x={232} y={82} width={16} height={22} fill="#ffd54a" opacity="0.8" />
        <rect className="cv-door" x={230} y={80} width={20} height={24} fill="#6e4a26" />
        <rect className="cv-door" x={232} y={82} width={7} height={9} fill="#82592e" />
        <rect className="cv-door" x={241} y={82} width={7} height={9} fill="#82592e" />
        <rect className="cv-door" x={245} y={92} width={2} height={2} fill="#e8d28a" />
        <Lantern x={222} y={82} />
        <Lantern x={254} y={82} delay={-0.5} />
        <g className="cv-label">
          <rect x={188} y={26} width={104} height={11} fill="#3a2a1a" />
          <rect x={189} y={27} width={102} height={9} fill="#f3e6bf" />
          <text x={240} y={34.2} textAnchor="middle" fontSize="6" fill="#3a2a1a" className="font-pixel">CONTACT RENATURE</text>
        </g>
      </g>

      {/* wooden signpost */}
      <g>
        <rect x={132} y={100} width={3} height={22} fill="#5b3a1e" />
        <rect x={112} y={92} width={44} height={16} fill="#3a2a1a" />
        <rect x={113} y={93} width={42} height={14} fill="#c9985a" />
        <rect x={113} y={93} width={42} height={2} fill="#dcb072" />
        <text x={134} y={99.5} textAnchor="middle" fontSize="5.5" fill="#3a2a1a" className="font-pixel">CONTACT</text>
        <text x={134} y={105.5} textAnchor="middle" fontSize="5.5" fill="#3a2a1a" className="font-pixel">RENATURE</text>
      </g>

      {/* fences with lanterns */}
      {[166, 290].map(x0 => (
        <g key={x0}>
          {[0, 8, 16, 24].map(dx => <rect key={dx} x={x0 + dx} y={106} width={3} height={12} fill="#7a5230" />)}
          <rect x={x0} y={109} width={27} height={2} fill="#96683a" />
          <rect x={x0} y={114} width={27} height={2} fill="#96683a" />
        </g>
      ))}
      <Lantern x={165} y={101} delay={-0.9} />
      <Lantern x={314} y={101} delay={-0.3} />

      {/* mailbox */}
      <g className={`cv-hot ${sent ? 'is-open' : ''}`} tabIndex={0} aria-label="Mailbox: send us a message">
        <rect x={336} y={104} width={3} height={20} fill="#5b3a1e" />
        <rect x={328} y={96} width={20} height={10} fill="#c0392b" />
        <rect x={328} y={96} width={20} height={2} fill="#e0574a" />
        <rect x={329} y={101} width={18} height={4} fill="#1a1a1a" />
        <rect className="cv-lid" x={328} y={94} width={20} height={3} fill="#a5301f" />
        <rect className="cv-flag" x={347} y={88} width={2} height={9} fill="#f1c40f" />
        <rect className="cv-flag" x={343} y={88} width={5} height={3} fill="#f1c40f" />
        <g className="cv-label">
          <rect x={306} y={78} width={68} height={10} fill="#3a2a1a" />
          <rect x={307} y={79} width={66} height={8} fill="#f3e6bf" />
          <text x={340} y={85.4} textAnchor="middle" fontSize="5" fill="#3a2a1a" className="font-pixel">SEND US A MESSAGE</text>
        </g>
      </g>

      {/* success: only rendered after a real successful submit */}
      {sent && (
        <g>
          <g className="cv-pop">
            <rect x={330} y={83} width={12} height={8} fill="#fff" />
            <rect x={330} y={83} width={12} height={2} fill="#dcdcdc" />
            <rect x={335} y={85} width={2} height={2} fill="#c0392b" />
          </g>
          {PARTICLES.map(([x, dx], i) => (
            <rect
              key={x}
              className="cv-particle"
              x={x}
              y={96}
              width={2}
              height={2}
              fill={['#4fbf3a', '#ffd54a', '#ffffff', '#86c95e'][i % 4]}
              style={{ '--dx': `${dx}px`, '--delay': `${i * 0.15}s` }}
            />
          ))}
          <g className="cv-pop">
            <rect x={302} y={64} width={76} height={11} fill="#3a2a1a" />
            <rect x={303} y={65} width={74} height={9} fill="#4fbf3a" />
            <text x={340} y={72.2} textAnchor="middle" fontSize="6" fill="#0f2a0c" className="font-pixel">MESSAGE SENT!</text>
          </g>
          <Steve x={316} y={111} walking={false} />
        </g>
      )}

      {/* flowers, mushrooms, rocks, grass */}
      {FLOWERS.map(([x, y, c]) => <Flower key={`${x}${y}`} x={x} y={y} c={c} />)}
      {[[86, 134], [268, 136], [384, 116]].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <rect x={1} y={2} width={2} height={3} fill="#f1e8d6" />
          <rect x={0} y={0} width={4} height={2} fill="#d94b3d" />
          <rect x={1} y={0} width={1} height={1} fill="#fff" />
        </g>
      ))}
      {[[200, 134], [402, 122], [148, 116]].map(([x, y]) => (
        <g key={x}>
          <rect x={x} y={y} width={7} height={4} fill="#8a8a8a" />
          <rect x={x} y={y} width={7} height={1} fill="#b0b0b0" />
        </g>
      ))}
      {[[10, 106], [104, 108], [300, 108], [440, 108], [362, 108]].map(([x, y], i) => (
        <rect key={x} className="px-sway" x={x} y={y} width={2} height={4} fill="#3e8a35" style={{ '--dur': '3s', '--delay': `${-i * 0.7}s` }} />
      ))}

      {/* falling leaves */}
      {[[380, 60], [430, 68], [30, 62], [120, 70], [455, 58]].map(([x, y], i) => (
        <rect key={x} className="px-leaf" x={x} y={y} width={3} height={3} fill="#67b85a" style={{ '--dur': `${8 + i}s`, '--delay': `${-i * 2}s`, '--drift': `${6 + i * 2}px` }} />
      ))}

      {/* explorer walking along the path */}
      {!sent && (
        <g className="px-walk" style={{ '--dur': '36s', '--delay': '-10s' }}>
          <Steve x={0} y={125} />
        </g>
      )}

      {night && <rect x={0} y={0} width={480} height={150} fill="#0a1030" opacity={0.28} pointerEvents="none" />}
    </svg>
  );
}

// Header for the Contact page: sky + wooden title sign + a small village scene.
export default function ContactVillage({
  sent = false,
  eyebrow = 'CONTACT',
  title = 'CONTACT RENATURE',
  subtitle = "Have questions, ideas, or want to collaborate? We'd love to hear from you.",
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
      <Scene sent={sent} night={night} />
    </header>
  );
}
