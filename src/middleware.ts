import { setD1Binding as setStudioCMSD1Binding } from '@withstudiocms/kysely/drivers/d1';
import { defineMiddleware } from 'astro/middleware';
import { resetSDKCore } from 'studiocms:sdk';
import { resetDbConnection, setD1Binding as setProjectD1Binding } from './lib/db';

/**
 * Cloudflare Hyperdrive binding exposes its connection details
 * (`env.HYPERDRIVE.host/port/user/password/database`) ONLY inside a
 * request's `fetch(request, env, ctx)` handler — surfaced by Astro's
 * Cloudflare adapter as `context.locals.runtime.env.HYPERDRIVE`.
 *
 * StudioCMS's Kysely mysql driver (and this project's own `src/lib/db.ts`
 * pool) read their connection config from `process.env.CMS_MYSQL_*` at the
 * moment the DB client is first constructed — lazily, inside a request —
 * not at module load. This middleware runs first on every request and
 * copies the Hyperdrive binding's values into `process.env` so that by the
 * time anything asks for a DB connection, the right values are already
 * there.
 *
 * If `env.HYPERDRIVE` isn't present (local `astro dev` / `wrangler dev`
 * without Hyperdrive configured, or before the binding is wired up),
 * nothing is overwritten — whatever is already in `process.env` (from
 * Worker secrets or a local `.env` file) is left untouched.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const hyperdrive = context.locals.runtime?.env?.HYPERDRIVE;

  if (hyperdrive) {
    process.env.CMS_MYSQL_HOST = hyperdrive.host;
    process.env.CMS_MYSQL_PORT = String(hyperdrive.port);
    process.env.CMS_MYSQL_USER = hyperdrive.user;
    process.env.CMS_MYSQL_PASSWORD = hyperdrive.password;
    process.env.CMS_MYSQL_DATABASE = hyperdrive.database;
  }

  // D1's binding is a live object, not a connection string, so unlike
  // Hyperdrive above it can't be copied into process.env for the driver to
  // read lazily — it has to be pushed into the driver module directly, once
  // per request, before any DB query runs. Two independent DB clients need
  // it: StudioCMS's own internal Kysely client (its dialect set in
  // studiocms.config.mjs) and this project's own pool in src/lib/db.ts
  // (its dialect set by DB_DIALECT there) — both must be flipped to 'd1'
  // together for either to actually matter. Inactive (no-op) until then.
  const d1 = context.locals.runtime?.env?.DB;
  if (d1) {
    setStudioCMSD1Binding(d1);
    setProjectD1Binding(d1);
  }

  // Cloudflare Workers forbids reusing an I/O object (e.g. an open MySQL
  // socket) across different requests on the same warm isolate — doing so
  // throws "Cannot perform I/O on behalf of a different request". StudioCMS's
  // SDK core (patched to be lazy-initialized, see patches/studiocms+0.4.4.patch)
  // caches its DB connection pool so multiple SDK calls *within* one request
  // share a single connection — but that cache must not survive into the
  // next request. Resetting it here, first thing on every request, forces a
  // fresh pool/connection next time getSDKCore() is called, while still
  // reusing one instance for everything within this request.
  resetSDKCore();
  resetDbConnection();

  return next();
});
