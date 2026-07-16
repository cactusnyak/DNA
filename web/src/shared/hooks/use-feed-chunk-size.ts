import type { ItemGridDensity } from '@/shared/utils/get-item-grid-classes';

import { useGridColumns } from './use-grid-columns';

const INITIAL_ROWS = 3;
const LOAD_MORE_ROWS = 2;

export function useFeedChunkSize(density: ItemGridDensity = 'default') {
  const columns = useGridColumns(density);

  return {
    initialChunkSize: columns * INITIAL_ROWS,
    chunkSize: columns * LOAD_MORE_ROWS,
  };
}
