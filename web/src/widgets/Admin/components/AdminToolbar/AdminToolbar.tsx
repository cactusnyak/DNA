import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

import { viewModeOptions } from './data/view-mode-options';

import type { AdminViewMode } from '../../types/admin-management';

type AdminToolbarProps = {
  searchValue: string;
  viewMode: AdminViewMode;
  canCreate?: boolean;
  canUseTree?: boolean;
  createLabel?: string;
  onSearchChange: (value: string) => void;
  onViewModeChange: (viewMode: AdminViewMode) => void;
  onCreateClick: () => void;
};

export function AdminToolbar({
  searchValue,
  viewMode,
  canCreate = true,
  canUseTree = false,
  createLabel = 'Создать',
  onSearchChange,
  onViewModeChange,
  onCreateClick,
}: AdminToolbarProps) {
  const availableViewModeOptions = viewModeOptions.filter(
    (option) => option.value !== 'tree' || canUseTree,
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <SearchInput
        value={searchValue}
        placeholder="Поиск по разделу..."
        className="w-full lg:max-w-sm"
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-[auto_auto]">
        <SegmentedControl
          options={availableViewModeOptions}
          value={viewMode}
          onChange={onViewModeChange}
          className="w-full lg:w-auto"
        />

        {canCreate && (
          <Button
            type="button"
            className="h-auto w-full cursor-pointer rounded-xl px-4 py-2 lg:w-auto"
            onClick={onCreateClick}
          >
            <Plus className="size-4" strokeWidth={1.5} />
            {createLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
