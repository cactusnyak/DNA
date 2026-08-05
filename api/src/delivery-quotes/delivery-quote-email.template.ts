type DeliveryQuoteEmailDetails = {
  requestId: string;
  productId: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  requestedAt: Date;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export function buildDeliveryQuoteRequestEmail(
  details: DeliveryQuoteEmailDetails,
) {
  const requestedAt = details.requestedAt.toISOString();
  const fields = [
    ['ID заказа', 'Заказ ещё не создан'],
    ['ID заявки на расчёт', details.requestId],
    ['ID товара', details.productId],
    ['Название товара', details.productName],
    ['Имя покупателя', details.customerName],
    ['Телефон покупателя', details.customerPhone],
    ['Адрес доставки', details.deliveryAddress],
    ['Время запроса', requestedAt],
  ] as const;

  return {
    subject: `Новый запрос на расчёт доставки — ${details.productName}`,
    text: [
      'Получен новый запрос на расчёт стоимости крупногабаритной доставки.',
      '',
      ...fields.map(([label, value]) => `${label}: ${value}`),
    ].join('\n'),
    html: [
      '<p>Получен новый запрос на расчёт стоимости крупногабаритной доставки.</p>',
      '<dl>',
      ...fields.map(
        ([label, value]) =>
          `<dt><strong>${escapeHtml(label)}</strong></dt><dd>${escapeHtml(value)}</dd>`,
      ),
      '</dl>',
    ].join(''),
  };
}
