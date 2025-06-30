import pg from 'pg';
const { Pool } = pg;
const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } = process.env;
const isLocal = DB_HOST === 'localhost';

export default new Pool({
  connectionString: `postgresql://${DB_USER}:${encodeURIComponent(
    DB_PASSWORD
  )}@${DB_HOST}:${+DB_PORT}/${DB_NAME}`,
  ssl: isLocal ? false : { rejectUnauthorized: false }, // if using something like Neon serverless PG
});
