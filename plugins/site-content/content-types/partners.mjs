import { checkboxValue, intValue, textValue } from '../lib/normalize.mjs';

export const identifier = 'site-content/partner';
export const label = 'Partner';
export const tableName = 'plugin_partners';
export const endpointFile = 'partners.mjs';

export const createTableSQL = `
  CREATE TABLE IF NOT EXISTS plugin_partners (
    pageId varchar(191) NOT NULL PRIMARY KEY,
    icon text NOT NULL,
    logo text,
    href text NOT NULL,
    discountLabel text,
    couponCode text,
    \`order\` int NOT NULL DEFAULT 99,
    active int NOT NULL DEFAULT 1
  )
`;

export const fields = [
  { input: 'input', name: 'icon', label: 'Icon (Font Awesome class)', type: 'text', defaultValue: 'fa-star' },
  { input: 'input', name: 'logo', label: 'Logo image path', type: 'text' },
  { input: 'input', name: 'href', label: 'Partner URL', type: 'url', required: true },
  { input: 'input', name: 'discountLabel', label: 'Discount label', type: 'text' },
  { input: 'input', name: 'couponCode', label: 'Coupon code', type: 'text' },
  { input: 'input', name: 'order', label: 'Sort order', type: 'number', defaultValue: '99' },
  { input: 'checkbox', name: 'active', label: 'Active', defaultChecked: true },
];

export const defaultsRow = {
  icon: 'fa-star',
  logo: null,
  href: '',
  discountLabel: null,
  couponCode: null,
  order: 99,
  active: 1,
};

export function toRow(pluginFields) {
  return {
    icon: textValue(pluginFields.icon, 'fa-star'),
    logo: textValue(pluginFields.logo),
    href: textValue(pluginFields.href, ''),
    discountLabel: textValue(pluginFields.discountLabel),
    couponCode: textValue(pluginFields.couponCode),
    order: intValue(pluginFields.order, 99),
    active: checkboxValue(pluginFields.active) ? 1 : 0,
  };
}
