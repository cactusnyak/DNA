import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { getBalanceHistory } from '@/entities/balance';
import { formatPrice } from '@/shared/utils/format-price';

const labels: Record<string, string> = {
  REWARD_PENDING: 'Награда зарезервирована',
  REWARD_RELEASE: 'Награда доступна',
  REWARD_CANCEL: 'Награда отменена',
  REWARD_REVERSE: 'Награда сторнирована',
  BONUS_HOLD: 'Бонусы зарезервированы для заказа',
  BONUS_HOLD_RELEASE: 'Резерв заказа снят',
  BONUS_SPEND: 'Оплата заказа бонусами',
  ADMIN_ADJUSTMENT: 'Корректировка',
};

export function BalanceHistory({ accessToken }: { accessToken: string }) {
  const query = useQuery({
    queryKey: ['balance-history', accessToken, 1],
    queryFn: () => getBalanceHistory(accessToken),
  });
  return (
    <section className="mt-6 rounded-3xl bg-card p-5 shadow-card-xl">
      <h2 className="text-xl font-semibold">История бонусов</h2>
      <p className="mt-1 text-sm text-muted-foreground">Все начисления, резервы, списания и сторнирования.</p>
      {query.isPending && <p className="mt-4 text-sm">Загружаем операции…</p>}
      {query.isError && <p className="mt-4 text-sm text-dangerous">Не удалось загрузить историю.</p>}
      {query.data?.items.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Операций пока нет.</p>}
      <ul className="mt-4 divide-y divide-border/70">
        {query.data?.items.map((operation) => {
          const delta = operation.activeDelta || operation.pendingDelta || operation.holdDelta || operation.debtDelta;
          return (
            <li key={operation.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-medium">{labels[operation.type] ?? operation.type}</p>
                <p className="text-xs text-muted-foreground">{new Date(operation.createdAt).toLocaleString('ru-RU')}</p>
                {operation.orderId && <Link className="text-xs text-primary underline" to={`/profile/orders/${operation.orderId}`}>Заказ</Link>}
              </div>
              <span className={delta < 0 ? 'text-dangerous' : 'text-success'}>{delta > 0 ? '+' : ''}{formatPrice(delta)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
