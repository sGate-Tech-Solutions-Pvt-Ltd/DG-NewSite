import mysql from 'mysql2/promise';
import type { D1Database } from '@cloudflare/workers-types';

// Single flip point for the D1 cutover: the site-content plugin
// (plugins/site-content/*) branches its hand-written SQL on this instead of
// StudioCMS's own dialect config, since that lives in studiocms.config.mjs
// and isn't easily importable from plugin/integration code without
// circularity. Flip this to 'd1' in the same commit that changes
// studiocms.config.mjs's `db.dialect` — they must always match.
export const DB_DIALECT: 'mysql' | 'd1' = 'd1';

// This project's own pool (as opposed to StudioCMS's internal Kysely client,
// configured separately via studiocms.config.mjs + the patched
// @withstudiocms/kysely/drivers/d1) also needs the live D1 binding pushed
// into it each request — same reasoning as that driver's setD1Binding: the
// binding is a live object only reachable inside the Worker's fetch
// handler, so src/middleware.ts pushes it in here directly rather than via
// an env var. No-op while DB_DIALECT is 'mysql'.
let d1Binding: D1Database | undefined;

export function setD1Binding(binding: D1Database) {
  d1Binding = binding;
}

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

// D1's bound-parameter API takes positional args spread into `.bind(...)`,
// not an array — every call site here passes `values` as an array (or
// omits it for parameterless statements), so this covers the real shapes in
// use without trying to support mysql2's named-placeholder object form.
function bindParams(values?: unknown): unknown[] {
  if (values === undefined) return [];
  if (Array.isArray(values)) return values;
  return [values];
}

export const pool = {
  async query(
    sql: string,
    values?: unknown
  ): Promise<[mysql.RowDataPacket[] | mysql.ResultSetHeader, mysql.FieldPacket[]]> {
    if (DB_DIALECT === 'd1') {
      if (!d1Binding) {
        throw new Error(
          'No D1 binding set. setD1Binding(env.DB) must be called (from src/middleware.ts) before the first query of a request.'
        );
      }
      const { results } = await d1Binding
        .prepare(sql)
        .bind(...bindParams(values))
        .all();
      // Every caller of pool.query() destructures `[rows]` and treats it as
      // a plain array of row objects (never mysql2's ResultSetHeader shape
      // or the `fields` second element) — confirmed by reading every call
      // site. D1's `.all().results` is already exactly that shape for both
      // SELECTs and writes (empty array for the latter), so no translation
      // is needed beyond casting past mysql2's return type.
      return [results as unknown as mysql.RowDataPacket[], []];
    }

    const connection = await getConnection();
    return connection.query(sql, values);
  },
};

export function getPool() {
  return pool;
}
