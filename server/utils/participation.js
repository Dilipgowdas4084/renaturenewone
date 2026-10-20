const pool = require('../db');

/*
 * One place that works out who has how many points, for both storage modes
 * (PostgreSQL, or the built-in in-memory store when no database is configured).
 *
 * Points come from two sources:
 *   - event_results: one row per registration, written automatically when an
 *     admin marks the participant Present (worth the event's points_available),
 *     removed again when they're marked Absent or their registration is rejected.
 *   - point_adjustments: bonus awards / corrections an admin makes on the
 *     Points & Leaderboard or Users pages, not tied to an event.
 *
 * A person is identified by email (falling back to USN), so a member's account
 * and the registrations they filled in line up even though registrations
 * aren't linked to an account id.
 */

let adjustmentsReady = null;
function ensureAdjustmentsTable() {
  if (!pool.hasPostgres()) {
    if (!Array.isArray(pool.memoryDb.point_adjustments)) pool.memoryDb.point_adjustments = [];
    return Promise.resolve();
  }
  if (!adjustmentsReady) {
    adjustmentsReady = pool.pgQuery(`
      CREATE TABLE IF NOT EXISTS point_adjustments (
        id          SERIAL PRIMARY KEY,
        email       VARCHAR(255),
        student_id  VARCHAR(100),
        full_name   VARCHAR(255),
        department  VARCHAR(100),
        points      DECIMAL(10,2) NOT NULL,
        reason      TEXT,
        created_by  INT,
        created_at  TIMESTAMP DEFAULT NOW()
      )
    `).catch((err) => { adjustmentsReady = null; throw err; });
  }
  return adjustmentsReady;
}

const normEmail = (v) => String(v || '').toLowerCase().trim();
const normUsn = (v) => String(v || '').toUpperCase().trim();

// Raw rows from every table the standings need.
async function loadTables() {
  await ensureAdjustmentsTable();
  if (pool.hasPostgres()) {
    const q = (sql) => pool.pgQuery(sql).then((r) => r.rows);
    const [users, events, registrations, attendance, results, adjustments] = await Promise.all([
      q('SELECT id, name, email, usn, phone, role, department, year, created_at FROM users ORDER BY created_at DESC, id DESC'),
      q('SELECT id, title, event_date, status, points_available FROM events'),
      q('SELECT * FROM event_registrations ORDER BY registered_at DESC'),
      q('SELECT id, event_id, registration_id, status FROM attendance'),
      q('SELECT id, event_id, registration_id, marks::float AS marks, points::float AS points, rank, remarks FROM event_results'),
      q('SELECT id, email, student_id, full_name, department, points::float AS points, reason, created_at FROM point_adjustments'),
    ]);
    return { users, events, registrations, attendance, results, adjustments };
  }
  const db = pool.memoryDb;
  return {
    users: db.users,
    events: db.events,
    registrations: db.event_registrations,
    attendance: db.attendance,
    results: db.event_results,
    adjustments: db.point_adjustments,
  };
}

/*
 * Per-person totals, ranked. Options:
 *   includeAdmins       – keep admin accounts in the list (admin pages)
 *   includeRegistrants  – list everyone who has registered, even with 0 points
 *   department / year   – filters (public leaderboard)
 */
