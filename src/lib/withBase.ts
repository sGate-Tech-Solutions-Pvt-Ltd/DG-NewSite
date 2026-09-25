// Astro's `base` config (set to /DG-studiocms in production, see astro.config.mjs)
// only auto-prefixes paths that go through Astro's own asset pipeline — plain
// hardcoded strings like "/images/x.jpg" (which is how every image path in
// this project's content and templates is stored) are left untouched. This
// prepends the configured base manually so those paths resolve correctly
// under a subpath deployment, while staying a no-op in local dev (base "/").
export function withBase<T extends string | null | undefined>(path: T): T {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}` as T;
}
