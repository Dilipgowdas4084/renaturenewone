const pool = require('../db');

exports.markAttendance = async (req, res) => {
  try {
    const { registration_id, event_id, status } = req.body;
    const marked_by = req.user.id;
    
    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const query = `
      INSERT INTO attendance (event_id, registration_id, status, marked_by, marked_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (event_id, registration_id)
      DO UPDATE SET status = $3, marked_by = $4, marked_at = NOW()
      RETURNING *
    `;
    
    const result = await pool.query(query, [event_id, registration_id, status, marked_by]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const marked_by = req.user.id;
    
    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const query = `
      UPDATE attendance 
      SET status = $1, marked_by = $2, marked_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, marked_by, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getEventAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const query = `
      SELECT a.*, er.full_name, er.student_id, er.email, er.department 
      FROM attendance a
      JOIN event_registrations er ON a.registration_id = er.id
      WHERE a.event_id = $1
      ORDER BY a.marked_at DESC
    `;
    
    const result = await pool.query(query, [eventId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting attendance:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
