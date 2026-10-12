// Seeds demo admin and member accounts into the PostgreSQL database in DATABASE_URL.
// Usage: npm run seed   (passwords can be overridden with SEED_ADMIN_PASSWORD / SEED_MEMBER_PASSWORD)
require('./utils/loadEnv');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env (see .env.example) and try again.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';
const MEMBER_PASSWORD = process.env.SEED_MEMBER_PASSWORD || 'Member@1234';

async function seed() {
  const [adminHash, memberHash] = await Promise.all([
    bcrypt.hash(ADMIN_PASSWORD, 10),
    bcrypt.hash(MEMBER_PASSWORD, 10)
  ]);

  await pool.query(`
    INSERT INTO users (name, email, usn, phone, password_hash, role) VALUES
      ('Admin User', 'admin@renature.com', 'ADMIN001', '9999999999', $1, 'admin'),
      ('Demo Member', 'member@renature.com', 'MEMBER001', '8888888888', $2, 'member')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
  `, [adminHash, memberHash]);

  console.log('Seeded admin@renature.com and member@renature.com');
  await pool.end();
}

seed().catch(e => { console.error(e.message); pool.end(); });
