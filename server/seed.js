const bcrypt = require('./node_modules/bcryptjs');
const { Pool } = require('./node_modules/pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_VrLB7MOgKj2F@ep-snowy-bird-b3j0a2y0-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const [adminHash, memberHash] = await Promise.all([
    bcrypt.hash('Admin@1234', 10),
    bcrypt.hash('Member@1234', 10)
  ]);

  await pool.query(`
    INSERT INTO users (name, email, usn, phone, password_hash, role) VALUES
      ('Admin User', 'admin@renature.com', 'ADMIN001', '9999999999', $1, 'admin'),
      ('Demo Member', 'member@renature.com', 'MEMBER001', '8888888888', $2, 'member')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
  `, [adminHash, memberHash]);

  console.log('✅ Admin seeded:  admin@renature.com  / Admin@1234');
  console.log('✅ Member seeded: member@renature.com / Member@1234');
  await pool.end();
}

seed().catch(e => { console.error(e.message); pool.end(); });
