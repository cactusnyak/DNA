import type { InfoTableRow } from '../../types/admin-delivery-quotes';

type InfoTableProps = { title: string; rows: InfoTableRow[] };

export function InfoTable({ title, rows }: InfoTableProps) {
  return (
    <section className="flex w-fit max-w-full flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="w-fit max-w-full overflow-x-auto rounded-lg bg-primary/1 border border-border/50">
        <table className="table-auto border-collapse text-sm">
          <tbody className="divide-y divide-border/50">
            {rows.map(({ label, value }) => (
              <tr key={label}>
                <th scope="row" className="whitespace-nowrap px-2 py-1 text-left align-top font-medium">{label}</th>
                <td className="max-w-md whitespace-normal break-words px-2 py-1 align-top">{value || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
