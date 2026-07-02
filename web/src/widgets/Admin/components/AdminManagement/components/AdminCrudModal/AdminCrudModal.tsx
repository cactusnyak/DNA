import type { ComponentProps } from 'react';

import type { AdminCatalogCollection } from '@/entities/admin';

import { Modal } from '@/widgets/Modal';

import { AdminCollectionItemsEditor } from '../../../AdminCollectionItemsEditor';
import { AdminCrudForm } from '../../../AdminCrudForm';
import { getCrudFormModalTitle } from '../../logic/get-crud-form-modal-title';

import type { AdminManagementTabId } from '../../../../types/admin-management';
import type {
  AdminCatalogData,
  EditableRecord,
} from '../../types/admin-management-records';

type AdminCrudModalProps = {
  isOpen: boolean;
  activeTabId: AdminManagementTabId;
  editingRecord?: EditableRecord;
  collectionEditingRecord?: AdminCatalogCollection;
  data: AdminCatalogData;
  isCrudFormPending?: boolean;
  isCollectionItemsPending?: boolean;
  onSubmit: ComponentProps<typeof AdminCrudForm>['onSubmit'];
  onClose: () => void;
  onCollectionItemsSave: (
    collection: AdminCatalogCollection,
    items: { id: string; sortOrder: number }[],
  ) => void;
  onQuickCreate: (
    collection: AdminCatalogCollection,
    title: string,
  ) => Promise<string | undefined>;
};

export function AdminCrudModal({
  isOpen,
  activeTabId,
  editingRecord,
  collectionEditingRecord,
  data,
  isCrudFormPending = false,
  isCollectionItemsPending = false,
  onSubmit,
  onClose,
  onCollectionItemsSave,
  onQuickCreate,
}: AdminCrudModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={getCrudFormModalTitle(activeTabId, editingRecord)}
      size={collectionEditingRecord ? 'xl' : activeTabId === 'orders' ? 'sm' : 'lg'}
      onClose={onClose}
    >
      <div className="space-y-6 max-h-full overflow-y-auto">
        <AdminCrudForm
          tabId={activeTabId}
          record={editingRecord}
          categories={data.categories}
          isPending={isCrudFormPending}
          onSubmit={onSubmit}
          onCancel={onClose}
        />

        {collectionEditingRecord && (
          <AdminCollectionItemsEditor
            collection={collectionEditingRecord}
            categories={data.categories}
            products={data.products}
            isPending={isCollectionItemsPending}
            onSave={(items) =>
              onCollectionItemsSave(collectionEditingRecord, items)
            }
            onQuickCreate={(title) =>
              onQuickCreate(collectionEditingRecord, title)
            }
          />
        )}
      </div>
    </Modal>
  );
}
