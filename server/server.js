const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('./utils/loadEnv');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const resultRoutes = require('./routes/resultRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const memoryPersistence = require('./utils/memoryPersistence');

// Restore saved app data (users, events, registrations…) when running without PostgreSQL
memoryPersistence.load();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', memoryPersistence.saveAfterWrites);

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/site-content', (req, res) => require('./controllers/adminController').getSiteContent(req, res));
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all API error middleware to prevent server crashes
app.use('/api', (err, req, res, next) => {
  console.error('[API Error caught]:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

process.on('uncaughtException', (err) => {
  console.error('[Server Uncaught Exception]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server Unhandled Rejection]:', reason);
});

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  const distDir = path.resolve(__dirname, '../dist');
  const clientDir = path.resolve(__dirname, '../client');

  if (process.env.NODE_ENV !== 'production' && !fs.existsSync(path.join(distDir, 'index.html'))) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: clientDir,
        server: { middlewareMode: true, hmr: false },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('[AI Studio] Vite dev middleware attached');
    } catch (e) {
      console.warn('Vite middleware initialization warning:', e.message);
    }
  }

  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(distDir, 'index.html'));
      }
      next();
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReNature server running on http://0.0.0.0:${PORT}`);
  });
}

start();
