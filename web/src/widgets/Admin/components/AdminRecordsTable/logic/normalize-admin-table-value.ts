export function normalizeAdminTableValue(value: unknown) {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value ?? '').trim().toLowerCase();
}
