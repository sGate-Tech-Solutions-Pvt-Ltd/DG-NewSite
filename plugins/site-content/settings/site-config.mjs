import { intValue, textValue } from '../lib/normalize.mjs';

export const tableName = 'plugin_site_config';

export const createTableSQL = `
  CREATE TABLE IF NOT EXISTS plugin_site_config (
    id varchar(191) NOT NULL PRIMARY KEY,
    siteName text NOT NULL,
    tagline text NOT NULL,
    heroImage text NOT NULL,
    aboutImage text NOT NULL,
    podcastBgImage text NOT NULL,
    podcastBgImagenew text,
    testimonialsBgImage text NOT NULL,
    youtubeChannelUrl text NOT NULL,
    socialInstagram text,
    socialFacebook text,
    socialX text,
    socialYoutube text,
    socialTikTok text,
    statFollowers text NOT NULL,
    statExperience text NOT NULL,
    statCredentials text NOT NULL,
    statsHeading text,
    statsBody longtext,
    podcastHeroTitle text,
    podcastHeroSubtitle longtext,
    applePodcastsUrl text,
    podcastRankApple text,
    podcastRankSpotify text,
    podcastDownloads text,
    aboutTitle text,
    aboutDescription longtext,
    youtubeSectionHeading text,
    partnersSectionHeading text,
    partnersSectionSubtitle longtext,
    testimonialsHeroTitle text,
    copyrightYear int,
    partnersHeroImage text,
    partnersHeroTitle text,
    partnersHeroSubtitle longtext,
    partnerFormImage text,
    partnerFormHeading text,
    podcastGuestImage text,
    protocolHeroImage text,
    protocolHeroTitle text,
    protocolIntroTitle text,
    protocolIntroBody text,
    protocolCtaTitle text,
    protocolCtaBody text,
    aboutHeroImage text,
    aboutHeroTitle longtext,
    aboutPurposeTitle text,
    aboutPurposeVideoUrl text,
    aboutPurposeButtonText text,
    aboutPurposeButtonUrl text,
    podcastEmbedIframe longtext,
    podcastHeroImage text,
    podcastRankAppleLabel text,
    podcastRankSpotifyLabel text,
    podcastDownloadsLabel text,
    podcastGuestFormHeading text
  )
`;

// Columns added after the table already existed in production — `CREATE
// TABLE IF NOT EXISTS` is a no-op once the table is there, so these need an
// explicit backfill (see ensureTables in index.mjs).
export const addedColumns = [
  { name: 'statsHeading', ddl: 'text' },
  { name: 'statsBody', ddl: 'longtext' },
  { name: 'podcastHeroTitle', ddl: 'text' },
  { name: 'podcastHeroSubtitle', ddl: 'longtext' },
  { name: 'applePodcastsUrl', ddl: 'text' },
  { name: 'podcastRankApple', ddl: 'text' },
  { name: 'podcastRankSpotify', ddl: 'text' },
  { name: 'podcastDownloads', ddl: 'text' },
  { name: 'aboutTitle', ddl: 'text' },
  { name: 'aboutDescription', ddl: 'longtext' },
  { name: 'youtubeSectionHeading', ddl: 'text' },
  { name: 'partnersSectionHeading', ddl: 'text' },
  { name: 'partnersSectionSubtitle', ddl: 'longtext' },
  { name: 'testimonialsHeroTitle', ddl: 'text' },
  { name: 'protocolHeroImage', ddl: 'text' },
  { name: 'protocolHeroTitle', ddl: 'text' },
  { name: 'partnersHeroTitle', ddl: 'text' },
  { name: 'partnersHeroSubtitle', ddl: 'longtext' },
  { name: 'partnerFormHeading', ddl: 'text' },
  { name: 'aboutHeroImage', ddl: 'text' },
  { name: 'aboutHeroTitle', ddl: 'longtext' },
  { name: 'aboutPurposeTitle', ddl: 'text' },
  { name: 'aboutPurposeVideoUrl', ddl: 'text' },
  { name: 'aboutPurposeButtonText', ddl: 'text' },
  { name: 'aboutPurposeButtonUrl', ddl: 'text' },
  { name: 'podcastEmbedIframe', ddl: 'longtext' },
  { name: 'podcastHeroImage', ddl: 'text' },
  { name: 'podcastRankAppleLabel', ddl: 'text' },
  { name: 'podcastRankSpotifyLabel', ddl: 'text' },
  { name: 'podcastDownloadsLabel', ddl: 'text' },
  { name: 'podcastGuestFormHeading', ddl: 'text' },
  { name: 'podcastBgImagenew', ddl: 'text' },
];

