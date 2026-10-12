const { Pool } = require('pg');
require('./utils/loadEnv');

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client:', err);
});

pool.hasPostgres = () => true;
pool.memoryDb = null;

module.exports = pool;