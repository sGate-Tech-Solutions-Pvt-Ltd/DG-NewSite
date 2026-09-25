// FormData/pluginFields coercion helpers.
// HTML forms never submit an unchecked checkbox at all — it's simply absent
// from the object, not `false` and not `null`. Checked shows up as `'on'`.
export function checkboxValue(value) {
  return value === 'on' || value === 'true' || value === '1';
}

export function intValue(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function textValue(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  const str = String(value).trim();
  return str.length > 0 ? str : fallback;
}
