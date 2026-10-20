const pool = require('../db');
const bcrypt = require('bcryptjs');
const siteContentStore = require('../utils/siteContentStore');
const participation = require('../utils/participation');

exports.getStats = async (req, res) => {
  try {
    const totalEventsQuery = pool.query("SELECT COUNT(*) FROM events");
    const upcomingEventsQuery = pool.query("SELECT COUNT(*) FROM events WHERE event_date > CURRENT_DATE");
    const totalRegistrationsQuery = pool.query("SELECT COUNT(*) FROM event_registrations");
    const acceptedParticipantsQuery = pool.query("SELECT COUNT(*) FROM event_registrations WHERE status = 'accepted'");
    const pendingParticipantsQuery = pool.query("SELECT COUNT(*) FROM event_registrations WHERE status = 'pending'");
    const rejectedParticipantsQuery = pool.query("SELECT COUNT(*) FROM event_registrations WHERE status = 'rejected'");
    const totalPresentQuery = pool.query("SELECT COUNT(*) FROM attendance WHERE status = 'present'");
    const totalPointsAwardedQuery = participation.loadTables().then((tables) => ({
      rows: [{ sum: participation.computeStandings(tables, { includeAdmins: true }).reduce((sum, p) => sum + p.total_points, 0) }],
    }));
    const totalUsersQuery = pool.query("SELECT COUNT(*) FROM users");
    
    const [
      totalEvents, upcomingEvents, totalRegistrations, 
      acceptedParticipants, pendingParticipants, rejectedParticipants, 
      totalPresent, totalPointsAwarded, totalUsers
    ] = await Promise.all([
      totalEventsQuery, upcomingEventsQuery, totalRegistrationsQuery,
      acceptedParticipantsQuery, pendingParticipantsQuery, rejectedParticipantsQuery,
      totalPresentQuery, totalPointsAwardedQuery, totalUsersQuery
    ]);
    
    res.json({
      total_events: parseInt(totalEvents.rows[0].count),
      upcoming_events: parseInt(upcomingEvents.rows[0].count),
      total_registrations: parseInt(totalRegistrations.rows[0].count),
      accepted_participants: parseInt(acceptedParticipants.rows[0].count),
      pending_participants: parseInt(pendingParticipants.rows[0].count),
      rejected_participants: parseInt(rejectedParticipants.rows[0].count),
      total_present: parseInt(totalPresent.rows[0].count),
      total_points_awarded: Math.round(Number(totalPointsAwarded.rows[0].sum) || 0),
      total_users: parseInt(totalUsers.rows[0].count || 0)
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.exportEventData = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const query = `
      SELECT 
        er.reference_id, er.full_name, er.student_id, er.email, 
        er.phone, er.department, er.year, er.status as registration_status,
        COALESCE(a.status, 'not marked') as attendance_status,
        COALESCE(r.marks, 0) as marks, COALESCE(r.points, 0) as points, 
        r.rank, r.remarks
      FROM event_registrations er
      LEFT JOIN attendance a ON er.id = a.registration_id
      LEFT JOIN event_results r ON er.id = r.registration_id
      WHERE er.event_id = $1
      ORDER BY er.registered_at ASC
    `;
    
    const result = await pool.query(query, [eventId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for this event' });
    }
    
    const fields = Object.keys(result.rows[0]);
    const csvLines = [];
    csvLines.push(fields.join(',')); // Header
    
    for (const row of result.rows) {
      const values = fields.map(field => {
        let value = row[field];
        if (value === null || value === undefined) {
          value = '';
        }
        // Quote strings to handle commas in values
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvLines.push(values.join(','));
    }
    
    const csv = csvLines.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=event-${eventId}-export.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting event data:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Members & Points ─────────────────────────────────────────────────────────
// Points live in event_results (earned by attending) and point_adjustments
// (admin awards / corrections); see utils/participation.js.

const findTarget = (standings, key) => participation.findPerson(standings, {
  email: String(key || '').includes('@') ? key : '',
  usn: String(key || '').includes('@') ? '' : key,
});

exports.getMembers = async (req, res) => {
  try {
    const standings = participation.computeStandings(await participation.loadTables(), {
      includeAdmins: true,
      includeRegistrants: true,
    });
    res.json(standings.map((p) => ({
      id: p.user_id,
      full_name: p.full_name,
      email: p.email,
      student_id: p.student_id,
      department: p.department,
      role: p.role,
      total_points: p.total_points,
      events_count: p.events_count,
      rank: p.rank,
    })));
  } catch (err) {
    console.error('Error getting members:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.awardPoints = async (req, res) => {
  try {
    const { student_id, email, full_name, department, points, reason } = req.body;
    const pts = parseFloat(points);
    if (isNaN(pts)) {
      return res.status(400).json({ error: 'Valid points amount is required' });
    }
    if (!student_id && !email) {
      return res.status(400).json({ error: 'A student ID or email is required' });
    }

    // Fill in the name/department from what we already know about this person.
    const standings = participation.computeStandings(await participation.loadTables(), { includeAdmins: true, includeRegistrants: true });
    const known = participation.findPerson(standings, { email, usn: student_id });
    await participation.addAdjustment({
      email: email || known?.email,
      student_id: student_id || known?.student_id,
      full_name: full_name || known?.full_name,
      department: department || known?.department,
      points: pts,
      reason: reason || 'Direct Admin Award',
      created_by: req.user.id,
    });

    const name = full_name || known?.full_name || student_id || email;
    res.json({ success: true, message: `Awarded ${pts} points successfully to ${name}`, points_awarded: pts });
  } catch (err) {
    console.error('Error awarding points:', err);
    res.status(500).json({ error: `Could not award points: ${err.message}` });
  }
};

// Rename a person on every registration / award they appear on (and their account).
async function renamePerson({ email, usn }, { full_name, department }) {
  if (!full_name && !department) return;
  const e = participation.normEmail(email);
  const u = participation.normUsn(usn);
  if (pool.hasPostgres()) {
    const where = `($3 <> '' AND LOWER(TRIM(email)) = $3) OR ($4 <> '' AND UPPER(TRIM(student_id)) = $4)`;
    const params = [full_name || null, department || null, e, u];
    await pool.pgQuery(`UPDATE event_registrations SET full_name = COALESCE($1, full_name), department = COALESCE($2, department) WHERE ${where}`, params);
    await pool.pgQuery(`UPDATE point_adjustments SET full_name = COALESCE($1, full_name), department = COALESCE($2, department) WHERE ${where}`, params);
    await pool.pgQuery(
      `UPDATE users SET name = COALESCE($1, name), department = COALESCE($2, department)
        WHERE ($3 <> '' AND LOWER(TRIM(email)) = $3) OR ($4 <> '' AND UPPER(TRIM(usn)) = $4)`,
      params
    );
    return;
  }
  const db = pool.memoryDb;
  const matches = (em, us) => (e && participation.normEmail(em) === e) || (u && participation.normUsn(us) === u);
  for (const row of [...db.event_registrations, ...db.point_adjustments]) {
    if (!matches(row.email, row.student_id)) continue;
    if (full_name) row.full_name = full_name;
    if (department) row.department = department;
  }
  for (const user of db.users) {
    if (!matches(user.email, user.usn)) continue;
    if (full_name) user.name = full_name;
    if (department) user.department = department;
  }
}

// Set someone's total to an exact value (records the difference as an adjustment).
async function setTotalPoints(person, target, { reason, created_by }) {
  const delta = Math.round((target - (person.total_points || 0)) * 100) / 100;
  if (delta === 0) return;
  await participation.addAdjustment({
    email: person.email,
    student_id: person.student_id,
    full_name: person.full_name,
    department: person.department,
    points: delta,
    reason,
    created_by,
  });
}

exports.updateLeaderboardEntry = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { total_points, full_name, department } = req.body;
    const pts = parseFloat(total_points);

    const standings = participation.computeStandings(await participation.loadTables(), { includeAdmins: true, includeRegistrants: true });
    const person = findTarget(standings, studentId);
    if (!person) {
      return res.status(404).json({ error: 'No member found with that student ID' });
    }

    await renamePerson({ email: person.email, usn: person.student_id }, { full_name, department });
    if (!isNaN(pts)) {
      await setTotalPoints(person, pts, { reason: 'Adjusted by Admin', created_by: req.user.id });
    }
    res.json({ success: true, message: 'Leaderboard score updated' });
  } catch (err) {
    console.error('Error updating leaderboard:', err);
    res.status(500).json({ error: `Could not update leaderboard: ${err.message}` });
  }
};

exports.addLeaderboardEntry = async (req, res) => {
  try {
    const { full_name, student_id, department, total_points, email } = req.body;
    if (!full_name || (!student_id && !email)) {
      return res.status(400).json({ error: 'Full name and student ID are required' });
    }
    const pts = parseFloat(total_points) || 0;
    await participation.addAdjustment({
      email,
      student_id,
      full_name,
      department,
      points: pts,
      reason: 'Added to leaderboard by Admin',
      created_by: req.user.id,
    });
    res.status(201).json({ success: true, entry: { full_name, student_id, department, total_points: pts } });
  } catch (err) {
    console.error('Error adding leaderboard entry:', err);
    res.status(500).json({ error: `Could not add leaderboard entry: ${err.message}` });
  }
};

exports.deleteLeaderboardEntry = async (req, res) => {
  try {
    const { studentId } = req.params;
    const standings = participation.computeStandings(await participation.loadTables(), { includeAdmins: true, includeRegistrants: true });
    const person = findTarget(standings, studentId);
    await participation.clearPoints({
      email: person?.email || (studentId.includes('@') ? studentId : ''),
      usn: person?.student_id || (studentId.includes('@') ? '' : studentId),
    });
    res.json({ success: true, message: 'Points cleared for student' });
  } catch (err) {
    console.error('Error deleting leaderboard entry:', err);
    res.status(500).json({ error: `Could not clear points: ${err.message}` });
  }
};

exports.getSiteContent = async (req, res) => {
  try {
    res.json(await siteContentStore.getContent());
  } catch (err) {
    console.error('Error getting site content:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSiteContent = async (req, res) => {
  try {
    const content = await siteContentStore.updateContent(req.body || {});
    res.json({ success: true, content });
  } catch (err) {
    console.error('Error updating site content:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── User & Member Directory Operations ──────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const tables = await participation.loadTables();
    const standings = participation.computeStandings(tables, { includeAdmins: true, includeRegistrants: true });
    const eventsById = new Map(tables.events.map((e) => [e.id, e]));

    const usersList = tables.users.map((u) => {
      const email = participation.normEmail(u.email);
      const usn = participation.normUsn(u.usn);
      const regs = tables.registrations.filter((r) =>
        (email && participation.normEmail(r.email) === email) || (usn && participation.normUsn(r.student_id) === usn));
      const person = participation.findPerson(standings, { email: u.email, usn: u.usn });

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        usn: u.usn || '',
        phone: u.phone || '',
        department: u.department || '',
        year: u.year || '',
        role: u.role || 'member',
        created_at: u.created_at,
        total_points: person ? person.total_points : 0,
        events_count: regs.length,
        registrations: regs.map((r) => {
          const ev = eventsById.get(r.event_id);
          return { ...r, event_title: ev ? ev.title : 'Event removed', event_date: ev ? ev.event_date : null };
        }),
      };
    });

    res.json(usersList);
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, usn, phone, role, department, year, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsn = usn ? usn.trim().toUpperCase() : '';
    const passHash = await bcrypt.hash(password || 'Member@123', 10);

    let newUser;
    if (pool.hasPostgres()) {
      const existing = await pool.pgQuery('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (existing.rows.length) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      const result = await pool.pgQuery(
        `INSERT INTO users (name, email, usn, phone, password_hash, role, department, year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, name, email, usn, phone, role, department, year, created_at`,
        [name, cleanEmail, cleanUsn || null, phone || null, passHash, role || 'member', department || null, year || null]
      );
      newUser = result.rows[0];
    } else {
      const memoryDb = pool.memoryDb;
      if (memoryDb.users.find((u) => (u.email || '').toLowerCase() === cleanEmail)) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      newUser = {
        id: pool.nextId.users++,
        name,
        email: cleanEmail,
        usn: cleanUsn,
        phone: phone || '',
        password_hash: passHash,
        role: role || 'member',
        department: department || 'Computer Science',
        year: year || '1st Year',
        created_at: new Date(),
      };
      memoryDb.users.unshift(newUser);
    }

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        usn: newUser.usn || '',
        phone: newUser.phone || '',
        department: newUser.department || '',
        year: newUser.year || '',
        role: newUser.role,
        total_points: 0,
        events_count: 0,
        registrations: [],
      },
    });
  } catch (err) {
    console.error('createUser error:', err);
    const duplicate = err.code === '23505';
    res.status(duplicate ? 400 : 500).json({
      error: duplicate ? 'Another account already uses that email or USN' : `Could not create user: ${err.message}`,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, usn, phone, role, department, year } = req.body;

    let user;
    let previous;
    if (pool.hasPostgres()) {
      const found = await pool.pgQuery('SELECT email, usn FROM users WHERE id = $1', [id]);
      if (!found.rows.length) return res.status(404).json({ error: 'User not found' });
      previous = found.rows[0];
      const result = await pool.pgQuery(
        `UPDATE users SET
           name = COALESCE($1, name),
           email = COALESCE($2, email),
           usn = CASE WHEN $3::text IS NULL THEN usn ELSE NULLIF($3::text, '') END,
           phone = COALESCE($4, phone),
           role = COALESCE($5, role),
           department = COALESCE($6, department),
           year = COALESCE($7, year)
         WHERE id = $8
         RETURNING id, name, email, usn, phone, role, department, year, created_at`,
        [
          name ?? null,
          email !== undefined ? email.toLowerCase().trim() : null,
          usn !== undefined ? usn.trim().toUpperCase() : null,
          phone ?? null,
          role ?? null,
          department ?? null,
          year ?? null,
          id,
        ]
      );
      user = result.rows[0];
    } else {
      user = pool.memoryDb.users.find((u) => u.id === id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      previous = { email: user.email, usn: user.usn };
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email.toLowerCase().trim();
      if (usn !== undefined) user.usn = usn.trim().toUpperCase();
      if (phone !== undefined) user.phone = phone;
      if (role !== undefined) user.role = role;
      if (department !== undefined) user.department = department;
      if (year !== undefined) user.year = year;
    }

    // Keep the person's existing registrations in step with their account details.
    const e = participation.normEmail(previous.email);
    const u = participation.normUsn(previous.usn);
    if (pool.hasPostgres()) {
      await pool.pgQuery(
        `UPDATE event_registrations SET
           full_name = COALESCE($1, full_name),
           student_id = COALESCE(NULLIF($2, ''), student_id),
           department = COALESCE($3, department),
           year = COALESCE($4, year)
         WHERE ($5 <> '' AND LOWER(TRIM(email)) = $5) OR ($6 <> '' AND UPPER(TRIM(student_id)) = $6)`,
        [name || null, usn ? usn.trim().toUpperCase() : '', department || null, year || null, e, u]
      );
    } else {
      pool.memoryDb.event_registrations.forEach((r) => {
        if ((e && participation.normEmail(r.email) === e) || (u && participation.normUsn(r.student_id) === u)) {
          if (name) r.full_name = name;
          if (usn) r.student_id = usn.trim().toUpperCase();
          if (department) r.department = department;
          if (year) r.year = year;
        }
      });
    }

    const { password_hash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('updateUser error:', err);
    const duplicate = err.code === '23505';
    res.status(duplicate ? 400 : 500).json({
      error: duplicate ? 'Another account already uses that email or USN' : `Could not update user: ${err.message}`,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (req.user && Number(req.user.id) === id) {
      return res.status(400).json({ error: "You can't delete the account you're signed in with" });
    }
    if (pool.hasPostgres()) {
      // Keep the events / attendance this user created or marked; just unlink them.
      await pool.pgQuery('UPDATE events SET created_by = NULL WHERE created_by = $1', [id]);
      await pool.pgQuery('UPDATE attendance SET marked_by = NULL WHERE marked_by = $1', [id]);
      await pool.pgQuery('UPDATE event_registrations SET accepted_by = NULL WHERE accepted_by = $1', [id]);
      const result = await pool.pgQuery('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    } else {
      const idx = pool.memoryDb.users.findIndex((u) => u.id === id);
      if (idx === -1) return res.status(404).json({ error: 'User not found' });
      pool.memoryDb.users.splice(idx, 1);
    }
    res.json({ success: true, message: 'User removed successfully' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ error: `Could not delete user: ${err.message}` });
  }
};

exports.setUserPoints = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { points, reason } = req.body;
    const pts = parseFloat(points);
    if (isNaN(pts)) {
      return res.status(400).json({ error: 'Valid points value required' });
    }

    const tables = await participation.loadTables();
    const user = tables.users.find((u) => Number(u.id) === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const standings = participation.computeStandings(tables, { includeAdmins: true, includeRegistrants: true });
    const person = participation.findPerson(standings, { email: user.email, usn: user.usn }) || {
      email: user.email, student_id: user.usn, full_name: user.name, department: user.department, total_points: 0,
    };
    await setTotalPoints(person, pts, { reason: reason || 'Direct Admin Point Adjustment', created_by: req.user.id });

    res.json({ success: true, message: `Points updated to ${pts} for ${user.name}`, total_points: pts });
  } catch (err) {
    console.error('setUserPoints error:', err);
    res.status(500).json({ error: `Could not set points: ${err.message}` });
  }
};
