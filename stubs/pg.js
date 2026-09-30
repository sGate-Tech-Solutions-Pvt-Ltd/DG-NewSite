// Stub for the optional `pg` dependency pulled in by @withstudiocms/kysely's
// Postgres driver (dist/drivers/postgres.js). We only use the mysql dialect,
// but esbuild statically resolves all of StudioCMS's dynamic `import()`
// driver branches when bundling for the Workers runtime, so the real `pg`
// package must resolve even though this branch is never reached at runtime.
export class Pool {
  constructor() {
    throw new Error('pg is not available in this deployment (mysql dialect is in use)');
  }
}
export default { Pool };
