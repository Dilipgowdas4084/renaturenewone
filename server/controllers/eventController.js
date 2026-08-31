const pool = require('../db');

exports.listEvents = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = `
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = e.id) as registered_count 
      FROM events e 
      WHERE 1=1
    `;
    const params = [];
    
    if (category) {
      params.push(category);
      query += ` AND e.category = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND e.status = $${params.length}`;
    } else {
      query += ` AND e.status = 'published'`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (e.title ILIKE $${params.length} OR e.description ILIKE $${params.length})`;
    }
    
    query += ` ORDER BY e.event_date DESC, e.start_time DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = e.id) as registered_count
      FROM events e 
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = result.rows[0];
    event.available_seats = event.max_participants ? (event.max_participants - event.registered_count) : null;
    
    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {
      title, description, image_url, category, event_date, start_time, end_time,
      venue, registration_deadline, max_participants, status, points_available,
      eligibility, rules, organizer_info
    } = req.body;
    
    const created_by = req.user.id;
    
    const query = `
      INSERT INTO events (
        title, description, image_url, category, event_date, start_time, end_time,
        venue, registration_deadline, max_participants, status, points_available,
        eligibility, rules, organizer_info, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const params = [
      title, description, image_url, category, event_date, start_time, end_time,
      venue, registration_deadline, max_participants, status || 'draft', points_available || 0,
      eligibility, rules, organizer_info, created_by
    ];
    
    const result = await pool.query(query, params);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, image_url, category, event_date, start_time, end_time,
      venue, registration_deadline, max_participants, status, points_available,
      eligibility, rules, organizer_info
    } = req.body;
    
    const query = `
      UPDATE events SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        image_url = COALESCE($3, image_url),
        category = COALESCE($4, category),
        event_date = COALESCE($5, event_date),
        start_time = COALESCE($6, start_time),
        end_time = COALESCE($7, end_time),
        venue = COALESCE($8, venue),
        registration_deadline = COALESCE($9, registration_deadline),
        max_participants = COALESCE($10, max_participants),
        status = COALESCE($11, status),
        points_available = COALESCE($12, points_available),
        eligibility = COALESCE($13, eligibility),
        rules = COALESCE($14, rules),
        organizer_info = COALESCE($15, organizer_info),
        updated_at = NOW()
      WHERE id = $16
      RETURNING *
    `;
    
    const params = [
      title, description, image_url, category, event_date, start_time, end_time,
      venue, registration_deadline, max_participants, status, points_available,
      eligibility, rules, organizer_info, id
    ];
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.duplicateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const created_by = req.user.id;
    
    const query = `
      INSERT INTO events (
        title, description, image_url, category, venue, max_participants, 
        status, points_available, eligibility, rules, organizer_info, created_by
      )
      SELECT 
        title || ' (Copy)', description, image_url, category, venue, max_participants, 
        'draft', points_available, eligibility, rules, organizer_info, $1
      FROM events 
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [created_by, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error duplicating event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const result = await pool.query(
      'UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
