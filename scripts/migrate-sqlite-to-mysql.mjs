#!/usr/bin/env node
// One-off data migration: copy StudioCMS content from the local libSQL/SQLite
// file (CMS_LIBSQL_URL) into the MySQL database (CMS_MYSQL_*), table by table.
// Run after `studiocms migrate --latest` has created the MySQL schema.
//
// Usage:
//   node scripts/migrate-sqlite-to-mysql.mjs           # copy, skip tables that already have rows
//   node scripts/migrate-sqlite-to-mysql.mjs --truncate # wipe each MySQL table before copying

import { createClient } from '@libsql/client';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const TRUNCATE = process.argv.includes('--truncate');

// Parent tables first so FK-referenced rows exist before their dependents.
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
];

const BATCH_SIZE = 500;

function normalizeValue(value) {
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  return value;
}

async function migrateTable(sqlite, pool, tableName) {
  const result = await sqlite.execute(`SELECT * FROM "${tableName}"`);
  const rows = result.rows;

  if (rows.length === 0) {
    console.log(`  ${tableName}: 0 rows in source, skipping`);
    return;
  }

  const [[{ count: existingCount }]] = await pool.query(
    `SELECT COUNT(*) as count FROM \`${tableName}\``
  );

  if (existingCount > 0 && !TRUNCATE) {
    console.log(
      `  ${tableName}: target already has ${existingCount} row(s), skipping (use --truncate to overwrite)`
    );
    return;
  }

  if (TRUNCATE) {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query(`TRUNCATE TABLE \`${tableName}\``);
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  const columns = result.columns;
  const columnList = columns.map((c) => `\`${c}\``).join(', ');
  const placeholderRow = `(${columns.map(() => '?').join(', ')})`;

  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const placeholders = batch.map(() => placeholderRow).join(', ');
    const values = batch.flatMap((row) => columns.map((c) => normalizeValue(row[c])));
    await pool.query(
      `INSERT INTO \`${tableName}\` (${columnList}) VALUES ${placeholders}`,
      values
    );
    inserted += batch.length;
  }

  console.log(`  ${tableName}: copied ${inserted} row(s)`);
}

async function main() {
  const sqlite = createClient({ url: process.env.CMS_LIBSQL_URL });
  const pool = await mysql.createConnection({
    host: process.env.CMS_MYSQL_HOST,
    port: Number(process.env.CMS_MYSQL_PORT),
    user: process.env.CMS_MYSQL_USER,
    password: process.env.CMS_MYSQL_PASSWORD,
    database: process.env.CMS_MYSQL_DATABASE,
  });

  console.log(`Copying data from ${process.env.CMS_LIBSQL_URL} to MySQL database "${process.env.CMS_MYSQL_DATABASE}"...`);
  if (TRUNCATE) console.log('--truncate set: existing rows in each target table will be wiped first.\n');

  try {
    for (const table of TABLES) {
      await migrateTable(sqlite, pool, table);
    }
    console.log('\nDone.');
  } finally {
    await pool.end();
    sqlite.close();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
