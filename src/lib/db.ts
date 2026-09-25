import mysql from 'mysql2/promise';

let pool: mysql.Pool | undefined;

// Module-level singleton — reused by every page/API route, and by the
// site-content plugin's own hooks/endpoints (which import this same file).
// Do NOT create a pool per call/request; mysql2 pools are meant to be shared.
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.CMS_MYSQL_HOST,
      port: Number(process.env.CMS_MYSQL_PORT),
      user: process.env.CMS_MYSQL_USER,
      password: process.env.CMS_MYSQL_PASSWORD,
      database: process.env.CMS_MYSQL_DATABASE,
      connectionLimit: 10,
      ...(process.env.CMS_MYSQL_SSL === 'true'
        ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
        : {}),
    });
  }
  return pool;
}
