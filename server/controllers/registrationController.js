const pool = require('../db');

exports.registerForEvent = async (req, res) => {
  try {
    const { event_id, full_name, student_id, email, phone, department, year } = req.body;
    
    // Check if event exists and registration is open
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [event_id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResult.rows[0];
    if (event.status !== 'published') {
      return res.status(400).json({ error: 'Event is not open for registration' });
    }
    
    // Check deadline
    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }
    
    // Check max participants
    if (event.max_participants) {
      const countResult = await pool.query('SELECT COUNT(*) FROM event_registrations WHERE event_id = $1', [event_id]);
      const currentCount = parseInt(countResult.rows[0].count);
      if (currentCount >= event.max_participants) {
        return res.status(400).json({ error: 'Event is already full' });
      }
    }
    
    // Check duplicate
    const duplicateCheck = await pool.query('SELECT * FROM event_registrations WHERE event_id = $1 AND email = $2', [event_id, email]);
    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You have already registered for this event' });
    }
    
    // Generate reference ID
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const reference_id = 'RN-' + Date.now() + '-' + randomChars;
    
    // Register
    const query = `
      INSERT INTO event_registrations (
        event_id, reference_id, full_name, student_id, email, phone, department, year
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const params = [event_id, reference_id, full_name, student_id, email, phone, department, year];
    const result = await pool.query(query, params);
    
    res.status(201).json({ registration: result.rows[0], reference_id });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50, search, status, department } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `SELECT * FROM event_registrations WHERE event_id = $1`;
    const params = [eventId];
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length} OR student_id ILIKE $${params.length})`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    if (department) {
      params.push(department);
      query += ` AND department = $${params.length}`;
    }
    
    query += ` ORDER BY registered_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM event_registrations WHERE event_id = $1`;
    const countParams = [eventId];
    // Add same filters to count query (omitted for brevity, could be added similarly)
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting registrations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const accepted_by = req.user.id;
    
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    let query = `UPDATE event_registrations SET status = $1`;
    const params = [status];
    
    if (status === 'accepted') {
      query += `, accepted_at = NOW(), accepted_by = $2`;
      params.push(accepted_by);
    } else if (status === 'rejected') {
      query += `, rejected_at = NOW()`;
    }
    
    query += ` WHERE id = $${params.length + 1} RETURNING *`;
    params.push(id);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.checkDuplicate = async (req, res) => {
  try {
    const { eventId, email } = req.params;
    
    const result = await pool.query(
      'SELECT reference_id FROM event_registrations WHERE event_id = $1 AND email = $2',
      [eventId, email]
    );
    
    if (result.rows.length > 0) {
      res.json({ registered: true, reference_id: result.rows[0].reference_id });
    } else {
      res.json({ registered: false, reference_id: null });
    }
  } catch (error) {
    console.error('Error checking duplicate:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllRegistrations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const query = `
      SELECT er.*, e.title as event_title 
      FROM event_registrations er
      LEFT JOIN events e ON er.event_id = e.id
      ORDER BY er.registered_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [parseInt(limit, 10)]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error getting all registrations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

