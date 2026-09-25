import crypto from 'node:crypto';
import type { AstroCookies } from 'astro';
import { getPool } from './db';

const SESSION_COOKIE_NAME = 'auth_session';
const ADMIN_RANKS = new Set(['admin', 'owner']);
// Matches StudioCMS's own isEditor threshold (editor/admin/owner all satisfy
// `userPermissionLevel.isEditor`, per frontend/middleware/utils.ts) — this is
// the same rank required to save a page's content, so any route just reading
// back what an editor already saved should use this, not the stricter admin set.
const EDITOR_RANKS = new Set(['editor', 'admin', 'owner']);

// StudioCMS's own `security` locals (Astro.locals.StudioCMS.security) are only
// populated by its middleware for routes under /{dashboardRoute}/** and
// /studiocms_api/** (confirmed by reading frontend/middleware/index.ts) — a
// plain API route outside those paths never gets it, so admin-gated routes
// here re-derive the same check directly: hash the session cookie the same
// way StudioCMS does (sha256 of the raw token) and look up the session/rank.
async function getSessionRank(cookies: AstroCookies): Promise<string | null> {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const sessionId = crypto.createHash('sha256').update(token).digest('hex');
  const pool = getPool();

  const [sessionRows] = await pool.query(
    'SELECT userId FROM StudioCMSSessionTable WHERE id = ? AND expiresAt > ?',
    [sessionId, new Date().toISOString()]
  );
  const session = (sessionRows as any[])[0];
  if (!session) return null;

  const [permRows] = await pool.query(
    'SELECT `rank` FROM StudioCMSPermissions WHERE user = ?',
    [session.userId]
  );
  const perm = (permRows as any[])[0];
  return perm?.rank ?? null;
}

export async function isAuthenticatedAdmin(cookies: AstroCookies): Promise<boolean> {
  const rank = await getSessionRank(cookies);
  return !!rank && ADMIN_RANKS.has(rank);
}

export async function isAuthenticatedEditor(cookies: AstroCookies): Promise<boolean> {
  const rank = await getSessionRank(cookies);
  return !!rank && EDITOR_RANKS.has(rank);
}
