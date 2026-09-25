const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.getStats = async (req, res) => {
  try {
    const totalEventsQuery = pool.query("SELECT COUNT(*) FROM events");
    const upcomingEventsQuery = pool.query("SELECT COUNT(*) FROM events WHERE event_date > CURRENT_DATE");
    const totalRegistrationsQuery = pool.query("SELECT COUNT(*) FROM event_registrations");
    const acceptedParticipantsQuery = pool.query("SELECT COUNT(*) FROM event_registrations WHERE status = 'accepted'");
    const pendingParticipantsQuery = pool.query("SELECT COUNT(*) FROM event_registrations WHERE status = 'pending'");
    const rejectedParticipantsQuery = pool.query("SELECT COUNT(*) FROM event_registrations WHERE status = 'rejected'");
    const totalPresentQuery = pool.query("SELECT COUNT(*) FROM attendance WHERE status = 'present'");
    const totalPointsAwardedQuery = pool.query("SELECT SUM(points) FROM event_results");
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
      total_points_awarded: parseInt(totalPointsAwarded.rows[0].sum || 0),
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

exports.getMembers = async (req, res) => {
  try {
    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      const membersMap = new Map();

      for (const u of memoryDb.users) {
        membersMap.set(u.email || u.usn, {
          id: u.id,
          full_name: u.name,
          email: u.email,
          student_id: u.usn || '',
          department: u.department || 'Environmental Sciences',
          role: u.role,
          total_points: 0,
          events_count: 0
        });
      }

      for (const er of memoryDb.event_registrations) {
        const key = er.email || er.student_id || er.full_name;
        if (!membersMap.has(key)) {
          membersMap.set(key, {
            id: er.id,
            full_name: er.full_name,
            email: er.email,
            student_id: er.student_id || '',
            department: er.department || 'General',
            role: 'member',
            total_points: 0,
            events_count: 0
          });
        }
      }

      for (const r of memoryDb.event_results) {
        const reg = memoryDb.event_registrations.find(x => x.id === r.registration_id);
        if (reg) {
          const key = reg.email || reg.student_id || reg.full_name;
          if (membersMap.has(key)) {
            const m = membersMap.get(key);
            m.total_points += (parseFloat(r.points) || 0);
            m.events_count += 1;
          }
        }
      }

      return res.json(Array.from(membersMap.values()));
    }
    res.json([]);
  } catch (err) {
    console.error('Error getting members:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.awardPoints = async (req, res) => {
  try {
    const { student_id, email, full_name, department, points, event_id, reason } = req.body;
    const pts = parseFloat(points);
    if (isNaN(pts)) {
      return res.status(400).json({ error: 'Valid points amount is required' });
    }

    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      let reg = memoryDb.event_registrations.find(
        r => (student_id && r.student_id === student_id) || (email && r.email && r.email.toLowerCase() === email.toLowerCase())
      );

      const targetEventId = parseInt(event_id, 10) || 1;

      if (!reg) {
        reg = {
          id: pool.nextId.event_registrations++,
          event_id: targetEventId,
          reference_id: `RN-BONUS-${Date.now().toString().slice(-4)}`,
          full_name: full_name || 'Volunteer Steward',
          student_id: student_id || `1RN23${Math.floor(1000 + Math.random()*9000)}`,
          email: email || '',
          phone: '',
          department: department || 'General',
          year: '2026',
          status: 'accepted',
          registered_at: new Date(),
          accepted_at: new Date(),
          accepted_by: 1
        };
        memoryDb.event_registrations.push(reg);
      }

      const newRes = {
        id: pool.nextId.event_results++,
        event_id: targetEventId,
        registration_id: reg.id,
        marks: 100,
        points: pts,
        rank: 1,
        remarks: reason || 'Direct Admin Award',
        created_at: new Date()
      };
      memoryDb.event_results.push(newRes);

      return res.json({
        success: true,
        message: `Awarded ${pts} points successfully to ${reg.full_name}`,
        points_awarded: pts
      });
    }

    res.json({ success: true, message: 'Points awarded' });
  } catch (err) {
    console.error('Error awarding points:', err);
    res.status(500).json({ error: 'Server error awarding points' });
  }
};

exports.updateLeaderboardEntry = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { total_points, full_name, department } = req.body;
    const pts = parseFloat(total_points);

    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      const regs = memoryDb.event_registrations.filter(r => r.student_id === studentId || r.email === studentId);
      if (regs.length > 0) {
        if (full_name) regs.forEach(r => r.full_name = full_name);
        if (department) regs.forEach(r => r.department = department);

        const regIds = new Set(regs.map(r => r.id));
        memoryDb.event_results = memoryDb.event_results.filter(r => !regIds.has(r.registration_id));
        memoryDb.event_results.push({
          id: pool.nextId.event_results++,
          event_id: 1,
          registration_id: regs[0].id,
          marks: 100,
          points: isNaN(pts) ? 0 : pts,
          rank: 1,
          remarks: 'Adjusted by Admin',
          created_at: new Date()
        });
      } else {
        const newReg = {
          id: pool.nextId.event_registrations++,
          event_id: 1,
          reference_id: `RN-LB-${Date.now().toString().slice(-4)}`,
          full_name: full_name || 'Volunteer',
          student_id: studentId,
          email: '',
          phone: '',
          department: department || 'Environmental Sciences',
          year: '2026',
          status: 'accepted',
          registered_at: new Date(),
          accepted_at: new Date(),
          accepted_by: 1
        };
        memoryDb.event_registrations.push(newReg);
        memoryDb.event_results.push({
          id: pool.nextId.event_results++,
          event_id: 1,
          registration_id: newReg.id,
          marks: 100,
          points: isNaN(pts) ? 0 : pts,
          rank: 1,
          remarks: 'Created by Admin',
          created_at: new Date()
        });
      }
      return res.json({ success: true, message: 'Leaderboard score updated' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating leaderboard:', err);
    res.status(500).json({ error: 'Server error updating leaderboard' });
  }
};

exports.addLeaderboardEntry = async (req, res) => {
  try {
    const { full_name, student_id, department, total_points } = req.body;
    const pts = parseFloat(total_points) || 0;
    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      const reg = {
        id: pool.nextId.event_registrations++,
        event_id: 1,
        reference_id: `RN-LB-${Date.now().toString().slice(-4)}`,
        full_name: full_name || 'Volunteer Steward',
        student_id: student_id || `1RN24EC${Math.floor(100 + Math.random()*900)}`,
        email: req.body.email || '',
        phone: '',
        department: department || 'Biotechnology',
        year: '3rd Year',
        status: 'accepted',
        registered_at: new Date(),
        accepted_at: new Date(),
        accepted_by: 1
      };
      memoryDb.event_registrations.push(reg);
      memoryDb.event_results.push({
        id: pool.nextId.event_results++,
        event_id: 1,
        registration_id: reg.id,
        marks: 100,
        points: pts,
        rank: 1,
        remarks: 'Admin added entry',
        created_at: new Date()
      });
      return res.status(201).json({ success: true, entry: reg });
    }
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error adding leaderboard entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteLeaderboardEntry = async (req, res) => {
  try {
    const { studentId } = req.params;
    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      const regs = memoryDb.event_registrations.filter(r => r.student_id === studentId || r.email === studentId);
      const regIds = new Set(regs.map(r => r.id));
      memoryDb.event_results = memoryDb.event_results.filter(r => !regIds.has(r.registration_id));
      return res.json({ success: true, message: 'Points cleared for student' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting leaderboard entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSiteContent = async (req, res) => {
  try {
    const memoryDb = pool.memoryDb;
    if (memoryDb && memoryDb.site_content) {
      return res.json(memoryDb.site_content);
    }
    res.json({});
  } catch (err) {
    console.error('Error getting site content:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSiteContent = async (req, res) => {
  try {
    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      memoryDb.site_content = {
        ...memoryDb.site_content,
        ...req.body,
        about: {
          ...(memoryDb.site_content ? memoryDb.site_content.about : {}),
          ...(req.body.about || {})
        },
        contact: {
          ...(memoryDb.site_content ? memoryDb.site_content.contact : {}),
          ...(req.body.contact || {})
        },
        home: {
          ...(memoryDb.site_content ? memoryDb.site_content.home : {}),
          ...(req.body.home || {})
        }
      };
      return res.json({ success: true, content: memoryDb.site_content });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating site content:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── User & Member Directory Operations ──────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      const usersList = memoryDb.users.map(u => {
        const userEmail = (u.email || '').toLowerCase().trim();
        const userUsn = (u.usn || '').toLowerCase().trim();
        const regs = memoryDb.event_registrations.filter(r => {
          const rEmail = (r.email || '').toLowerCase().trim();
          const rUsn = (r.student_id || '').toLowerCase().trim();
          return (userEmail && rEmail === userEmail) || (userUsn && rUsn === userUsn);
        });

        const regIds = new Set(regs.map(r => r.id));
        const userResults = memoryDb.event_results.filter(r => regIds.has(r.registration_id));
        const totalPoints = userResults.reduce((sum, r) => sum + (parseFloat(r.points) || 0), 0);

        const enrichedRegs = regs.map(r => {
          const ev = memoryDb.events.find(e => e.id === r.event_id);
          return {
            ...r,
            event_title: ev ? ev.title : 'Campus Environmental Drive',
            event_date: ev ? ev.event_date : null
          };
        });

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          usn: u.usn || '',
          phone: u.phone || '',
          department: u.department || 'Computer Science',
          year: u.year || '1st Year',
          role: u.role || 'member',
          created_at: u.created_at || new Date(),
          total_points: totalPoints,
          events_count: regs.length,
          registrations: enrichedRegs
        };
      });

      return res.json(usersList);
    }
    res.json([]);
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
    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = memoryDb.users.find(u => (u.email || '').toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const passHash = await bcrypt.hash(password || 'Member@123', 10);
      const newUser = {
        id: pool.nextId.users++,
        name,
        email: cleanEmail,
        usn: usn ? usn.trim().toUpperCase() : '',
        phone: phone || '',
        password_hash: passHash,
        role: role || 'member',
        department: department || 'Computer Science',
        year: year || '1st Year',
        created_at: new Date()
      };
      memoryDb.users.unshift(newUser);

      return res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          usn: newUser.usn,
          phone: newUser.phone,
          department: newUser.department,
          year: newUser.year,
          role: newUser.role,
          total_points: 0,
          events_count: 0,
          registrations: []
        }
      });
    }
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ error: 'Server error creating user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, usn, phone, role, department, year } = req.body;

    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      const user = memoryDb.users.find(u => u.id === id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email.toLowerCase().trim();
      if (usn !== undefined) user.usn = usn.trim().toUpperCase();
      if (phone !== undefined) user.phone = phone;
      if (role !== undefined) user.role = role;
      if (department !== undefined) user.department = department;
      if (year !== undefined) user.year = year;

      const userEmail = (user.email || '').toLowerCase().trim();
      const userUsn = (user.usn || '').toLowerCase().trim();
      memoryDb.event_registrations.forEach(r => {
        const rEmail = (r.email || '').toLowerCase().trim();
        const rUsn = (r.student_id || '').toLowerCase().trim();
        if ((userEmail && rEmail === userEmail) || (userUsn && rUsn === userUsn)) {
          if (name) r.full_name = name;
          if (usn) r.student_id = usn;
          if (department) r.department = department;
          if (year) r.year = year;
        }
      });

      return res.json({ success: true, user });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ error: 'Server error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      const idx = memoryDb.users.findIndex(u => u.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'User not found' });
      }
      memoryDb.users.splice(idx, 1);
      return res.json({ success: true, message: 'User removed successfully' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ error: 'Server error deleting user' });
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

    const memoryDb = pool.memoryDb;
    if (memoryDb) {
      const user = memoryDb.users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userEmail = (user.email || '').toLowerCase().trim();
      const userUsn = (user.usn || '').toLowerCase().trim();

      let reg = memoryDb.event_registrations.find(r => {
        const rEmail = (r.email || '').toLowerCase().trim();
        const rUsn = (r.student_id || '').toLowerCase().trim();
        return (userEmail && rEmail === userEmail) || (userUsn && rUsn === userUsn);
      });

      if (!reg) {
        reg = {
          id: pool.nextId.event_registrations++,
          event_id: 1,
          reference_id: `RN-USR-${Date.now().toString().slice(-4)}`,
          full_name: user.name,
          student_id: user.usn || `RN${userId}`,
          email: user.email,
          phone: user.phone || '',
          department: user.department || 'Computer Science',
          year: user.year || '1st Year',
          status: 'accepted',
          registered_at: new Date(),
          accepted_at: new Date(),
          accepted_by: 1
        };
        memoryDb.event_registrations.push(reg);
      }

      const regIds = new Set(
        memoryDb.event_registrations
          .filter(r => (userEmail && (r.email || '').toLowerCase().trim() === userEmail) || (userUsn && (r.student_id || '').toLowerCase().trim() === userUsn))
          .map(r => r.id)
      );
      memoryDb.event_results = memoryDb.event_results.filter(r => !regIds.has(r.registration_id));

      memoryDb.event_results.push({
        id: pool.nextId.event_results++,
        event_id: 1,
        registration_id: reg.id,
        marks: 100,
        points: pts,
        rank: 1,
        remarks: reason || 'Direct Admin Point Adjustment',
        created_at: new Date()
      });

      return res.json({ success: true, message: `Points updated to ${pts} for ${user.name}`, total_points: pts });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('setUserPoints error:', err);
    res.status(500).json({ error: 'Server error setting points' });
  }
};
