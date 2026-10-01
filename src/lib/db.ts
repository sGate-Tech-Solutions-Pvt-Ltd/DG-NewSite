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
// socket) across different requests — each request gets its own isolated I/O
// context, so a connection cached forever across requests throws "Cannot
// perform I/O on behalf of a different request" as soon as a later, separate
// request touches it. But opening a brand-new connection for every single
// `.query()` call is also wrong: it pays a full connection handshake per
// query instead of per request, which can blow past Workers' CPU/wall-time
// limits on any page that runs more than one query.
//
// The correct middle ground: cache one connection, reused by every
// `.query()` call within a single request, and reset it at the very start of
// each new request (see `resetDbConnection`, called from `src/middleware.ts`)
// so the next request always builds its own fresh connection.
let connectionPromise: Promise<mysql.Connection> | undefined;

function getConnection(): Promise<mysql.Connection> {
  if (!connectionPromise) {
    connectionPromise = mysql.createConnection(connectionConfig());
  }
  return connectionPromise;
}

export function resetDbConnection() {
  connectionPromise = undefined;
}

export const pool = {
  async query(
    sql: string,
    values?: unknown
  ): Promise<[mysql.RowDataPacket[] | mysql.ResultSetHeader, mysql.FieldPacket[]]> {
    const connection = await getConnection();
    return connection.query(sql, values);
  },
};

export function getPool() {
  return pool;
}
