import { allocateWholeRubles, calculateReward } from './reward-calculation';

const shares = [
  { depth: 0, shareBasisPoints: 1000 },
  { depth: 1, shareBasisPoints: 6000 },
  { depth: 2, shareBasisPoints: 3000 },
];

describe('calculateReward', () => {
  it.each([
    [0, 0],
    [-1, 0],
    [100, null],
    [100, -1],
    [100, 100],
    [100, 120],
  ])('returns zero for invalid revenue/cost (%s, %s)', (revenue, cost) => {
    expect(
      calculateReward({
        eligibleRevenue: revenue,
        costBasis: cost,
        rewardEnabled: true,
        shares,
      }).rewardBudget,
    ).toBe(0);
  });

  it('implements canonical example A', () => {
    expect(
      calculateReward({
        eligibleRevenue: 100_000,
        costBasis: 90_000,
        rewardEnabled: true,
        shares,
      }),
    ).toMatchObject({
      grossProfit: 10_000,
      marginBasisPoints: 1000,
      coefficientBasisPoints: 1500,
      rewardBudget: 1500,
      distributions: [
        { depth: 0, amount: 150 },
        { depth: 1, amount: 900 },
        { depth: 2, amount: 450 },
      ],
    });
  });

  it('implements canonical example B and the 5% cap', () => {
    expect(
      calculateReward({
        eligibleRevenue: 100_000,
        costBasis: 50_000,
        rewardEnabled: true,
        shares,
      }),
    ).toMatchObject({ rewardBudget: 5000, coefficientBasisPoints: 6100 });
  });

  it.each([
    [10_001, 9_002],
    [10_000, 9_000],
    [10_000, 8_999],
    [10_001, 7_002],
    [10_000, 7_000],
    [10_000, 6_999],
  ])('is deterministic around coefficient boundaries', (revenue, cost) => {
    const result = calculateReward({
      eligibleRevenue: revenue,
      costBasis: cost,
      rewardEnabled: true,
      shares,
    });
    expect(Number.isInteger(result.rewardBudget)).toBe(true);
    expect(result.coefficientBasisPoints).toBeLessThanOrEqual(7500);
  });

  it('does not reward bonus-paid or delivery value when excluded by caller', () => {
    const result = calculateReward({
      eligibleRevenue: 700,
      costBasis: 500,
      rewardEnabled: true,
      shares,
    });
    expect(result.eligibleRevenue).toBe(700);
    expect(result.rewardBudget).toBeLessThanOrEqual(35);
  });

  it('keeps distribution rounding remainder with the platform', () => {
    const result = calculateReward({
      eligibleRevenue: 101,
      costBasis: 90,
      rewardEnabled: true,
      shares,
    });
    expect(
      result.distributions.reduce((sum, item) => sum + item.amount, 0),
    ).toBeLessThanOrEqual(result.rewardBudget);
  });
});

describe('allocateWholeRubles', () => {
  it('allocates deterministically and preserves total', () => {
    expect(
      allocateWholeRubles(30, [
        { id: 'a', eligibleAmount: 70 },
        { id: 'b', eligibleAmount: 30 },
      ]),
    ).toEqual([
      { id: 'a', amount: 21 },
      { id: 'b', amount: 9 },
    ]);
  });
});
