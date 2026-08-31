const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const resultRoutes = require('./routes/resultRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});