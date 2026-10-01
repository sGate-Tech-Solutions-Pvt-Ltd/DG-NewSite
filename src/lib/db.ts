import mysql from 'mysql2/promise';

function connectionConfig() {
  return {
    host: process.env.CMS_MYSQL_HOST,
    port: Number(process.env.CMS_MYSQL_PORT),
    user: process.env.CMS_MYSQL_USER,
    password: process.env.CMS_MYSQL_PASSWORD,
    database: process.env.CMS_MYSQL_DATABASE,
    // mysql2 JIT-compiles row parsers via `new Function(...)` by default;
    // Cloudflare Workers disallows dynamic code generation, so this must be
    // disabled to run there.
    disableEval: true,
    ...(process.env.CMS_MYSQL_SSL === 'true'
      ? { ssl: { minVersion: 'TLSv1.2' as const, rejectUnauthorized: true } }
      : {}),
  };
}

// Cloudflare Workers forbids reusing an I/O object (including an open TCP
// socket, which is what a pooled connection holds) across different
// requests — each request gets its own isolated I/O context. A module-level
// pool shared across requests therefore throws "Cannot perform I/O on behalf
// of a different request" as soon as a second, separate request touches it.
// Hyperdrive is designed precisely to make per-request connections cheap (it
// pools at the edge, not in this isolate), so the correct pattern here is a
// fresh connection per call, closed immediately after — matching Cloudflare's
// own documented Hyperdrive + mysql2 usage.
export const pool = {
  async query(
    sql: string,
    values?: unknown
  ): Promise<[mysql.RowDataPacket[] | mysql.ResultSetHeader, mysql.FieldPacket[]]> {
    const connection = await mysql.createConnection(connectionConfig());
    try {
      return await connection.query(sql, values);
    } finally {
      await connection.end();
    }
  },
};

export function getPool() {
  return pool;
}
