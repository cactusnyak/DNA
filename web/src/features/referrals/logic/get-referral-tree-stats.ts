import type { ReferralTreeUser } from '@/entities/referral';

type ReferralTreeStats = {
  totalUsers: number;
  maxLevel: number;
};

export function getReferralTreeStats(
  tree: ReferralTreeUser[],
): ReferralTreeStats {
  const stats: ReferralTreeStats = {
    totalUsers: 0,
    maxLevel: 0,
  };

  function walk(nodes: ReferralTreeUser[]) {
    nodes.forEach((node) => {
      stats.totalUsers += 1;
      stats.maxLevel = Math.max(stats.maxLevel, node.level);

      walk(node.children);
    });
  }

  walk(tree);

  return stats;
}