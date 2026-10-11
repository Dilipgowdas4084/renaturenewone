const fs = require('fs');
const path = require('path');
const pool = require('../db');

/*
 * Persistent storage for the admin-managed website content.
 *
 * - PostgreSQL configured: stored in the `site_content` table (one JSON row).
 * - No PostgreSQL (default in-memory mode): stored in server/data/site-content.json
 *   so edits still survive a server restart.
 *
 * The seed in db.js (`memoryDb.site_content`) supplies defaults for any field that
 * has never been saved, so new fields added to the seed show up automatically.
 */

// Folder for saved data; override with RENATURE_DATA_DIR (e.g. to run a test server on a copy).
const DATA_DIR = process.env.RENATURE_DATA_DIR || path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'site-content.json');
const SECTIONS = ['about', 'contact', 'home'];

let tableReady = false;
let fileCache = null;

// Seed defaults, captured once before anything is saved over them.
const DEFAULTS = JSON.parse(JSON.stringify(pool.memoryDb.site_content || {}));

function withDefaults(saved = {}) {
  const merged = { ...DEFAULTS, ...saved };
  for (const key of SECTIONS) {
    merged[key] = { ...(DEFAULTS[key] || {}), ...(saved[key] || {}) };
  }
  return merged;
}

async function ensureTable() {
  if (tableReady) return;
  await pool.pgQuery(`
    CREATE TABLE IF NOT EXISTS site_content (
      id         INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      content    JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  tableReady = true;
}

function readFile() {
  if (fileCache) return fileCache;
  try {
    fileCache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn('[site-content] Could not read saved content file:', err.message);
    fileCache = {};
  }
  return fileCache;
}

function writeFile(content) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  // Write to a temp file then rename, so a crash mid-write can't corrupt the saved content.
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(content, null, 2));
  fs.renameSync(tmp, DATA_FILE);
  fileCache = content;
}

async function getContent() {
  if (pool.hasPostgres()) {
    try {
      await ensureTable();
      const { rows } = await pool.pgQuery('SELECT content FROM site_content WHERE id = 1');
      return withDefaults(rows[0] ? rows[0].content : {});
    } catch (err) {
      console.warn('[site-content] PostgreSQL read failed, using saved file:', err.message);
    }
  }
  return withDefaults(readFile());
}

// Applies an update from the admin page (each section is merged field-by-field,
// arrays such as team_members/benefits are replaced) and persists the result.
async function updateContent(update = {}) {
  const current = await getContent();
  const next = { ...current, ...update };
  for (const key of SECTIONS) {
    next[key] = { ...(current[key] || {}), ...(update[key] || {}) };
  }

  let saved = false;
  if (pool.hasPostgres()) {
    try {
      await ensureTable();
      await pool.pgQuery(
        `INSERT INTO site_content (id, content, updated_at) VALUES (1, $1, NOW())
         ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
        [JSON.stringify(next)]
      );
      saved = true;
    } catch (err) {
      console.warn('[site-content] PostgreSQL write failed, saving to file instead:', err.message);
    }
  }
  if (!saved) writeFile(next);

  // Keep the in-memory copy in step for any code that still reads it directly.
  pool.memoryDb.site_content = next;
  return next;
}

module.exports = { getContent, updateContent };
