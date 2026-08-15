import type { InfoTableRow } from '../../types/admin-delivery-quotes';

type InfoTableProps = { title: string; rows: InfoTableRow[] };

export function InfoTable({ title, rows }: InfoTableProps) {
  return (
    <section className="flex w-full max-w-full flex-col gap-2 lg:w-fit">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="w-full max-w-full overflow-hidden rounded-lg border border-border/50 bg-white lg:w-fit">
        <table className="w-full table-fixed border-collapse text-sm lg:w-auto lg:table-auto">
          <tbody className="divide-y divide-border/50">
            {rows.map(({ label, value }) => (
              <tr key={label}>
                <th
                  scope="row"
                  className="w-1/3 whitespace-nowrap px-2 py-1 text-left align-top font-medium lg:w-auto"
                >
                  {label}
                </th>
                <td className="max-w-0 truncate px-2 py-1 align-top lg:max-w-md">
                  {value || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
