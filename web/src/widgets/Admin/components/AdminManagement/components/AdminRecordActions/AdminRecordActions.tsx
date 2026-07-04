import {
  ArchiveX,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';

import type { AdminManagementTabId } from '../../../../types/admin-management';
import { canRestoreAdminRecord } from '../../logic/can-restore-admin-record';
import type { EditableRecord } from '../../types/admin-management-records';

type AdminRecordActionsProps = {
  activeTabId: AdminManagementTabId;
  record: EditableRecord;
  onEdit: (record: EditableRecord) => void;
  onRestore: (record: EditableRecord) => void;
  onDelete: (record: EditableRecord) => void;
  onHardDelete: (record: EditableRecord) => void;
};

export function AdminRecordActions({
  activeTabId,
  record,
  onEdit,
  onRestore,
  onDelete,
  onHardDelete,
}: AdminRecordActionsProps) {
  const isUsersTab = activeTabId === 'users';
  const canRestore = !isUsersTab && canRestoreAdminRecord(record);
  const canSoftDelete = activeTabId !== 'orders' && !canRestore;

  const editLabel =
    activeTabId === 'orders' ? 'Изменить статус заказа' : 'Изменить запись';

  function handleDelete() {
    if (!window.confirm('Пометить запись удаленной?')) {
      return;
    }

    onDelete(record);
  }

  function handleHardDelete() {
    if (
      !window.confirm(
        'Удалить запись навсегда? Это действие нельзя будет отменить.',
      )
    ) {
      return;
    }

    onHardDelete(record);
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={editLabel}
        title={editLabel}
        onClick={() => onEdit(record)}
      >
        <Pencil className="size-3.5" strokeWidth={1.5} />
      </Button>

      {activeTabId !== 'orders' && !isUsersTab && canRestore && (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Восстановить запись"
          title="Восстановить запись"
          onClick={() => onRestore(record)}
        >
          <RotateCcw className="size-3.5" strokeWidth={1.5} />
        </Button>
      )}

      {canSoftDelete && (
        <Button
          type="button"
          variant="warning"
          size="icon-sm"
          aria-label="Пометить удаленным"
          title="Пометить удаленным"
          onClick={handleDelete}
        >
          <ArchiveX className="size-3.5" strokeWidth={1.5} />
        </Button>
      )}

      {!isUsersTab && (
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          aria-label="Удалить навсегда"
          title="Удалить навсегда"
          onClick={handleHardDelete}
        >
          <Trash2 className="size-3.5" strokeWidth={1.5} />
        </Button>
      )}
    </div>
  );
}
