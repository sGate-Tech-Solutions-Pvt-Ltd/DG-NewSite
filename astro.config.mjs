import { defineConfig } from 'astro/config';
import studioCMS from 'studiocms';
import cloudflare from '@astrojs/cloudflare';

// `astro build` sets NODE_ENV=production; `astro dev` sets NODE_ENV=development.
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: isProd ? 'https://studiocms.sgate.in' : 'http://localhost:4321',
  output: 'server',
  adapter: cloudflare(),
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
