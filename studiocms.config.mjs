import { defineStudioCMSConfig } from 'studiocms/config';
import mdPlugin from '@studiocms/md';
import siteContentPlugin from './plugins/site-content/index.mjs';

export default defineStudioCMSConfig({
  dbStartPage: false,
  db: {
    dialect: 'd1',
  },
  plugins: [mdPlugin(), siteContentPlugin()],
  // NOTE: authConfig/dashboardConfig live under `features`, not at the top
  // level — a top-level `authConfig`/`dashboardConfig` key is silently
  // ignored (no validation error, since the schema doesn't reject unknown
  // top-level keys), which is exactly what happened here previously: the
  // old top-level `dashboardConfig: { dashboardEnabled: true }` did nothing
  // at all (it only "worked" because `true` already matches the default).
  features: {
    dashboardConfig: {
      dashboardEnabled: true,
    },
    // Self-registration defaults to on in StudioCMS — disabled here so the
    // dashboard login page doesn't let random visitors create their own
    // account. Admin/editor users are created via the dashboard's user
    // management (by an already-logged-in admin) or the `studiocms users`
    // CLI, not public self-signup.
    authConfig: {
      providers: {
        usernameAndPasswordConfig: {
          allowUserRegistration: false,
        },
      },
    },
  },
});
