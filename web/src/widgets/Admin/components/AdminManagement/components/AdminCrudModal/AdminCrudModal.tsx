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
  onUploadImage: ComponentProps<typeof AdminCrudForm>['onUploadImage'];
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
  onUploadImage,
  onSubmit,
  onClose,
  onCollectionItemsSave,
  onQuickCreate,
}: AdminCrudModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={getCrudFormModalTitle(activeTabId, editingRecord)}
      size={
        collectionEditingRecord
          ? 'xl'
          : activeTabId === 'orders' || activeTabId === 'users'
            ? 'sm'
            : 'lg'
      }
      onClose={onClose}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AdminCrudForm
          tabId={activeTabId}
          record={editingRecord}
          categories={data.marketCategories}
          adCategories={data.adCategories}
          isPending={isCrudFormPending}
          onUploadImage={onUploadImage}
          onSubmit={onSubmit}
          onCancel={onClose}
        />

        {collectionEditingRecord && (
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-border p-6">
            <AdminCollectionItemsEditor
              collection={collectionEditingRecord}
              categories={data.marketCategories}
              products={data.products}
              isPending={isCollectionItemsPending}
              onSave={(items) =>
                onCollectionItemsSave(collectionEditingRecord, items)
              }
              onQuickCreate={(title) =>
                onQuickCreate(collectionEditingRecord, title)
              }
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

