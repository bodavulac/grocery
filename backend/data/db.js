const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.RDS_HOSTNAME || 'localhost',
  port: parseInt(process.env.RDS_PORT, 10) || 5432,
  database: process.env.RDS_DB_NAME || 'grocery_db',
  user: process.env.RDS_USERNAME || 'postgres',
  password: process.env.RDS_PASSWORD || 'postgres',
  ssl: process.env.RDS_HOSTNAME ? { rejectUnauthorized: false } : false
});

module.exports = pool;