// The columns that are safe to write with a real default at table-creation
// time. copyrightYear is deliberately excluded — a static SQL default would
// go stale; it's computed at read time instead (see src/lib/content.ts).
export const defaultsRow = {
  id: 'default',
  siteName: 'Dylan Gemelli',
  tagline: 'The Wellness Revolutionary',
  heroImage: '/images/page1_img1.jpeg',
  aboutImage: '/images/the_wellness_revolutionary.jpg',
  podcastBgImage: '/images/page3_img1.jpeg',
  podcastBgImagenew: '/images/the_dylan_gemelli_podcastbg.jpg',
  
  testimonialsBgImage: '/images/page1_img2.jpeg',
  youtubeChannelUrl: 'https://www.youtube.com/@DylanGemelliBiohacking',
  socialInstagram: null,
  socialFacebook: null,
  socialX: null,
  socialYoutube: null,
  socialTikTok: null,
  statFollowers: '1.5M+',
  statExperience: '20+',
  statCredentials: '10+',
  statsHeading: null,
  statsBody: null,
  podcastHeroTitle: null,
  podcastHeroSubtitle: null,
  podcastRankApple: null,
  podcastRankSpotify: null,
  podcastDownloads: null,
  aboutTitle: null,
  aboutDescription: null,
  youtubeSectionHeading: null,
  partnersSectionHeading: null,
  partnersSectionSubtitle: null,
  testimonialsHeroTitle: null,
  copyrightYear: null,
  partnersHeroImage: null,
  partnersHeroTitle: null,
  partnersHeroSubtitle: null,
  partnerFormImage: null,
  partnerFormHeading: null,
  podcastGuestImage: null,
  protocolHeroImage: null,
  protocolHeroTitle: null,
  protocolIntroTitle: null,
  protocolIntroBody: null,
  protocolCtaTitle: null,
  protocolCtaBody: null,
  aboutHeroImage: null,
  aboutHeroTitle: null,
  aboutPurposeTitle: null,
  aboutPurposeVideoUrl: null,
  aboutPurposeButtonText: null,
  aboutPurposeButtonUrl: null,
  podcastEmbedIframe: null,
  podcastHeroImage: null,
  podcastRankAppleLabel: null,
  podcastRankSpotifyLabel: null,
  podcastDownloadsLabel: null,
  podcastGuestFormHeading: null,
};

