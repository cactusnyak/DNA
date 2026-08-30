/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DeliveryProviderError } from './delivery-provider.error';
import { DeliveryLocationResolver } from './delivery-location.resolver';

describe('DeliveryLocationResolver', () => {
  it('returns deterministic coordinates only when every contour is mock', async () => {
    const resolver = new DeliveryLocationResolver(
      { expressMode: 'mock', russiaMode: 'mock' } as any,
      { detectLocation: jest.fn() } as any,
    );
    const first = await resolver.resolve('Москва, Тверская, 1');
    const second = await resolver.resolve('Москва, Тверская, 1');
    expect(first).toEqual(second);
    expect(first.capabilities.cargo).toBe(true);
  });

  it('uses Russia location detection without inventing live coordinates', async () => {
    const detectLocation = jest.fn().mockResolvedValue({
      variants: [{ geo_id: 213, address: 'Москва' }],
    });
    const resolver = new DeliveryLocationResolver(
      { expressMode: 'production', russiaMode: 'sandbox' } as any,
      { detectLocation } as any,
    );
    const result = await resolver.resolve('Москва, Тверская, 1');
    expect(result).not.toHaveProperty('latitude');
    expect(result).not.toHaveProperty('longitude');
    expect(result).toMatchObject({
      externalLocationId: 'yandex-russia-geo:213',
      capabilities: { cargo: false, russiaDoor: true },
    });
  });

  it('rejects ambiguous live locations', async () => {
    const resolver = new DeliveryLocationResolver(
      { expressMode: 'production', russiaMode: 'production' } as any,
      {
        detectLocation: jest.fn().mockResolvedValue({
          variants: [
            { geo_id: 1, address: 'Город 1' },
            { geo_id: 2, address: 'Город 2' },
          ],
        }),
      } as any,
    );
    await expect(resolver.resolve('Город')).rejects.toMatchObject<
      Partial<DeliveryProviderError>
    >({
      code: 'ADDRESS_AMBIGUOUS',
    });
  });
});
