import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/shared/utils/cn';

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
        <div className="inline-flex w-full items-center gap-1 rounded-xl border border-border bg-muted/50 p-1 lg:w-auto">
          {availableViewModeOptions.map((option) => {
            const isActive = viewMode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                className={cn(
                  'inline-flex h-9 flex-1 cursor-pointer items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors lg:flex-none',
                  'hover:bg-background hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive && 'bg-background text-foreground ring-1 ring-border',
                )}
                onClick={() => onViewModeChange(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>

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
