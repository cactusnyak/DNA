import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type {
  AdminCatalogCollection,
  AdminCatalogCollectionItemPayload,
  AdminCategory,
  AdminProduct,
} from '@/entities/admin';

type AdminCollectionItemsEditorProps = {
  collection: AdminCatalogCollection;
  categories: AdminCategory[];
  products: AdminProduct[];
  isPending?: boolean;
  onSave: (items: AdminCatalogCollectionItemPayload[]) => void;
  onQuickCreate: (title: string) => Promise<string | undefined>;
};

export function AdminCollectionItemsEditor({
  collection,
  categories,
  products,
  isPending = false,
  onSave,
  onQuickCreate,
}: AdminCollectionItemsEditorProps) {
  const [quickTitle, setQuickTitle] = useState('');
  const [selectedItems, setSelectedItems] = useState<
    Record<string, { selected: boolean; sortOrder: number }>
  >({});

  const sourceItems = collection.type === 'CATEGORY' ? categories : products;

  const initialSelectedItems = useMemo(() => {
    const result: Record<string, { selected: boolean; sortOrder: number }> = {};

    if (collection.type === 'CATEGORY') {
      collection.categories.forEach((item, index) => {
        result[item.category.id] = {
          selected: true,
          sortOrder: item.sortOrder ?? index,
        };
      });
    } else {
      collection.products.forEach((item, index) => {
        result[item.product.id] = {
          selected: true,
          sortOrder: item.sortOrder ?? index,
        };
      });
    }

    return result;
  }, [collection]);

  useEffect(() => {
    setSelectedItems(initialSelectedItems);
  }, [initialSelectedItems]);

  function toggleItem(itemId: string) {
    setSelectedItems((currentItems) => {
      const currentItem = currentItems[itemId];

      return {
        ...currentItems,
        [itemId]: {
          selected: !currentItem?.selected,
          sortOrder: currentItem?.sortOrder ?? 0,
        },
      };
    });
  }

  function updateSortOrder(itemId: string, sortOrder: number) {
    setSelectedItems((currentItems) => ({
      ...currentItems,
      [itemId]: {
        selected: currentItems[itemId]?.selected ?? false,
        sortOrder,
      },
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSave(
      Object.entries(selectedItems)
        .filter(([, item]) => item.selected)
        .map(([id, item]) => ({
          id,
          sortOrder: item.sortOrder,
        }))
        .sort((firstItem, secondItem) => firstItem.sortOrder - secondItem.sortOrder),
    );
  }

  async function handleQuickCreate() {
    const title = quickTitle.trim();

    if (!title) {
      return;
    }

    const createdItemId = await onQuickCreate(title);

    if (createdItemId) {
      setSelectedItems((currentItems) => ({
        ...currentItems,
        [createdItemId]: {
          selected: true,
          sortOrder: Object.keys(currentItems).length,
        },
      }));
    }

    setQuickTitle('');
  }

  return (
    <form
      className="rounded-2xl border border-border bg-card p-5"
      onSubmit={handleSubmit}
    >
      <div>
        <h3 className="text-lg font-semibold">Состав подборки</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Выберите элементы, которые должны отображаться в этой витрине.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Input
          value={quickTitle}
          placeholder={
            collection.type === 'CATEGORY'
              ? 'Быстро создать категорию'
              : 'Быстро создать продукт'
          }
          onChange={(event) => setQuickTitle(event.target.value)}
        />

        <Button type="button" variant="outline" onClick={handleQuickCreate}>
          Быстро создать
        </Button>
      </div>

      <div className="mt-5 max-h-[420px] space-y-2 overflow-y-auto pr-2">
        {sourceItems.map((item, index) => {
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
                  onChange={() => toggleItem(item.id)}
                />

                <span>
                  <span className="block font-medium">
                    {'name' in item ? item.name : item.title}
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
                  updateSortOrder(item.id, Number(event.target.value))
                }
              />
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Сохраняем...' : 'Сохранить состав'}
        </Button>
      </div>
    </form>
  );
}