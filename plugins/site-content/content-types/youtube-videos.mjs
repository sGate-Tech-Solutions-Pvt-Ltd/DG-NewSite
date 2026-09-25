import { checkboxValue, intValue, textValue } from '../lib/normalize.mjs';

export const identifier = 'site-content/youtube-video';
export const label = 'YouTube Video';
export const tableName = 'plugin_youtube_videos';
export const endpointFile = 'youtube-videos.mjs';

export const createTableSQL = `
  CREATE TABLE IF NOT EXISTS plugin_youtube_videos (
    pageId varchar(191) NOT NULL PRIMARY KEY,
    videoId text NOT NULL,
    thumbnail text NOT NULL,
    \`order\` int NOT NULL DEFAULT 99,
    featured int NOT NULL DEFAULT 0
  )
`;

export const fields = [
  { input: 'input', name: 'videoId', label: 'YouTube video ID', type: 'text', required: true },
  { input: 'input', name: 'thumbnail', label: 'Thumbnail image path', type: 'text', required: true },
  { input: 'input', name: 'order', label: 'Sort order', type: 'number', defaultValue: '99' },
  { input: 'checkbox', name: 'featured', label: 'Featured' },
];

export const defaultsRow = {
  videoId: '',
  thumbnail: '',
  order: 99,
  featured: 0,
};

export function toRow(pluginFields) {
  return {
    videoId: textValue(pluginFields.videoId, ''),
    thumbnail: textValue(pluginFields.thumbnail, ''),
    order: intValue(pluginFields.order, 99),
    featured: checkboxValue(pluginFields.featured) ? 1 : 0,
  };
}
