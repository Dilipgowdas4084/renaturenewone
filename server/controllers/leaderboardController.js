const pool = require('../db');

exports.getLeaderboard = async (req, res) => {
  try {
    const { department, year } = req.query;
    
    let query = `
      SELECT 
        er.full_name, 
        er.department, 
        er.student_id, 
        SUM(r.points) as total_points, 
        COUNT(DISTINCT r.event_id) as events_count,
        RANK() OVER (ORDER BY SUM(r.points) DESC) as rank
      FROM event_results r 
      JOIN event_registrations er ON r.registration_id = er.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (department) {
      params.push(department);
      conditions.push(`er.department = $${params.length}`);
    }
    
    if (year) {
      params.push(year);
      conditions.push(`er.year = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    
    query += `
      GROUP BY er.full_name, er.department, er.student_id 
      ORDER BY total_points DESC
    `;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
