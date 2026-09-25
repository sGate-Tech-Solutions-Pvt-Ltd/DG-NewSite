import { intValue, textValue } from '../lib/normalize.mjs';

export const identifier = 'site-content/protocol-item';
export const label = 'Protocol Item';
export const tableName = 'plugin_protocol_items';
export const endpointFile = 'protocol-items.mjs';

export const createTableSQL = `
  CREATE TABLE IF NOT EXISTS plugin_protocol_items (
    pageId varchar(191) NOT NULL PRIMARY KEY,
    icon text NOT NULL,
    \`order\` int NOT NULL DEFAULT 99
  )
`;

export const fields = [
  { input: 'input', name: 'icon', label: 'Icon (Font Awesome class)', type: 'text', required: true },
  { input: 'input', name: 'order', label: 'Sort order', type: 'number', defaultValue: '99' },
];

export const defaultsRow = {
  icon: 'fa-star',
  order: 99,
};

export function toRow(pluginFields) {
  return {
    icon: textValue(pluginFields.icon, 'fa-star'),
    order: intValue(pluginFields.order, 99),
  };
}
