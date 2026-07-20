import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Button } from '@/components/ui/Button';
import type {
  AdminCatalogCollection,
  AdminCatalogCollectionItemPayload,
  AdminMarketCategory,
  AdminProduct,
} from '@/entities/admin';

import { CollectionItemsPicker } from './components/CollectionItemsPicker';
import { CollectionQuickCreate } from './components/CollectionQuickCreate';
import { buildCollectionItemsPayload } from './logic/build-collection-items-payload';
import { getInitialSelectedCollectionItems } from './logic/get-initial-selected-collection-items';
import type { SelectedCollectionItems } from './types/admin-collection-items-editor';

type AdminCollectionItemsEditorProps = {
  collection: AdminCatalogCollection;
  categories: AdminMarketCategory[];
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
  const [selectedItems, setSelectedItems] = useState<SelectedCollectionItems>({});

  const sourceItems = collection.type === 'CATEGORY' ? categories : products;

  const initialSelectedItems = useMemo(
    () => getInitialSelectedCollectionItems(collection),
    [collection],
  );

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
    onSave(buildCollectionItemsPayload(selectedItems));
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

      <div className="mt-5">
        <CollectionQuickCreate
          value={quickTitle}
          placeholder={
            collection.type === 'CATEGORY'
              ? 'Быстро создать категорию'
              : 'Быстро создать продукт'
          }
          onChange={setQuickTitle}
          onCreate={handleQuickCreate}
        />
      </div>

      <div className="mt-5">
        <CollectionItemsPicker
          items={sourceItems}
          selectedItems={selectedItems}
          onItemToggle={toggleItem}
          onSortOrderChange={updateSortOrder}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Сохраняем...' : 'Сохранить состав'}
        </Button>
      </div>
    </form>
  );
}

