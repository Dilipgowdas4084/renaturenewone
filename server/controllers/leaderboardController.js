const participation = require('../utils/participation');

// Public leaderboard: points from attended events plus admin awards, per member.
// Emails stay private — this endpoint is open to visitors who aren't logged in.
exports.getLeaderboard = async (req, res) => {
  try {
    const { department, year } = req.query;
    const standings = participation.computeStandings(await participation.loadTables(), { department, year });
    res.json(standings.map(({ email, user_id, role, ...row }) => row));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
