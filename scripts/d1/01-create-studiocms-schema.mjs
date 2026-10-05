#!/usr/bin/env node
// Creates/updates StudioCMS's own 16 core tables in the real D1 database,
// using StudioCMS's own migrator — the same mechanism `studiocms migrate
// --latest` uses, just pointed at D1 directly instead of going through
// studiocms.config.mjs (whose dialect is still 'mysql' until cutover).
//
// Does NOT touch studiocms.config.mjs, wrangler.jsonc's deployed Worker, or
// the live MySQL database — this only talks to the D1 database named in
// wrangler.jsonc's d1_databases binding, over the network, using your local
// wrangler login.
//
// Run this BEFORE 02-migrate-data.mjs (the StudioCMS tables need to exist
// before rows can be copied into them). The 7 site-content plugin tables
// are not StudioCMS-managed, so they're not touched here — see
// scripts/d1/schema.sql for those (already applied via the D1 Console).
//
// Usage:
//   node scripts/d1/01-create-studiocms-schema.mjs

import { getPlatformProxy } from 'wrangler';
import { setD1Binding, d1Driver } from '@withstudiocms/kysely/drivers/d1';
import { getMigratorLive } from '@withstudiocms/sdk/migrator';
import { Effect } from 'effect';

const proxy = await getPlatformProxy({
  // A dedicated D1-only config, not the real wrangler.jsonc — getPlatformProxy
  // otherwise tries to locally simulate every binding declared there,
  // including Hyperdrive, which has no bearing on this script and fails
  // asking for a local Postgres connection string. Keep its database_id in
  // sync with wrangler.jsonc's d1_databases entry.
  configPath: './scripts/d1/wrangler.d1-only.jsonc',
  remoteBindings: true,
});

try {
  if (!proxy.env.DB) {
    throw new Error(
      "No DB binding found via getPlatformProxy — check wrangler.jsonc's d1_databases block and that you're logged in (`npx wrangler whoami`)."
    );
  }

  setD1Binding(proxy.env.DB);

  const dialect = await Effect.runPromise(d1Driver);
  const migrator = await Effect.runPromise(getMigratorLive(dialect));

  console.log('Applying StudioCMS migrations to D1 (remote)...');
  const { error, results } = await Effect.runPromise(migrator.toLatest);

  if (results) {
    for (const r of results) {
      const icon = r.status === 'Success' ? '✓' : '✗';
      console.log(`  ${icon} ${r.migrationName}: ${r.status}`);
    }
  }

  if (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } else {
    console.log('Done. StudioCMS core tables are ready in D1.');
  }
} finally {
  await proxy.dispose();
}