// StudioCMS's settingsPage `fields` are fixed once when the dev server/build
// starts — they are NOT re-evaluated per dashboard page visit, and there's no
// hook for a plugin to supply "current" values on demand. So the only way to
// show what's actually saved is to read the row once at plugin-registration
// time (see index.mjs) and bake it into each field's `defaultValue` here.
// That means the form reflects the database as of the last server start/
// deploy — it won't live-update within a single running session after a
// save. Restart the dev server (or redeploy) to see fresh values reflected.
export function buildFields(row) {
  const value = (name) => {
    const v = row?.[name];
    return v === null || v === undefined ? undefined : String(v);
  };

  return [
    { input: 'input', name: 'siteName', label: 'Site name', type: 'text', required: true, defaultValue: value('siteName') },
    { input: 'input', name: 'tagline', label: 'Tagline', type: 'text', required: true, defaultValue: value('tagline') },
    { input: 'input', name: 'heroImage', label: 'Homepage hero image', type: 'text', defaultValue: value('heroImage') },
    { input: 'input', name: 'aboutImage', label: 'About portrait image', type: 'text', defaultValue: value('aboutImage') },
    { input: 'input', name: 'podcastBgImage', label: 'Podcast section background', type: 'text', defaultValue: value('podcastBgImage') },
    { input: 'input', name: 'podcastBgImagenew', label: 'Podcast section background (Homepage)', type: 'text', defaultValue: value('podcastBgImagenew') },
    { input: 'input', name: 'testimonialsBgImage', label: 'Testimonials section background', type: 'text', defaultValue: value('testimonialsBgImage') },
    { input: 'input', name: 'youtubeChannelUrl', label: 'YouTube channel URL', type: 'url', defaultValue: value('youtubeChannelUrl') },
    { input: 'input', name: 'socialInstagram', label: 'Instagram URL', type: 'url', defaultValue: value('socialInstagram') },
    { input: 'input', name: 'socialFacebook', label: 'Facebook URL', type: 'url', defaultValue: value('socialFacebook') },
    { input: 'input', name: 'socialX', label: 'X (Twitter) URL', type: 'url', defaultValue: value('socialX') },
    { input: 'input', name: 'socialYoutube', label: 'YouTube URL', type: 'url', defaultValue: value('socialYoutube') },
    { input: 'input', name: 'socialTikTok', label: 'TikTok URL', type: 'url', defaultValue: value('socialTikTok') },
    { input: 'input', name: 'statFollowers', label: 'Stat: Followers', type: 'text', defaultValue: value('statFollowers') },
    { input: 'input', name: 'statExperience', label: 'Stat: Years of experience', type: 'text', defaultValue: value('statExperience') },
    { input: 'input', name: 'statCredentials', label: 'Stat: Credentials', type: 'text', defaultValue: value('statCredentials') },
    { input: 'input', name: 'statsHeading', label: 'Stats Section Heading', type: 'text', defaultValue: value('statsHeading') },
    { input: 'textarea', name: 'statsBody', label: 'Stats Section Description', defaultValue: value('statsBody') },
    { input: 'input', name: 'podcastHeroTitle', label: 'Podcast Hero Title', type: 'text', defaultValue: value('podcastHeroTitle') },
    { input: 'textarea', name: 'podcastHeroSubtitle', label: 'Podcast Hero Subtitle', defaultValue: value('podcastHeroSubtitle') },
    { input: 'input', name: 'podcastRankApple', label: 'Podcast Rank: Apple', type: 'text', defaultValue: value('podcastRankApple') },
    { input: 'input', name: 'podcastRankSpotify', label: 'Podcast Rank: Spotify', type: 'text', defaultValue: value('podcastRankSpotify') },
    { input: 'input', name: 'podcastDownloads', label: 'Podcast Downloads', type: 'text', defaultValue: value('podcastDownloads') },
    { input: 'input', name: 'aboutTitle', label: 'About Section Title', type: 'text', defaultValue: value('aboutTitle') },
    { input: 'textarea', name: 'aboutDescription', label: 'About Section Description', defaultValue: value('aboutDescription') },
    { input: 'input', name: 'youtubeSectionHeading', label: 'YouTube Section Heading', type: 'text', defaultValue: value('youtubeSectionHeading') },
    { input: 'input', name: 'partnersSectionHeading', label: 'Partners Section Heading', type: 'text', defaultValue: value('partnersSectionHeading') },
    { input: 'textarea', name: 'partnersSectionSubtitle', label: 'Partners Section Subtitle', defaultValue: value('partnersSectionSubtitle') },
    { input: 'input', name: 'testimonialsHeroTitle', label: 'Testimonials Section Heading', type: 'text', defaultValue: value('testimonialsHeroTitle') },
    { input: 'input', name: 'copyrightYear', label: 'Copyright year (blank = current year)', type: 'number', defaultValue: value('copyrightYear') },
    { input: 'input', name: 'partnersHeroImage', label: 'Partners page hero image', type: 'text', defaultValue: value('partnersHeroImage') },
    { input: 'textarea', name: 'partnersHeroTitle', label: 'Partners Hero Title', defaultValue: value('partnersHeroTitle') },
    { input: 'textarea', name: 'partnersHeroSubtitle', label: 'Partners Hero Subtitle', defaultValue: value('partnersHeroSubtitle') },
    { input: 'input', name: 'partnerFormImage', label: 'Partners page form image', type: 'text', defaultValue: value('partnerFormImage') },
    { input: 'input', name: 'partnerFormHeading', label: 'Partner Form Heading', type: 'text', defaultValue: value('partnerFormHeading') },
    { input: 'input', name: 'podcastGuestImage', label: 'Podcast guest form image', type: 'text', defaultValue: value('podcastGuestImage') },
    { input: 'input', name: 'protocolHeroImage', label: 'Protocol Hero Image', type: 'text', defaultValue: value('protocolHeroImage') },
    { input: 'input', name: 'protocolHeroTitle', label: 'Protocol Hero Title', type: 'text', defaultValue: value('protocolHeroTitle') },
    { input: 'input', name: 'protocolIntroTitle', label: 'Protocol page intro title', type: 'text', defaultValue: value('protocolIntroTitle') },
    { input: 'textarea', name: 'protocolIntroBody', label: 'Protocol page intro body', defaultValue: value('protocolIntroBody') },
    { input: 'input', name: 'protocolCtaTitle', label: 'Protocol page CTA title', type: 'text', defaultValue: value('protocolCtaTitle') },
    { input: 'textarea', name: 'protocolCtaBody', label: 'Protocol page CTA body', defaultValue: value('protocolCtaBody') },
    { input: 'input', name: 'aboutHeroImage', label: 'About Hero Image', type: 'text', defaultValue: value('aboutHeroImage') },
    { input: 'textarea', name: 'aboutHeroTitle', label: 'About Hero Title', defaultValue: value('aboutHeroTitle') },
    { input: 'input', name: 'aboutPurposeTitle', label: 'My True Purpose Title', type: 'text', defaultValue: value('aboutPurposeTitle') },
    { input: 'input', name: 'aboutPurposeVideoUrl', label: 'My True Purpose Video URL', type: 'url', defaultValue: value('aboutPurposeVideoUrl') },
    { input: 'input', name: 'aboutPurposeButtonText', label: 'My True Purpose Button Text', type: 'text', defaultValue: value('aboutPurposeButtonText') },
    { input: 'input', name: 'aboutPurposeButtonUrl', label: 'My True Purpose Button URL', type: 'url', defaultValue: value('aboutPurposeButtonUrl') },
    { input: 'textarea', name: 'podcastEmbedIframe', label: 'Podcast Embed Iframe', placeholder: 'Paste the complete iframe embed code from Apple Podcasts, Spotify, YouTube, Buzzsprout, Libsyn, RSS.com, or any podcast platform.', defaultValue: value('podcastEmbedIframe') },
    { input: 'input', name: 'podcastHeroImage', label: 'Podcast Page Hero Image', type: 'text', defaultValue: value('podcastHeroImage') },
    { input: 'input', name: 'podcastRankAppleLabel', label: 'Podcast Stat: Apple label', type: 'text', defaultValue: value('podcastRankAppleLabel') },
    { input: 'input', name: 'podcastRankSpotifyLabel', label: 'Podcast Stat: Spotify label', type: 'text', defaultValue: value('podcastRankSpotifyLabel') },
    { input: 'input', name: 'podcastDownloadsLabel', label: 'Podcast Stat: Downloads label', type: 'text', defaultValue: value('podcastDownloadsLabel') },
    { input: 'input', name: 'podcastGuestFormHeading', label: 'Podcast Guest Form Heading', type: 'text', defaultValue: value('podcastGuestFormHeading') },
  ];
}

