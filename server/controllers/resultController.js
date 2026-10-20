const pool = require('../db');

exports.addResult = async (req, res) => {
  try {
    const { registration_id, event_id, marks, points, rank, remarks } = req.body;
    
    const query = `
      INSERT INTO event_results (event_id, registration_id, marks, points, rank, remarks, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (event_id, registration_id)
      DO UPDATE SET 
        marks = COALESCE($3, event_results.marks),
        points = COALESCE($4, event_results.points),
        rank = COALESCE($5, event_results.rank),
        remarks = COALESCE($6, event_results.remarks)
      RETURNING *, marks::float AS marks, points::float AS points
    `;
    
    const result = await pool.query(query, [event_id, registration_id, marks, points, rank, remarks]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding result:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, points, rank, remarks } = req.body;
    
    const query = `
      UPDATE event_results 
      SET 
        marks = COALESCE($1, marks),
        points = COALESCE($2, points),
        rank = COALESCE($3, rank),
        remarks = COALESCE($4, remarks)
      WHERE id = $5
      RETURNING *, marks::float AS marks, points::float AS points
    `;
    
    const result = await pool.query(query, [marks, points, rank, remarks, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating result:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getEventResults = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const query = `
      SELECT r.*, r.marks::float AS marks, r.points::float AS points, er.full_name, er.student_id, er.email, er.department 
      FROM event_results r
      JOIN event_registrations er ON r.registration_id = er.id
      WHERE r.event_id = $1
      ORDER BY r.rank ASC NULLS LAST, r.marks DESC NULLS LAST
    `;
    
    const result = await pool.query(query, [eventId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
