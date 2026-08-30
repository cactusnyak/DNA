export const REWARD_POLICY_VERSION = 1;
export const MAX_REWARD_BUDGET_BASIS_POINTS = 500;
export const MAX_BONUS_PAYMENT_BASIS_POINTS = 3000;

export type RewardShare = {
  depth: number;
  shareBasisPoints: number;
};

export type RewardCalculation = {
  eligibleRevenue: number;
  costBasis: number | null;
  grossProfit: number;
  marginBasisPoints: number;
  coefficientBasisPoints: number;
  rewardBudget: number;
  distributions: Array<RewardShare & { amount: number }>;
};

function assertWholeRubles(value: number, field: string) {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${field} must be a safe whole-ruble integer`);
  }
}

function floorRatio(numerator: bigint, denominator: bigint) {
  return Number(numerator / denominator);
}

export function calculateReward(params: {
  eligibleRevenue: number;
  costBasis: number | null;
  rewardEnabled: boolean;
  shares: RewardShare[];
}): RewardCalculation {
  const { eligibleRevenue, costBasis, rewardEnabled, shares } = params;
  assertWholeRubles(eligibleRevenue, 'eligibleRevenue');
  if (costBasis != null) assertWholeRubles(costBasis, 'costBasis');

  const totalShare = shares.reduce((sum, share) => {
    if (
      !Number.isInteger(share.depth) ||
      share.depth < 0 ||
      !Number.isInteger(share.shareBasisPoints) ||
      share.shareBasisPoints < 0 ||
      share.shareBasisPoints > 10_000
    ) {
      throw new Error('Invalid reward share');
    }
    return sum + share.shareBasisPoints;
  }, 0);
  if (totalShare > 10_000) throw new Error('Reward shares exceed 100%');

  const invalid =
    !rewardEnabled ||
    eligibleRevenue <= 0 ||
    costBasis == null ||
    costBasis < 0 ||
    costBasis >= eligibleRevenue;
  const grossProfit = invalid ? 0 : eligibleRevenue - costBasis;

  if (grossProfit === 0) {
    return {
      eligibleRevenue,
      costBasis,
      grossProfit: 0,
      marginBasisPoints: 0,
      coefficientBasisPoints: 0,
      rewardBudget: 0,
      distributions: shares.map((share) => ({ ...share, amount: 0 })),
    };
  }

  const p = BigInt(eligibleRevenue);
  const gp = BigInt(grossProfit);
  const marginBasisPoints = floorRatio(gp * 10_000n, p);
  let rawNumerator: bigint;
  let rawDenominator: bigint;

  if (gp * 10n <= p) {
    rawNumerator = gp * 15n;
    rawDenominator = 100n;
  } else if (gp * 10n <= p * 3n) {
    rawNumerator = 40n * gp * gp - gp * p;
    rawDenominator = 20n * p;
  } else {
    rawNumerator = 46n * gp * p + 30n * gp * gp;
    rawDenominator = 100n * p;
  }

  const rawBudget = Math.min(
    floorRatio(rawNumerator, rawDenominator),
    floorRatio(gp * 75n, 100n),
  );
  const maximumBudget = floorRatio(p * 5n, 100n);
  const rewardBudget = Math.min(rawBudget, maximumBudget);
  const coefficientBasisPoints = Math.min(
    7_500,
    marginBasisPoints <= 1_000
      ? 1_500
      : marginBasisPoints <= 3_000
        ? -500 + marginBasisPoints * 2
        : 4_600 + Math.floor((marginBasisPoints * 3) / 10),
  );

  return {
    eligibleRevenue,
    costBasis,
    grossProfit,
    marginBasisPoints,
    coefficientBasisPoints,
    rewardBudget,
    distributions: shares.map((share) => ({
      ...share,
      amount: floorRatio(
        BigInt(rewardBudget) * BigInt(share.shareBasisPoints),
        10_000n,
      ),
    })),
  };
}

export function allocateWholeRubles(
  amount: number,
  items: Array<{ id: string; eligibleAmount: number }>,
) {
  assertWholeRubles(amount, 'amount');
  const eligibleTotal = items.reduce(
    (sum, item) => sum + item.eligibleAmount,
    0,
  );
  if (amount <= 0 || eligibleTotal <= 0) {
    return items.map((item) => ({ id: item.id, amount: 0 }));
  }
  let remaining = Math.min(amount, eligibleTotal);
  return items.map((item, index) => {
    const allocation =
      index === items.length - 1
        ? remaining
        : Math.min(
            item.eligibleAmount,
            Math.floor((amount * item.eligibleAmount) / eligibleTotal),
          );
    remaining -= allocation;
    return { id: item.id, amount: allocation };
  });
}