// Purely a dashboard presentation grouping — every defaultsRow key (besides
// id) must appear in exactly one group, checked by the assertion below. Does
// not affect the DB schema, toRow(), or the flat array buildFields() returns.
// Groups titled "Shared — ..." control a section that's rendered on more
// than one page from the same field (verified by grepping `site.<field>`
// usage across src/pages/*.astro) — editing it there changes every page
// listed, not just one. Titles name every page affected so that isn't a
// surprise. Page-specific groups (no "Shared" prefix) only ever render on
// that one dedicated page.
export const fieldGroups = [
  { title: 'General', fields: ['siteName', 'tagline', 'youtubeChannelUrl', 'copyrightYear'] },
  { title: 'Social Links', fields: ['socialInstagram', 'socialFacebook', 'socialX', 'socialYoutube', 'socialTikTok'] },
  { title: 'Homepage — Hero Image', fields: ['heroImage'] },
  { title: 'Homepage — Podcast Preview Background', fields: ['podcastBgImagenew'] },
  { title: 'Shared — Stats Section (Home + Protocol)', fields: ['statFollowers', 'statExperience', 'statCredentials', 'statsHeading', 'statsBody'] },
  { title: 'Shared — Podcast Preview (Home + Protocol + Podcast Page hero)', fields: ['podcastBgImage', 'podcastHeroTitle', 'podcastHeroSubtitle'] },
  { title: 'Shared — About Preview (Home + Protocol)', fields: ['aboutImage', 'aboutTitle', 'aboutDescription'] },
  { title: 'Shared — YouTube Section Heading (Home + Protocol)', fields: ['youtubeSectionHeading'] },
  { title: 'Shared — Trusted Partners Preview (Home + Protocol)', fields: ['partnersSectionHeading', 'partnersSectionSubtitle'] },
  { title: 'Shared — Testimonials (Home + Protocol + Testimonials page)', fields: ['testimonialsBgImage', 'testimonialsHeroTitle'] },
  { title: 'Protocol Page', fields: ['protocolHeroImage', 'protocolHeroTitle', 'protocolIntroTitle', 'protocolIntroBody', 'protocolCtaTitle', 'protocolCtaBody'] },
  { title: 'Partners Page', fields: ['partnersHeroImage', 'partnersHeroTitle', 'partnersHeroSubtitle', 'partnerFormImage', 'partnerFormHeading'] },
  { title: 'Podcast Page', fields: ['podcastGuestImage', 'podcastEmbedIframe', 'podcastHeroImage', 'podcastRankApple', 'podcastRankSpotify', 'podcastDownloads', 'podcastRankAppleLabel', 'podcastRankSpotifyLabel', 'podcastDownloadsLabel', 'podcastGuestFormHeading'] },
  { title: 'About Page', fields: ['aboutHeroImage', 'aboutHeroTitle', 'aboutPurposeTitle', 'aboutPurposeVideoUrl', 'aboutPurposeButtonText', 'aboutPurposeButtonUrl'] },
];

const columns = Object.keys(defaultsRow).filter((c) => c !== 'id');

// Guards against a field silently going missing from the admin UI (grouped
// nowhere) or being listed in two groups at once, whenever a column is added.
{
  const grouped = fieldGroups.flatMap((g) => g.fields);
  const missing = columns.filter((c) => !grouped.includes(c));
  const duplicated = grouped.filter((name, i) => grouped.indexOf(name) !== i);
  if (missing.length > 0) throw new Error(`fieldGroups is missing columns: ${missing.join(', ')}`);
  if (duplicated.length > 0) throw new Error(`fieldGroups lists columns more than once: ${duplicated.join(', ')}`);
}

export function toRow(formData) {
  const row = {};
  for (const col of columns) {
    row[col] = col === 'copyrightYear'
      ? (formData.get(col) ? intValue(formData.get(col), null) : null)
      : textValue(formData.get(col));
  }
  return row;
}
