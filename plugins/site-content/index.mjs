import path from 'node:path';
import { definePlugin } from 'studiocms/plugins';
import { contentTypes } from './lib/content-types.mjs';
import * as siteConfig from './settings/site-config.mjs';
import { getPool } from '../../src/lib/db.ts';

const CONTACT_SUBMISSIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS contact_submissions (
    id varchar(191) NOT NULL PRIMARY KEY,
    fullName text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    submittedAt text NOT NULL,
    \`read\` int NOT NULL DEFAULT 0,
    sourcePage text
  )
`;

// `CREATE TABLE IF NOT EXISTS` only helps on a fresh install — once a table
// already exists in production, new columns added to its schema later need
// an explicit backfill. Checked against INFORMATION_SCHEMA (rather than a
// dialect-specific `ADD COLUMN IF NOT EXISTS`) so this stays portable across
// MySQL/TiDB versions.
async function ensureColumns(pool, tableName, addedColumns) {
  if (!addedColumns?.length) return;
  const [existing] = await pool.query(
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
    [tableName]
  );
  const existingNames = new Set(existing.map((row) => row.COLUMN_NAME));
  for (const { name, ddl } of addedColumns) {
    if (existingNames.has(name)) continue;
    await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${name}\` ${ddl}`);
  }
}

async function ensureTables() {
  const pool = getPool();
  for (const contentType of contentTypes) {
    await pool.query(contentType.createTableSQL);
  }
  await pool.query(siteConfig.createTableSQL);
  await ensureColumns(pool, siteConfig.tableName, siteConfig.addedColumns);
  await pool.query(CONTACT_SUBMISSIONS_TABLE_SQL);

  const cols = Object.keys(siteConfig.defaultsRow);
  const placeholders = cols.map(() => '?').join(', ');
  await pool.query(
    `INSERT IGNORE INTO plugin_site_config (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
    cols.map((c) => siteConfig.defaultsRow[c])
  );
}

// NOTE: deliberately not using astro-integration-kit's createResolver(import.meta.url)
// here. StudioCMS loads studiocms.config.mjs by bundling all local (relative-import)
// project source into one temp file — which rewrites import.meta.url to point at that
// bundle's location instead of this file's real path, silently breaking any path
// resolved relative to it. Since this plugin is local to the project (not an installed
// package), resolving against the project root is reliable across `astro dev`/`build`
// and the `studiocms` CLI, which both run from the project root.
const PLUGIN_DIR = path.join(process.cwd(), 'plugins', 'site-content');
// Forward slashes: the resolved path also gets embedded as an import specifier
// inside generated virtual-module source (see studiocms/dist/handlers/pluginHandler.js),
// and a Windows backslash path there can be misparsed as a legacy octal escape
// (e.g. `\2026\...` -> `\2` + "026") which is invalid in strict-mode ESM.
const resolve = (relativePath) => path.join(PLUGIN_DIR, relativePath).split(path.sep).join('/');

export default function siteContentPlugin() {
  const identifier = 'site-content';

  return definePlugin({
    identifier,
    name: 'Site Content',
    hooks: {
      'studiocms:astro-config': async ({ logger }) => {
        try {
          await ensureTables();
          logger.info('site-content: plugin tables ready.');
        } catch (err) {
          logger.error(`site-content: failed to create plugin tables: ${err}`);
        }
      },
      'studiocms:rendering': async ({ setRendering }) => {
        setRendering({
          pageTypes: contentTypes.map((ct) => ({
            identifier: ct.identifier,
            label: ct.label,
            fields: ct.fields,
            apiEndpoint: resolve(`./endpoints/${ct.endpointFile}`),
            pageContentComponent: resolve('./shared/EmptyContentEditor.astro'),
            rendererComponent: resolve('./shared/empty-renderer.mjs'),
          })),
        });
      },
      'studiocms:dashboard': async ({ setDashboard }) => {
        // NOTE: StudioCMS's built-in `settingsPage` mechanism (a plain native
        // <form> POSTing to its `savePluginSettings` HttpApi endpoint) hits an
        // unresolved "Decode error" on every save (confirmed: the save still
        // succeeds server-side, but the client always gets an error response).
        // Bypassed entirely in favor of a custom dashboardPages admin page
        // (below) that reads current values fresh per request and submits via
        // fetch() to our own /api/site-config-save route instead.
        setDashboard({
          translations: { en: {} },
          dashboardPages: {
            admin: [
              {
                title: { en: 'Site Settings' },
                description: 'Edit site-wide content: hero text, images, stats, and social links.',
                route: 'settings',
                sidebar: 'single',
                pageBodyComponent: resolve('./dashboard/site-settings/body.astro'),
                requiredPermissions: 'admin',
              },
              {
                title: { en: 'Contact Submissions' },
                description: 'View messages submitted through the site contact form.',
                route: 'submissions',
                sidebar: 'single',
                pageBodyComponent: resolve('./dashboard/contact-submissions/body.astro'),
                requiredPermissions: 'admin',
              },
            ],
          },
        });
      },
    },
  });
}
