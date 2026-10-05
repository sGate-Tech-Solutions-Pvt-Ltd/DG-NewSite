#!/usr/bin/env node
// One-off data migration: copy every row from the live MySQL database into
// the real D1 database, table by table. Mirrors the existing
// scripts/migrate-sqlite-to-mysql.mjs (same batching/--truncate approach),
// just in the opposite direction and against a D1 binding instead of a
// mysql2 pool.
//
// Run 01-create-studiocms-schema.mjs first (StudioCMS's 16 core tables) —
// the 7 site-content plugin tables are assumed already created via
// scripts/d1/schema.sql (D1 Console).
//
// Needs your local wrangler login (for D1) and network access to the
// production MySQL host (same CMS_MYSQL_* vars as .env) — both unavailable
// in a sandboxed environment, so this is meant to be run from your own
// terminal.
//
// Usage:
//   node scripts/d1/02-migrate-data.mjs            # copy, skip tables that already have rows
//   node scripts/d1/02-migrate-data.mjs --truncate  # wipe each D1 table first

import { getPlatformProxy } from 'wrangler';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const TRUNCATE = process.argv.includes('--truncate');

// Parent tables first so FK-referenced rows exist before their dependents
// (same order as scripts/migrate-sqlite-to-mysql.mjs), followed by the
// site-content plugin's own tables, whose `pageId` columns reference
// StudioCMSPageData.id.
const TABLES = [
  'StudioCMSUsersTable',
  'StudioCMSPageFolderStructure',
  'StudioCMSPageData',
  'StudioCMSOAuthAccounts',
  'StudioCMSSessionTable',
  'StudioCMSPermissions',
  'StudioCMSAPIKeys',
  'StudioCMSUserResetTokens',
  'StudioCMSEmailVerificationTokens',
  'StudioCMSDiffTracking',
  'StudioCMSPageContent',
  'StudioCMSPageDataTags',
  'StudioCMSPageDataCategories',
  'StudioCMSPluginData',
  'StudioCMSDynamicConfigSettings',
  'StudioCMSStorageManagerUrlMappings',
  'contact_submissions',
  'plugin_site_config',
  'plugin_partners',
  'plugin_protocol_items',
  'plugin_testimonials',
  'plugin_youtube_videos',
  'plugin_podcast_episodes',
];

function normalizeValue(value) {
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  return value;
}

async function migrateTable(mysqlPool, d1, tableName) {
  const [rows, fields] = await mysqlPool.query(`SELECT * FROM \`${tableName}\``);

  if (rows.length === 0) {
    console.log(`  ${tableName}: 0 rows in source, skipping`);
    return;
  }

  const existing = await d1
    .prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
    .first('count');

  if (existing > 0 && !TRUNCATE) {
    console.log(
      `  ${tableName}: target already has ${existing} row(s), skipping (use --truncate to overwrite)`
    );
    return;
  }

  if (TRUNCATE) {
    await d1.prepare(`DELETE FROM ${tableName}`).run();
  }

  const columns = fields.map((f) => f.name);
  const columnList = columns.map((c) => `\`${c}\``).join(', ');

  // Stay comfortably under SQLite/D1's default ~999 bound-parameter limit
  // per statement, regardless of how wide the table is.
  const BATCH_SIZE = Math.max(1, Math.floor(900 / columns.length));

  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const placeholderRow = `(${columns.map(() => '?').join(', ')})`;
    const placeholders = batch.map(() => placeholderRow).join(', ');
    const values = batch.flatMap((row) => columns.map((c) => normalizeValue(row[c])));
    await d1
      .prepare(`INSERT INTO ${tableName} (${columnList}) VALUES ${placeholders}`)
      .bind(...values)
      .run();
    inserted += batch.length;
  }

  console.log(`  ${tableName}: copied ${inserted} row(s)`);
}

async function main() {
  const mysqlPool = await mysql.createConnection({
    host: process.env.CMS_MYSQL_HOST,
    port: Number(process.env.CMS_MYSQL_PORT),
    user: process.env.CMS_MYSQL_USER,
    password: process.env.CMS_MYSQL_PASSWORD,
    database: process.env.CMS_MYSQL_DATABASE,
    ...(process.env.CMS_MYSQL_SSL === 'true'
      ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
      : {}),
  });

  const proxy = await getPlatformProxy({
    configPath: './scripts/d1/wrangler.d1-only.jsonc',
    remoteBindings: true,
  });

  console.log(
    `Copying data from MySQL database "${process.env.CMS_MYSQL_DATABASE}" to D1 (remote)...`
  );
  if (TRUNCATE) console.log('--truncate set: existing rows in each target table will be wiped first.\n');

  try {
    for (const table of TABLES) {
      await migrateTable(mysqlPool, proxy.env.DB, table);
    }
    console.log('\nDone.');
  } finally {
    await mysqlPool.end();
    await proxy.dispose();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
