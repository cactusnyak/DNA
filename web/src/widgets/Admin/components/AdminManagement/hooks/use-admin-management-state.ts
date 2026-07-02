import { useState } from 'react';

import type {
  AdminManagementTabId,
  AdminViewMode,
} from '../../../types/admin-management';
import type { EditableRecord } from '../types/admin-management-records';

export function useAdminManagementState() {
  const [activeTabId, setActiveTabId] =
    useState<AdminManagementTabId>('categories');
  const [searchValue, setSearchValue] = useState('');
  const [viewMode, setViewMode] = useState<AdminViewMode>('table');
  const [editingRecord, setEditingRecord] = useState<EditableRecord>();
  const [isCreating, setIsCreating] = useState(false);

  function resetEditing() {
    setEditingRecord(undefined);
    setIsCreating(false);
  }

  function handleTabChange(tabId: AdminManagementTabId) {
    setActiveTabId(tabId);
    setSearchValue('');
    setViewMode(tabId === 'categories' ? 'tree' : 'table');
    resetEditing();
  }

  function handleEdit(record: EditableRecord) {
    setEditingRecord(record);
    setIsCreating(false);
  }

  function handleCreateClick() {
    setIsCreating(true);
    setEditingRecord(undefined);
  }

  return {
    activeTabId,
    searchValue,
    viewMode,
    editingRecord,
    isCreating,
    isCrudFormOpen: isCreating || Boolean(editingRecord),
    setSearchValue,
    setViewMode,
    resetEditing,
    handleTabChange,
    handleEdit,
    handleCreateClick,
  };
}
