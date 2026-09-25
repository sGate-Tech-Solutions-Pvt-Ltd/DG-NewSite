import { getPool } from '../../../src/lib/db.ts';

// StudioCMS's onEdit/onDelete plugin-hook call sites have no error boundary
// around them (confirmed by reading the dashboard content handler) — a
// thrown/rejected handler becomes an unhandled failure. Every handler here
// must catch internally and always resolve a Response.
export function makeHandlers(contentType) {
  const { tableName, defaultsRow, toRow } = contentType;
  const columns = Object.keys(defaultsRow);

  return {
    async onCreate({ pageData }) {
      try {
        const cols = ['pageId', ...columns];
        const placeholders = cols.map(() => '?').join(', ');
        const values = [pageData.id, ...columns.map((c) => defaultsRow[c])];
        await getPool().query(
          `INSERT INTO ${tableName} (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
          values
        );
      } catch (err) {
        console.error(`[site-content] onCreate ${tableName} failed:`, err);
      }
      return new Response(null, { status: 200 });
    },

    // Upsert rather than a plain UPDATE: if the onCreate insert never landed
    // (e.g. a placeholder collision on a unique column), onEdit still needs
    // to persist the real values instead of silently updating zero rows.
    async onEdit({ pageData, pluginFields }) {
      try {
        const row = toRow(pluginFields || {});
        const cols = ['pageId', ...columns];
        const placeholders = cols.map(() => '?').join(', ');
        const values = [pageData.id, ...columns.map((c) => row[c])];
        const updateClause = columns.map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(', ');
        await getPool().query(
          `INSERT INTO ${tableName} (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})
           ON DUPLICATE KEY UPDATE ${updateClause}`,
          values
        );
      } catch (err) {
        console.error(`[site-content] onEdit ${tableName} failed:`, err);
      }
      return new Response(null, { status: 200 });
    },

    // Foreign keys are inert on MySQL here (verified against the live DB) —
    // nothing cascades this for us, and the parent page row is already gone
    // by the time this fires, so key off pageData.id from the payload.
    async onDelete({ pageData }) {
      try {
        await getPool().query(`DELETE FROM ${tableName} WHERE pageId = ?`, [pageData.id]);
      } catch (err) {
        console.error(`[site-content] onDelete ${tableName} failed:`, err);
      }
      return new Response(null, { status: 200 });
    },
  };
}
