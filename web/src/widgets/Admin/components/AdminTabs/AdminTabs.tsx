import type { AdminManagementTab } from '../../data/admin-management-tabs';
import type { AdminManagementTabId } from '../../types/admin-management';

type AdminTabsProps = {
  tabs: AdminManagementTab[];
  activeTabId: AdminManagementTabId;
  counts: Record<AdminManagementTabId, number>;
  onTabChange: (tabId: AdminManagementTabId) => void;
};

export function AdminTabs({
  tabs,
  activeTabId,
  counts,
  onTabChange,
}: AdminTabsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTabId === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={[
              'rounded-2xl border p-4 text-left transition-colors cursor-pointer',
              isActive
                ? 'border-foreground bg-foreground text-background'
                : 'border-border hover:bg-muted/50',
            ].join(' ')}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="flex items-center justify-between gap-3">
              <Icon className="size-5" strokeWidth={1.5} />

              <span
                className={[
                  'rounded-full px-2.5 py-1 text-xs font-medium',
                  isActive ? 'bg-background/15' : 'bg-muted',
                ].join(' ')}
              >
                {counts[tab.id]}
              </span>
            </div>

            <p className="mt-4 font-semibold">{tab.title}</p>

            <p
              className={[
                'mt-2 text-sm leading-5',
                isActive ? 'text-background/70' : 'text-muted-foreground',
              ].join(' ')}
            >
              {tab.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}