function computeStandings(tables, options = {}) {
  const { includeAdmins = false, includeRegistrants = false, department, year } = options;
  const people = new Map();
  const byEmail = new Map();
  const byUsn = new Map();

  const keyFor = (email, usn) => {
    const e = normEmail(email);
    const u = normUsn(usn);
    if (e && byEmail.has(e)) return byEmail.get(e);
    if (u && byUsn.has(u)) return byUsn.get(u);
    return null;
  };
  const add = (key, person) => {
    person.key = key;
    people.set(key, person);
    if (person.email) byEmail.set(normEmail(person.email), key);
    if (person.student_id) byUsn.set(normUsn(person.student_id), key);
    return person;
  };
  const getOrCreate = (email, usn, name, extra = {}) => {
    const existing = keyFor(email, usn);
    if (existing) return people.get(existing);
    const key = normEmail(email) || (normUsn(usn) && `usn:${normUsn(usn)}`) || `name:${String(name || '').toLowerCase().trim()}`;
    if (people.has(key)) return people.get(key);
    return add(key, {
      user_id: null,
      full_name: name || 'Member',
      email: email || '',
      student_id: usn || '',
      department: extra.department || '',
      year: extra.year || '',
      role: 'member',
      total_points: 0,
      eventIds: new Set(),
      listed: false,
    });
  };

  for (const u of tables.users) {
    if (!includeAdmins && u.role === 'admin') continue;
    const person = getOrCreate(u.email, u.usn, u.name, u);
    Object.assign(person, {
      user_id: u.id,
      full_name: u.name || person.full_name,
      email: u.email || person.email,
      student_id: u.usn || person.student_id,
      department: u.department || person.department,
      year: u.year || person.year,
      role: u.role || 'member',
      listed: true,
    });
    if (u.email) byEmail.set(normEmail(u.email), person.key);
    if (u.usn) byUsn.set(normUsn(u.usn), person.key);
  }

  const adminEmails = new Set(tables.users.filter((u) => u.role === 'admin').map((u) => normEmail(u.email)));
  const isHiddenAdmin = (email) => !includeAdmins && adminEmails.has(normEmail(email));

  const regPerson = new Map();
  for (const r of tables.registrations) {
    if (isHiddenAdmin(r.email)) continue;
    const person = getOrCreate(r.email, r.student_id, r.full_name, r);
    if (!person.department && r.department) person.department = r.department;
    if (!person.year && r.year) person.year = r.year;
    if (!person.student_id && r.student_id) {
      person.student_id = r.student_id;
      byUsn.set(normUsn(r.student_id), person.key);
    }
    if (includeRegistrants) person.listed = true;
    regPerson.set(r.id, person);
  }

  for (const res of tables.results) {
    const person = regPerson.get(res.registration_id);
    if (!person) continue;
    person.total_points += Number(res.points) || 0;
    person.eventIds.add(res.event_id);
    person.listed = true;
  }

  for (const adj of tables.adjustments) {
    if (isHiddenAdmin(adj.email)) continue;
    const person = getOrCreate(adj.email, adj.student_id, adj.full_name, adj);
    person.total_points += Number(adj.points) || 0;
    person.listed = true;
  }

  let list = Array.from(people.values()).filter((p) => p.listed);
  if (department) list = list.filter((p) => p.department === department);
  if (year) list = list.filter((p) => p.year === year);

  list = list.map((p) => ({
    user_id: p.user_id,
    full_name: p.full_name,
    email: p.email,
    student_id: p.student_id,
    department: p.department || 'General',
    year: p.year,
    role: p.role,
    total_points: Math.round(p.total_points * 100) / 100,
    events_count: p.eventIds.size,
  }));

  list.sort((a, b) => b.total_points - a.total_points || a.full_name.localeCompare(b.full_name));
  // Competition ranking: equal points share a rank (1, 2, 2, 4 …)
  list.forEach((p, i) => {
    p.rank = i > 0 && p.total_points === list[i - 1].total_points ? list[i - 1].rank : i + 1;
  });
  return list;
}

// Find one person's row in a standings list by email or USN.
function findPerson(list, { email, usn }) {
  const e = normEmail(email);
  const u = normUsn(usn);
  return list.find((p) => (e && normEmail(p.email) === e) || (u && normUsn(p.student_id) === u)) || null;
}

/*
 * Attendance → points. Present: the registration earns the event's
 * points_available (marks default to the same value). Absent: those points
 * are taken away again.
 */
