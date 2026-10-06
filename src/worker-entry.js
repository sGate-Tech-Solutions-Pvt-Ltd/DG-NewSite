// Thin wrapper around Astro's generated Worker (dist/_worker.js/index.js).
//
// Cold Cloudflare isolates pay a one-time cost (observed ~3.6s) the first
// time a request hits them, because StudioCMS's SDK middleware runs a batch
// of D1 queries (`verifyCache` in
// @withstudiocms/sdk/dist/modules/middleware/index.js) to populate its
// in-memory cache before any page can render. That cache is memoized for 30
// minutes once warm, but a fresh isolate starts without it.
//
// This file adds a `scheduled` handler (wired to a Cron Trigger in
// wrangler.jsonc) that self-fetches the homepage on a timer, so the warm
// cache stays populated and real visitors hit the fast path more often. It
// does not change request handling at all — `fetch` is passed straight
// through to Astro's own handler.
import astroWorker from '../dist/_worker.js/index.js';

export default {
  fetch: astroWorker.fetch,
  async scheduled(_event, _env, ctx) {
    ctx.waitUntil(fetch('https://studiocms.sgate.in/').catch(() => {}));
  },
};
