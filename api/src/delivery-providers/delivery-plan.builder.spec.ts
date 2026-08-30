import {
  DELIVERY_PLAN_LIMITS,
  DeliveryPlanBuilder,
  type DeliveryPlanBuildInput,
  type DeliveryPlanGroup,
} from './delivery-plan.builder';

describe('DeliveryPlanBuilder', () => {
  const builder = new DeliveryPlanBuilder();
  const now = new Date('2026-08-20T12:00:00.000Z');
  const quote = (
    id: string,
    price: number,
    provider = 'A',
    hours = 4,
    fulfillmentType: 'DOOR' | 'PICKUP' = 'DOOR',
  ): DeliveryPlanGroup['quotes'][number] => ({
    quoteId: id,
    provider: { code: provider, name: `Provider ${provider}` },
    service: { code: `SERVICE_${provider}`, name: 'Door', fulfillmentType },
    customerPrice: price,
    currency: 'RUB',
    deliveryInterval: {
      from: new Date(now.getTime() + 3_600_000).toISOString(),
      to: new Date(now.getTime() + hours * 3_600_000).toISOString(),
    },
    expiresAt: new Date(now.getTime() + 600_000).toISOString(),
  });
  const group = (
    key: string,
    quotes: DeliveryPlanGroup['quotes'],
  ): DeliveryPlanGroup => ({
    groupKey: key,
    items: [{ orderItemId: `item-${key}`, title: `Item ${key}`, quantity: 1 }],
    quotes,
  });
  const input = (groups: DeliveryPlanGroup[]): DeliveryPlanBuildInput => ({
    groups,
    destinationVersion: 2,
    deliveryVersion: 3,
    pricingVersion: 4,
  });

  beforeEach(() => jest.useFakeTimers().setSystemTime(now));
  afterEach(() => jest.useRealTimers());

  it('builds one plan for one group and one quote', () => {
    const plans = builder.build(input([group('g1', [quote('q1', 500)])]));
    expect(plans).toHaveLength(1);
    expect(plans[0]).toMatchObject({ customerPrice: 500, shipmentCount: 1 });
    expect(plans[0].badges).toEqual(['RECOMMENDED', 'CHEAPEST', 'FASTEST']);
  });

  it('ranks cheapest and fastest options without duplicates', () => {
    const plans = builder.build(
      input([
        group('g1', [quote('cheap', 300, 'A', 8), quote('fast', 600, 'B', 2)]),
      ]),
    );
    expect(
      plans.find((plan) => plan.badges.includes('CHEAPEST'))?.customerPrice,
    ).toBe(300);
    expect(
      plans.find((plan) => plan.badges.includes('FASTEST'))?.customerPrice,
    ).toBe(600);
    expect(new Set(plans.map((plan) => plan.planId)).size).toBe(plans.length);
  });

  it('sums two groups of the same provider into one provider-titled plan', () => {
    const [plan] = builder.build(
      input([group('g1', [quote('q1', 300)]), group('g2', [quote('q2', 400)])]),
    );
    expect(plan).toMatchObject({
      customerPrice: 700,
      shipmentCount: 2,
      title: 'Provider A',
    });
  });

  it('supports provider-neutral mixed-provider plans', () => {
    const [plan] = builder.build(
      input([
        group('g1', [quote('q1', 300, 'A')]),
        group('g2', [quote('q2', 400, 'Б')]),
        group('g3', [quote('q3', 500, 'C')]),
      ]),
    );
    expect(plan.title).toBe('Оптимальная доставка');
    expect(plan.parts.map((part) => part.provider.code)).toEqual([
      'A',
      'Б',
      'C',
    ]);
  });

  it('prefers fewer distinct providers for recommended', () => {
    const plans = builder.build(
      input([
        group('g1', [quote('a1', 500, 'A'), quote('b1', 300, 'Б')]),
        group('g2', [quote('a2', 500, 'A'), quote('c2', 300, 'C')]),
      ]),
    );
    const recommended = plans.find((plan) =>
      plan.badges.includes('RECOMMENDED'),
    )!;
    expect(
      new Set(recommended.parts.map((part) => part.provider.code)).size,
    ).toBe(1);
  });

  it('uses a deterministic plan id and changes it with versions', () => {
    const value = input([group('g1', [quote('q1', 500)])]);
    expect(builder.build(value)[0].planId).toBe(builder.build(value)[0].planId);
    expect(builder.build(value)[0].planId).not.toBe(
      builder.build({ ...value, deliveryVersion: 4 })[0].planId,
    );
  });

  it('excludes pickup until a pickup point flow exists', () => {
    expect(
      builder.build(
        input([group('g1', [quote('pickup', 100, 'A', 2, 'PICKUP')])]),
      ),
    ).toEqual([]);
  });

  it('invalidates a plan when one group quote expires', () => {
    const expired = {
      ...quote('old', 100),
      expiresAt: new Date(now.getTime() - 1).toISOString(),
    };
    expect(
      builder.build(
        input([group('g1', [quote('q1', 100)]), group('g2', [expired])]),
      ),
    ).toEqual([]);
  });

  it('bounds candidates, combinations and public plans', () => {
    const quotes = Array.from({ length: 12 }, (_, index) =>
      quote(`q${index}`, index + 1, `${index}`),
    );
    const plans = builder.build(
      input([
        group('g1', quotes),
        group(
          'g2',
          quotes.map((value) => ({ ...value, quoteId: `x${value.quoteId}` })),
        ),
      ]),
    );
    expect(plans.length).toBeLessThanOrEqual(DELIVERY_PLAN_LIMITS.publicPlans);
    expect(plans.every((plan) => plan.selections.length === 2)).toBe(true);
  });

  it('does not expose the internal selection bundle', () => {
    const [plan] = builder.build(
      input([group('g1', [quote('secret-quote', 500)])]),
    );
    expect(builder.toPublic(plan)).not.toHaveProperty('selections');
    expect(JSON.stringify(builder.toPublic(plan))).not.toContain('groupKey');
    expect(JSON.stringify(builder.toPublic(plan))).not.toContain(
      'secret-quote',
    );
  });
});
