import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type KeyValueTableRow = {
  key: string;
  label: ReactNode;
  value: ReactNode;
};

type KeyValueTableProps = {
  rows: KeyValueTableRow[];
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export function KeyValueTable({
  rows,
  className,
  labelClassName,
  valueClassName,
}: KeyValueTableProps) {
  return (
    <table
      className={twMerge(
        'w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-lg border border-border/70 text-xs',
        className,
      )}
    >
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.key}
            className="[&:not(:last-child)>*]:border-b [&:not(:last-child)>*]:border-border/60"
          >
            <th
              scope="row"
              className={twMerge(
                'w-28 bg-muted/40 px-2.5 py-2 text-left align-top font-medium text-muted-foreground',
                labelClassName,
              )}
            >
              {row.label}
            </th>
            <td
              className={twMerge(
                'min-w-0 break-words px-2.5 py-2 align-top text-foreground',
                valueClassName,
              )}
            >
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
