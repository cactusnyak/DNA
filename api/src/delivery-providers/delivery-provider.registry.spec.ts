import { DeliveryProviderRegistry } from './delivery-provider.registry';

describe('DeliveryProviderRegistry', () => {
  it('resolves an adapter by provider code and rejects unknown providers', () => {
    const yandex = { providerCode: 'YANDEX' };
    const cdek = { providerCode: 'CDEK' };
    const registry = new DeliveryProviderRegistry(
      yandex as never,
      cdek as never,
    );
    expect(registry.get('YANDEX')).toBe(yandex);
    expect(registry.get('CDEK')).toBe(cdek);
    expect(() => registry.get('UNKNOWN')).toThrow('не поддерживается');
  });
});
