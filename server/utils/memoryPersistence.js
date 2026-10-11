const fs = require('fs');
const path = require('path');
const pool = require('../db');

/*
 * Keeps the built-in in-memory database across server restarts.
 *
 * When no PostgreSQL is configured, all app data (users, events, registrations,
 * attendance, results, resources) lives in `pool.memoryDb`, which used to be
 * wiped on every restart. This snapshots it to server/data/memory-db.json after
 * each request that changes data, and loads it back on startup.
 *
 * Website content has its own store (siteContentStore.js) and is not included here.
 * With PostgreSQL configured this module does nothing — the real database persists.
 */

// Folder for saved data; override with RENATURE_DATA_DIR (e.g. to run a test server on a copy).
const DATA_DIR = process.env.RENATURE_DATA_DIR || path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'memory-db.json');
const TABLES = ['users', 'events', 'event_registrations', 'attendance', 'event_results', 'resources'];

function load() {
  if (pool.hasPostgres()) return;

  let saved;
  try {
    saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn('[memory-db] Could not read saved data, starting from seed data:', err.message);
    return;
  }

  const { memoryDb, nextId } = pool;
  for (const table of TABLES) {
    if (Array.isArray(saved.tables?.[table])) memoryDb[table] = saved.tables[table];
  }

  // Restore ID counters, never letting one fall behind an existing row's id.
  for (const table of TABLES) {
    const maxId = memoryDb[table].reduce((m, row) => Math.max(m, Number(row.id) || 0), 0);
    nextId[table] = Math.max(Number(saved.nextId?.[table]) || 0, maxId + 1, nextId[table] || 1);
  }

  console.log(`[memory-db] Loaded saved data from ${path.relative(process.cwd(), DATA_FILE)}`);
}

function save() {
  if (pool.hasPostgres()) return;

  const { memoryDb, nextId } = pool;
  const snapshot = {
    savedAt: new Date().toISOString(),
    nextId,
    tables: Object.fromEntries(TABLES.map(t => [t, memoryDb[t]])),
  };

  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    // Write to a temp file then rename, so a crash mid-write can't corrupt the saved data.
    const tmp = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(snapshot, null, 2));
    fs.renameSync(tmp, DATA_FILE);
  } catch (err) {
    console.error('[memory-db] Could not save data:', err.message);
  }
}

// Express middleware: after any API request that can change data, save a snapshot.
function saveAfterWrites(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    res.on('finish', save);
  }
  next();
}

module.exports = { load, save, saveAfterWrites };
