import { cn } from '@/shared/utils/cn';

import type { AdminTabGroupId, AdminManagementTab } from '../../data/admin-management-tabs';
import type { AdminManagementTabId } from '../../types/admin-management';

type AdminTabsProps = {
  tabs: AdminManagementTab[];
  activeTabId: AdminManagementTabId;
  counts: Record<AdminManagementTabId, number>;
  onTabChange: (tabId: AdminManagementTabId) => void;
};

type TabGroup = {
  id: AdminTabGroupId;
  label: string;
  tabs: AdminManagementTab[];
};

function buildTabGroups(tabs: AdminManagementTab[]): TabGroup[] {
  const groupMap = new Map<AdminTabGroupId, TabGroup>();

  for (const tab of tabs) {
    const existing = groupMap.get(tab.group);

    if (existing) {
      existing.tabs.push(tab);
    } else {
      groupMap.set(tab.group, {
        id: tab.group,
        label: tab.groupLabel,
        tabs: [tab],
      });
    }
  }

  return Array.from(groupMap.values());
}

export function AdminTabs({
  tabs,
  activeTabId,
  counts,
  onTabChange,
}: AdminTabsProps) {
  const groups = buildTabGroups(tabs);

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex min-w-max items-end gap-0 border-b border-border sm:min-w-0">
        {groups.map((group, groupIndex) => (
          <div key={group.id} className="flex items-end">
            {groupIndex > 0 && (
              <div className="mx-3 h-4 w-px shrink-0 bg-border" />
            )}

            <div className="relative flex flex-col gap-2">
              <span className="sticky top-0 left-0 w-fit rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:mx-1">
                {group.label}
              </span>

              <div className="flex">
                {group.tabs.map((tab) => {
                  const isActive = activeTabId === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      className={cn(
                        'flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 p-2 text-xs font-medium transition-colors sm:gap-2 sm:px-3 sm:text-sm',
                        isActive
                          ? 'border-foreground text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground',
                      )}
                      onClick={() => onTabChange(tab.id)}
                    >
                      {tab.title}

                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums',
                          isActive
                            ? 'bg-foreground text-background'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {counts[tab.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

