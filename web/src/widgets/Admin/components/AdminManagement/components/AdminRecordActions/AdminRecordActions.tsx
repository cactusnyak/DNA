import { Pencil, RotateCcw, Trash2 } from 'lucide-react';

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
};

export function AdminRecordActions({
  activeTabId,
  record,
  onEdit,
  onRestore,
  onDelete,
}: AdminRecordActionsProps) {
  const canRestore = canRestoreAdminRecord(record);

  function handleDelete() {
    if (!window.confirm('Удалить запись?')) {
      return;
    }

    onDelete(record);
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onEdit(record)}
      >
        <Pencil className="size-3.5" />
        {activeTabId === 'orders' ? 'Статус' : 'Изменить'}
      </Button>

      {activeTabId !== 'orders' && canRestore && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRestore(record)}
        >
          <RotateCcw className="size-3.5" />
          Вернуть
        </Button>
      )}

      {activeTabId !== 'orders' && !canRestore && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5" />
          Удалить
        </Button>
      )}
    </div>
  );
}
