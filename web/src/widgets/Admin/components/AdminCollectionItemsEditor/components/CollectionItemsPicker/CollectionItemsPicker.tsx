import { Input } from '@/components/ui/Input';
import type {
  AdminCategory,
  AdminProduct,
} from '@/entities/admin';

import type { SelectedCollectionItems } from '../../types/admin-collection-items-editor';

type CollectionItemsPickerProps = {
  items: Array<AdminCategory | AdminProduct>;
  selectedItems: SelectedCollectionItems;
  onItemToggle: (itemId: string) => void;
  onSortOrderChange: (itemId: string, sortOrder: number) => void;
};

function getItemTitle(item: AdminCategory | AdminProduct) {
  return 'name' in item ? item.name : item.title;
}

export function CollectionItemsPicker({
  items,
  selectedItems,
  onItemToggle,
  onSortOrderChange,
}: CollectionItemsPickerProps) {
  return (
    <div className="max-h-[420px] space-y-2 overflow-y-auto pr-2">
      {items.map((item, index) => {
        const state = selectedItems[item.id];

        return (
          <label
            key={item.id}
            className="grid gap-3 rounded-xl border border-border p-3 text-sm sm:grid-cols-[1fr_110px]"
          >
            <span className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={Boolean(state?.selected)}
                onChange={() => onItemToggle(item.id)}
              />

              <span>
                <span className="block font-medium">
                  {getItemTitle(item)}
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.slug}
                </span>
              </span>
            </span>

            <Input
              type="number"
              value={String(state?.sortOrder ?? index)}
              onChange={(event) =>
                onSortOrderChange(item.id, Number(event.target.value))
              }
            />
          </label>
        );
      })}
    </div>
  );
}
