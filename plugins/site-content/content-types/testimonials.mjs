import { checkboxValue, intValue, textValue } from '../lib/normalize.mjs';

export const identifier = 'site-content/testimonial';
export const label = 'Testimonial';
export const tableName = 'plugin_testimonials';
export const endpointFile = 'testimonials.mjs';

export const createTableSQL = `
  CREATE TABLE IF NOT EXISTS plugin_testimonials (
    pageId varchar(191) NOT NULL PRIMARY KEY,
    authorTitle text NOT NULL,
    initials text NOT NULL,
    quote text NOT NULL,
    avatar text,
    featured int NOT NULL DEFAULT 0,
    \`order\` int NOT NULL DEFAULT 99
  )
`;

export const fields = [
  { input: 'input', name: 'authorTitle', label: "Author's title/role", type: 'text', required: true },
  { input: 'input', name: 'initials', label: 'Initials (max 3 chars)', type: 'text', required: true },
  { input: 'textarea', name: 'quote', label: 'Quote', required: true },
  { input: 'input', name: 'avatar', label: 'Avatar image path', type: 'text' },
  { input: 'checkbox', name: 'featured', label: 'Featured' },
  { input: 'input', name: 'order', label: 'Sort order', type: 'number', defaultValue: '99' },
];

export const defaultsRow = {
  authorTitle: '',
  initials: '',
  quote: '',
  avatar: null,
  featured: 0,
  order: 99,
};

export function toRow(pluginFields) {
  return {
    authorTitle: textValue(pluginFields.authorTitle, ''),
    initials: textValue(pluginFields.initials, '').slice(0, 3),
    quote: textValue(pluginFields.quote, ''),
    avatar: textValue(pluginFields.avatar),
    featured: checkboxValue(pluginFields.featured) ? 1 : 0,
    order: intValue(pluginFields.order, 99),
  };
}