async function syncAttendancePoints(registrationId, status) {
  const regId = parseInt(registrationId, 10);
  if (pool.hasPostgres()) {
    if (status !== 'present') {
      await pool.pgQuery('DELETE FROM event_results WHERE registration_id = $1', [regId]);
      return null;
    }
    const ev = await pool.pgQuery(
      `SELECT er.event_id, COALESCE(e.points_available, 0) AS points
         FROM event_registrations er JOIN events e ON e.id = er.event_id
        WHERE er.id = $1`,
      [regId]
    );
    if (!ev.rows[0]) return null;
    const { event_id, points } = ev.rows[0];
    const result = await pool.pgQuery(
      `INSERT INTO event_results (event_id, registration_id, marks, points, created_at)
       VALUES ($1, $2, $3, $3, NOW())
       ON CONFLICT (event_id, registration_id)
       DO UPDATE SET points = EXCLUDED.points, marks = EXCLUDED.marks
       RETURNING id, event_id, registration_id, marks::float AS marks, points::float AS points, rank, remarks`,
      [event_id, regId, Number(points) || 0]
    );
    return result.rows[0];
  }

  const db = pool.memoryDb;
  if (status !== 'present') {
    db.event_results = db.event_results.filter((r) => r.registration_id !== regId);
    return null;
  }
  const reg = db.event_registrations.find((r) => r.id === regId);
  const event = reg && db.events.find((e) => e.id === reg.event_id);
  if (!event) return null;
  const points = Number(event.points_available) || 0;
  let row = db.event_results.find((r) => r.registration_id === regId);
  if (row) {
    row.points = points;
    row.marks = points;
  } else {
    row = {
      id: pool.nextId.event_results++,
      event_id: event.id,
      registration_id: regId,
      marks: points,
      points,
      rank: null,
      remarks: '',
      created_at: new Date(),
    };
    db.event_results.push(row);
  }
  return row;
}

// A registration that is no longer accepted keeps no attendance or points.
async function clearParticipation(registrationId) {
  const regId = parseInt(registrationId, 10);
  if (pool.hasPostgres()) {
    await pool.pgQuery('DELETE FROM event_results WHERE registration_id = $1', [regId]);
    await pool.pgQuery('DELETE FROM attendance WHERE registration_id = $1', [regId]);
    return;
  }
  const db = pool.memoryDb;
  db.event_results = db.event_results.filter((r) => r.registration_id !== regId);
  db.attendance = db.attendance.filter((a) => a.registration_id !== regId);
}

// Record a bonus award / correction (can be negative).
async function addAdjustment({ email, student_id, full_name, department, points, reason, created_by }) {
  await ensureAdjustmentsTable();
  const row = {
    email: normEmail(email) || null,
    student_id: normUsn(student_id) || null,
    full_name: full_name || null,
    department: department || null,
    points: Number(points) || 0,
    reason: reason || null,
    created_by: created_by || null,
  };
  if (pool.hasPostgres()) {
    const result = await pool.pgQuery(
      `INSERT INTO point_adjustments (email, student_id, full_name, department, points, reason, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [row.email, row.student_id, row.full_name, row.department, row.points, row.reason, row.created_by]
    );
    return result.rows[0];
  }
  const db = pool.memoryDb;
  const id = pool.nextId.point_adjustments || 1;
  pool.nextId.point_adjustments = id + 1;
  const saved = { id, ...row, created_at: new Date() };
  db.point_adjustments.push(saved);
  return saved;
}

// Wipe every point a person has (event results and adjustments).
async function clearPoints({ email, usn }) {
  await ensureAdjustmentsTable();
  const e = normEmail(email);
  const u = normUsn(usn);
  if (pool.hasPostgres()) {
    await pool.pgQuery(
      `DELETE FROM event_results WHERE registration_id IN (
         SELECT id FROM event_registrations
          WHERE ($1 <> '' AND LOWER(TRIM(email)) = $1) OR ($2 <> '' AND UPPER(TRIM(student_id)) = $2))`,
      [e, u]
    );
    await pool.pgQuery(
      `DELETE FROM point_adjustments
        WHERE ($1 <> '' AND LOWER(TRIM(email)) = $1) OR ($2 <> '' AND UPPER(TRIM(student_id)) = $2)`,
      [e, u]
    );
    return;
  }
  const db = pool.memoryDb;
  const matches = (em, us) => (e && normEmail(em) === e) || (u && normUsn(us) === u);
  const regIds = new Set(db.event_registrations.filter((r) => matches(r.email, r.student_id)).map((r) => r.id));
  db.event_results = db.event_results.filter((r) => !regIds.has(r.registration_id));
  db.point_adjustments = db.point_adjustments.filter((a) => !matches(a.email, a.student_id));
}

module.exports = {
  ensureAdjustmentsTable,
  loadTables,
  computeStandings,
  findPerson,
  syncAttendancePoints,
  clearParticipation,
  addAdjustment,
  clearPoints,
  normEmail,
  normUsn,
};
