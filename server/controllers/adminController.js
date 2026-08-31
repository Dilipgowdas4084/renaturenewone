const pool = require('../db');

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
    
    const [
      totalEvents, upcomingEvents, totalRegistrations, 
      acceptedParticipants, pendingParticipants, rejectedParticipants, 
      totalPresent, totalPointsAwarded
    ] = await Promise.all([
      totalEventsQuery, upcomingEventsQuery, totalRegistrationsQuery,
      acceptedParticipantsQuery, pendingParticipantsQuery, rejectedParticipantsQuery,
      totalPresentQuery, totalPointsAwardedQuery
    ]);
    
    res.json({
      total_events: parseInt(totalEvents.rows[0].count),
      upcoming_events: parseInt(upcomingEvents.rows[0].count),
      total_registrations: parseInt(totalRegistrations.rows[0].count),
      accepted_participants: parseInt(acceptedParticipants.rows[0].count),
      pending_participants: parseInt(pendingParticipants.rows[0].count),
      rejected_participants: parseInt(rejectedParticipants.rows[0].count),
      total_present: parseInt(totalPresent.rows[0].count),
      total_points_awarded: parseInt(totalPointsAwarded.rows[0].sum || 0)
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
