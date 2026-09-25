// These content types are never rendered through <StudioCMSRenderer> — the
// site queries their structured fields directly (see src/lib/content.ts).
// This exists only to satisfy StudioCMS's page-type registration, which
// requires every pageType to declare a renderer module.
export default {
  name: 'site-content/empty',
  renderer: async () => '',
};
