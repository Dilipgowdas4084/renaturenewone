// Tileable pixel textures (grass, dirt, stone, planks…) generated as tiny SVG tiles.
// Seeded randomness keeps every texture identical between renders.

function seeded(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function tile(size, base, rects) {
  const body = rects.map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${base}"/>${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function speckled(seed, base, palette, density = 0.28) {
  const rand = seeded(seed);
  const rects = [];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (rand() < density) rects.push([x, y, 1, 1, palette[Math.floor(rand() * palette.length)]]);
    }
  }
  return tile(16, base, rects);
}

function planks(base, line, seam, grain) {
  const rand = seeded(7);
  const rects = [];
  const seams = [5, 12, 2, 9];
  for (let row = 0; row < 4; row++) {
    rects.push([0, row * 4 + 3, 16, 1, line]);
    rects.push([seams[row], row * 4, 1, 3, seam]);
    for (let i = 0; i < 3; i++) rects.push([Math.floor(rand() * 15), row * 4 + Math.floor(rand() * 3), 2, 1, grain]);
  }
  return tile(16, base, rects);
}

const TEXTURES = {
  grass: speckled(11, '#5fa843', ['#6fb84a', '#4f9636', '#78c455']),
  dirt: speckled(23, '#7a5230', ['#6b4628', '#8b6038', '#5e3d22', '#94693f']),
  darkDirt: speckled(29, '#4d3420', ['#433019', '#5a3d25', '#3a2815']),
  stone: speckled(37, '#6e6e67', ['#5f5f59', '#7d7d74', '#86867d', '#57574f']),
  deepslate: speckled(41, '#2a2825', ['#232120', '#322f2b', '#1d1b19']),
  bedrock: speckled(43, '#1b1916', ['#24211d', '#141210', '#2b2823'], 0.35),
  planks: planks('#9a6a3a', '#6e4a26', '#6e4a26', '#a8773f'),
  darkPlanks: planks('#5c3e22', '#3f2a16', '#3f2a16', '#6b4a2b'),
  parchment: speckled(53, '#f1e6c8', ['#e8dab6', '#f6eed8', '#eadcb9'], 0.18),
};

export function texture(name, size = 64) {
  return {
    backgroundImage: TEXTURES[name],
    backgroundSize: `${size}px ${size}px`,
    imageRendering: 'pixelated',
  };
}

export default TEXTURES;
