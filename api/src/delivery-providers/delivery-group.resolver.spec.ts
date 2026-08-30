import {
  DeliveryGroupResolver,
  type DeliveryResolverItem,
} from './delivery-group.resolver';

const item = (
  id: string,
  warehouseId: string,
  services: string[],
  oversized = false,
): DeliveryResolverItem => ({
  id,
  title: id,
  quantity: 1,
  isOversized: oversized,
  warehouse: {
    id: warehouseId,
    name: warehouseId,
    isActive: true,
    isConfigured: true,
  },
  hasShippingProfile: true,
  hasValidPackages: true,
  serviceIds: services,
});

describe('DeliveryGroupResolver', () => {
  const resolver = new DeliveryGroupResolver();

  it('creates one group for a warehouse with a common service', () => {
    const result = resolver.resolve('order', 1, [
      item('a', 'w', ['s']),
      item('b', 'w', ['s', 'x']),
    ]);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].commonServiceIds).toEqual(['s']);
  });

  it('creates groups for separate warehouses', () => {
    expect(
      resolver.resolve('order', 1, [
        item('a', 'w1', ['s']),
        item('b', 'w2', ['s']),
      ]).groups,
    ).toHaveLength(2);
  });

  it('splits incompatible service sets without duplicating items', () => {
    const result = resolver.resolve('order', 1, [
      item('a', 'w', ['a']),
      item('b', 'w', ['b']),
      item('c', 'w', ['a', 'b']),
    ]);
    expect(result.groups).toHaveLength(2);
    expect(
      result.groups
        .flatMap((group) => group.items.map((value) => value.id))
        .sort(),
    ).toEqual(['a', 'b', 'c']);
  });

  it('is stable regardless of input order', () => {
    const values = [
      item('a', 'w', ['a']),
      item('b', 'w', ['b']),
      item('c', 'w', ['a', 'b']),
    ];
    expect(
      resolver
        .resolve('order', 2, values)
        .groups.map((group) => group.groupKey),
    ).toEqual(
      resolver
        .resolve('order', 2, [...values].reverse())
        .groups.map((group) => group.groupKey),
    );
  });

  it('reports items without services and excludes oversized items', () => {
    const result = resolver.resolve('order', 1, [
      item('missing', 'w', []),
      item('oversized', 'w', ['s'], true),
    ]);
    expect(result.groups).toHaveLength(0);
    expect(result.unavailableItems.map((value) => value.orderItemId)).toEqual([
      'missing',
    ]);
  });

  it('partitions the primary logistics UI seed scenario into four parts', () => {
    const result = resolver.resolve('order', 1, [
      item('product-1', 'origin-a', ['express', 'cargo']),
      item('product-2', 'origin-a', ['cargo']),
      item('product-3', 'origin-a', ['russia-door']),
      item('product-4', 'origin-b', ['cargo']),
      item('product-5', 'origin-a-clone', ['cargo']),
      item('product-6', 'origin-a', [], true),
    ]);

    expect(result.unavailableItems).toEqual([]);
    expect(result.groups).toHaveLength(4);
    expect(
      result.groups
        .map((group) => ({
          warehouseId: group.warehouse.id,
          itemIds: group.items.map(({ id }) => id),
          commonServiceIds: group.commonServiceIds,
        }))
        .sort((first, second) =>
          first.itemIds.join(',').localeCompare(second.itemIds.join(',')),
        ),
    ).toEqual([
      {
        warehouseId: 'origin-a',
        itemIds: ['product-1', 'product-2'],
        commonServiceIds: ['cargo'],
      },
      {
        warehouseId: 'origin-a',
        itemIds: ['product-3'],
        commonServiceIds: ['russia-door'],
      },
      {
        warehouseId: 'origin-b',
        itemIds: ['product-4'],
        commonServiceIds: ['cargo'],
      },
      {
        warehouseId: 'origin-a-clone',
        itemIds: ['product-5'],
        commonServiceIds: ['cargo'],
      },
    ]);
  });
});
