import { buildDeliveryQuoteRequestEmail } from './delivery-quote-email.template';

describe('buildDeliveryQuoteRequestEmail', () => {
  it('includes the identifiers and customer delivery details in readable text', () => {
    const email = buildDeliveryQuoteRequestEmail({
      requestId: 'quote-123',
      productId: 'product-456',
      productName: 'Большой шкаф',
      customerName: 'Иван Иванов',
      customerPhone: '+7 999 000-00-00',
      deliveryAddress: 'Москва, Москва, ул. Тверская, 1',
      requestedAt: new Date('2026-08-05T10:15:30.000Z'),
    });

    expect(email.text).toContain('ID заказа: Заказ ещё не создан');
    expect(email.text).toContain('ID заявки на расчёт: quote-123');
    expect(email.text).toContain('ID товара: product-456');
    expect(email.text).toContain('Название товара: Большой шкаф');
    expect(email.text).toContain('Имя покупателя: Иван Иванов');
    expect(email.text).toContain('Телефон покупателя: +7 999 000-00-00');
    expect(email.text).toContain(
      'Адрес доставки: Москва, Москва, ул. Тверская, 1',
    );
    expect(email.text).toContain('Время запроса: 2026-08-05T10:15:30.000Z');
  });

  it('escapes user-controlled values in HTML', () => {
    const email = buildDeliveryQuoteRequestEmail({
      requestId: 'quote-123',
      productId: 'product-456',
      productName: '<script>alert(1)</script>',
      customerName: 'Customer',
      customerPhone: '+70000000000',
      deliveryAddress: 'Address',
      requestedAt: new Date('2026-08-05T10:15:30.000Z'),
    });

    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
