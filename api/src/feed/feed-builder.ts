import type { FeedConfig, FeedScope } from './feed.types';

type CategoryNode<TItem> = {
  id: string;
  parentId: string | null;
  sortOrder: number;
  items: TItem[];
  children: CategoryNode<TItem>[];
};

/**
 * Given a flat list of categories (with parentId) and a map of items keyed by
 * categoryId, build root-level trees and return one ordered item queue per
 * top-level category using BFS traversal.
 */
export function buildCategoryQueues<TItem>(
  flatCategories: { id: string; parentId: string | null; sortOrder: number }[],
  itemsByCategoryId: Map<string, TItem[]>,
): TItem[][] {
  const nodeById = new Map<string, CategoryNode<TItem>>();

  for (const cat of flatCategories) {
    nodeById.set(cat.id, {
      id: cat.id,
      parentId: cat.parentId,
      sortOrder: cat.sortOrder,
      items: itemsByCategoryId.get(cat.id) ?? [],
      children: [],
    });
  }

  const roots: CategoryNode<TItem>[] = [];

  for (const cat of flatCategories) {
    const node = nodeById.get(cat.id)!;

    if (cat.parentId === null) {
      roots.push(node);
    } else {
      const parent = nodeById.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  roots.sort((a, b) => a.sortOrder - b.sortOrder);

  const queues: TItem[][] = [];

  for (const root of roots) {
    const queue = bfsCollect(root);
    if (queue.length > 0) {
      queues.push(queue);
    }
  }

  return queues;
}

function bfsCollect<TItem>(root: CategoryNode<TItem>): TItem[] {
  const result: TItem[] = [];
  const bfsQueue: CategoryNode<TItem>[] = [root];

  while (bfsQueue.length > 0) {
    const node = bfsQueue.shift()!;

    result.push(...node.items);

    const sorted = [...node.children].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    bfsQueue.push(...sorted);
  }

  return result;
}

/**
 * Build the interleaved pattern of scopes based on firstCategoryScope and
 * categoryRatio.  Returns an infinite generator of 'MARKET' | 'ADS' scopes.
 */
function* scopePattern(
  firstCategoryScope: FeedScope,
  categoryRatio: FeedConfig['categoryRatio'],
): Generator<FeedScope> {
  const pattern: FeedScope[] = [];

  if (firstCategoryScope === 'MARKET') {
    for (let i = 0; i < categoryRatio.market; i++) {
      pattern.push('MARKET');
    }
    for (let i = 0; i < categoryRatio.ads; i++) {
      pattern.push('ADS');
    }
  } else {
    for (let i = 0; i < categoryRatio.ads; i++) {
      pattern.push('ADS');
    }
    for (let i = 0; i < categoryRatio.market; i++) {
      pattern.push('MARKET');
    }
  }

  let index = 0;
  while (true) {
    yield pattern[index % pattern.length];
    index++;
  }
}

/**
 * Core feed-building algorithm.
 *
 * Given pre-built queues for market products and ads (each queue corresponds
 * to one top-level category's BFS-ordered item list), interleaves them
 * according to the feed configuration.
 */
export function buildFeed(
  marketQueues: string[][],
  adQueues: string[][],
  config: FeedConfig,
): { scope: FeedScope; id: string }[] {
  const marketCategoryQueue = [...marketQueues.map((q) => [...q])];
  const adCategoryQueue = [...adQueues.map((q) => [...q])];
  const seen = new Set<string>();
  const result: { scope: FeedScope; id: string }[] = [];

  const gen = scopePattern(config.firstCategoryScope, config.categoryRatio);

  while (marketCategoryQueue.length > 0 || adCategoryQueue.length > 0) {
    const { value: scope } = gen.next();
    const queue =
      scope === 'MARKET' ? marketCategoryQueue : adCategoryQueue;

    if (queue.length === 0) {
      const otherQueue =
        scope === 'MARKET' ? adCategoryQueue : marketCategoryQueue;

      if (otherQueue.length === 0) {
        break;
      }

      const otherScope: FeedScope = scope === 'MARKET' ? 'ADS' : 'MARKET';
      const categoryItems = otherQueue.shift()!;
      const taken: string[] = [];

      while (taken.length < config.sampleSize && categoryItems.length > 0) {
        const id = categoryItems.shift()!;
        if (!seen.has(id)) {
          seen.add(id);
          taken.push(id);
        }
      }

      for (const id of taken) {
        result.push({ scope: otherScope, id });
      }

      if (categoryItems.length > 0) {
        otherQueue.push(categoryItems);
      }

      continue;
    }

    const categoryItems = queue.shift()!;
    const taken: string[] = [];

    while (taken.length < config.sampleSize && categoryItems.length > 0) {
      const id = categoryItems.shift()!;

      if (!seen.has(id)) {
        seen.add(id);
        taken.push(id);
      }
    }

    for (const id of taken) {
      result.push({ scope, id });
    }

    if (categoryItems.length > 0) {
      queue.push(categoryItems);
    }
  }

  return result;
}
