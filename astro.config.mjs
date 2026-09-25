import { defineConfig } from 'astro/config';
import studioCMS from 'studiocms';
import node from '@astrojs/node';

// `astro build` sets NODE_ENV=production; `astro dev` sets NODE_ENV=development.
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: isProd ? 'https://studiocms.sgate.in' : 'http://localhost:4321',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Plesk/Passenger proxies to this Node process over plain HTTP internally
  // and doesn't have this domain in an allowlist by default, so Astro's
  // security middleware refuses to trust the X-Forwarded-* headers (or even
  // the raw Host header) and falls back to treating every request as
  // "http://localhost" — breaking the same-origin check on every POST
  // (login, contact form, etc). This tells Astro the real public domain is
  // safe to trust when forwarded by the proxy in front of it.
  security: isProd
    ? {
        allowedDomains: [{ hostname: 'studiocms.sgate.in', protocol: 'https' }],
      }
    : undefined,
  integrations: [studioCMS()],
  vite: {
    optimizeDeps: {
      force: true,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "src/styles/_variables.scss" as *;`,
        },
      },
    },
  },
});
