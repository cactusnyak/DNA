import { DeliveryProviderRegistry } from './delivery-provider.registry';

describe('DeliveryProviderRegistry', () => {
  it('resolves an adapter by provider code and rejects unknown providers', () => {
    const yandex = { providerCode: 'YANDEX' };
    const registry = new DeliveryProviderRegistry(yandex as never);
    expect(registry.get('YANDEX')).toBe(yandex);
    expect(() => registry.get('UNKNOWN')).toThrow('не поддерживается');
  });
});
