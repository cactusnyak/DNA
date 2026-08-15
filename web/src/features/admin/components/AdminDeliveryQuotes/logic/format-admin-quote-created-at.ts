const ADMIN_QUOTE_CREATED_AT_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatAdminQuoteCreatedAt(createdAt: string) {
  return ADMIN_QUOTE_CREATED_AT_FORMATTER.format(new Date(createdAt));
}
