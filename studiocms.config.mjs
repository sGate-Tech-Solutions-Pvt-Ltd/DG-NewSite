import { defineStudioCMSConfig } from 'studiocms/config';
import mdPlugin from '@studiocms/md';
import siteContentPlugin from './plugins/site-content/index.mjs';

export default defineStudioCMSConfig({
  dbStartPage: false,
  db: {
    dialect: 'mysql',
  },
  plugins: [mdPlugin(), siteContentPlugin()],
  dashboardConfig: {
    dashboardEnabled: true,
  },
});
