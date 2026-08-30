import {
  LOGISTICS_UI_MARKUP,
  LOGISTICS_UI_PRODUCTS,
  LOGISTICS_UI_WAREHOUSES,
} from '../../prisma/seeds/logistig-test/seed-data';

describe('logistig-test seed matrix', () => {
  it('defines the minimal warehouse matrix', () => {
    expect(LOGISTICS_UI_WAREHOUSES).toHaveLength(3);
    expect(new Set(LOGISTICS_UI_WAREHOUSES.map(({ code }) => code)).size).toBe(
      3,
    );
    const originA = LOGISTICS_UI_WAREHOUSES.find(
      ({ code }) => code === 'logistics-ui-origin-a',
    )!;
    const originB = LOGISTICS_UI_WAREHOUSES.find(
      ({ code }) => code === 'logistics-ui-origin-b',
    )!;
    const clone = LOGISTICS_UI_WAREHOUSES.find(
      ({ code }) => code === 'logistics-ui-origin-a-clone',
    )!;
    expect({
      address: clone.fullAddress,
      latitude: clone.latitude,
      longitude: clone.longitude,
      externalLocationId: clone.externalLocationId,
    }).toEqual({
      address: originA.fullAddress,
      latitude: originA.latitude,
      longitude: originA.longitude,
      externalLocationId: originA.externalLocationId,
    });
    expect(originB.fullAddress).not.toBe(originA.fullAddress);
    expect(originB.externalLocationId).not.toBe(originA.externalLocationId);
  });

  it('defines exactly the intended seven-product service matrix', () => {
    expect(LOGISTICS_UI_PRODUCTS).toHaveLength(7);
    expect(new Set(LOGISTICS_UI_PRODUCTS.map(({ slug }) => slug)).size).toBe(7);
    expect(new Set(LOGISTICS_UI_PRODUCTS.map(({ sku }) => sku)).size).toBe(7);
    const services = Object.fromEntries(
      LOGISTICS_UI_PRODUCTS.map(({ slug, serviceCodes }) => [
        slug,
        [...serviceCodes],
      ]),
    );
    expect(services).toEqual({
      'logistics-ui-service-ab': [
        'YANDEX_EXPRESS',
        'YANDEX_CARGO',
        'CDEK_COURIER',
      ],
      'logistics-ui-service-b': ['YANDEX_CARGO'],
      'logistics-ui-service-c': ['CDEK_COURIER'],
      'logistics-ui-origin-b-cargo': ['YANDEX_CARGO', 'CDEK_COURIER'],
      'logistics-ui-origin-clone-cargo': ['YANDEX_CARGO', 'CDEK_COURIER'],
      'logistics-ui-oversized': [],
      'logistics-ui-unavailable': [],
    });
    expect(
      LOGISTICS_UI_PRODUCTS.filter(({ isOversized }) => isOversized).map(
        ({ slug }) => slug,
      ),
    ).toEqual(['logistics-ui-oversized']);
    expect(
      LOGISTICS_UI_PRODUCTS.every(
        ({ serviceCodes }) => !serviceCodes.includes('YANDEX_RUSSIA_PICKUP'),
      ),
    ).toBe(true);
    expect(
      LOGISTICS_UI_PRODUCTS.every(
        ({ serviceCodes }) => !serviceCodes.includes('CDEK_PICKUP'),
      ),
    ).toBe(true);
    expect(
      LOGISTICS_UI_PRODUCTS.find(
        ({ slug }) => slug === 'logistics-ui-oversized',
      )?.serviceCodes,
    ).toEqual([]);
    expect(LOGISTICS_UI_MARKUP).toBe(100);
  });
});
