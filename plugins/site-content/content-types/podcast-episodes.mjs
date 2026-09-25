import { checkboxValue, intValue, textValue } from '../lib/normalize.mjs';

export const identifier = 'site-content/podcast-episode';
export const label = 'Podcast Episode';
export const tableName = 'plugin_podcast_episodes';
export const endpointFile = 'podcast-episodes.mjs';

export const createTableSQL = `
  CREATE TABLE IF NOT EXISTS plugin_podcast_episodes (
    pageId varchar(191) NOT NULL PRIMARY KEY,
    episodeNumber int NOT NULL,
    dateDuration text NOT NULL,
    thumbnail text NOT NULL,
    listenUrl text,
    excerpt text,
    publishedAt text NOT NULL,
    featured int NOT NULL DEFAULT 0,
    UNIQUE KEY plugin_podcast_episodes_episodeNumber (episodeNumber)
  )
`;

export const fields = [
  { input: 'input', name: 'episodeNumber', label: 'Episode number', type: 'number', required: true },
  { input: 'input', name: 'dateDuration', label: 'Day & duration (e.g. "SAT - 1H 6M")', type: 'text', required: true },
  { input: 'input', name: 'thumbnail', label: 'Thumbnail image path', type: 'text', defaultValue: '/images/podcast-default.png' },
  { input: 'input', name: 'listenUrl', label: 'Listen URL', type: 'url' },
  { input: 'textarea', name: 'excerpt', label: 'Excerpt' },
  { input: 'input', name: 'publishedAt', label: 'Published date (YYYY-MM-DD)', type: 'text', required: true },
  { input: 'checkbox', name: 'featured', label: 'Featured' },
];

// A fixed placeholder like 0 would collide (episodeNumber is UNIQUE) if two
// episodes are created before either is edited — use a large, effectively
// unique placeholder derived from the current time instead. onEdit's upsert
// (see lib/handlers.mjs) replaces this with the real value on first save.
export const defaultsRow = {
  episodeNumber: -Math.floor(Date.now() / 1000),
  dateDuration: '',
  thumbnail: '/images/podcast-default.png',
  listenUrl: null,
  excerpt: null,
  publishedAt: new Date().toISOString().slice(0, 10),
  featured: 0,
};

export function toRow(pluginFields) {
  return {
    episodeNumber: intValue(pluginFields.episodeNumber, 0),
    dateDuration: textValue(pluginFields.dateDuration, ''),
    thumbnail: textValue(pluginFields.thumbnail, '/images/podcast-default.png'),
    listenUrl: textValue(pluginFields.listenUrl),
    excerpt: textValue(pluginFields.excerpt),
    publishedAt: textValue(pluginFields.publishedAt, new Date().toISOString().slice(0, 10)),
    featured: checkboxValue(pluginFields.featured) ? 1 : 0,
  };
}
