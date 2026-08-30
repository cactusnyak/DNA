import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Input } from '@/components/ui/Input';
import { getCurrentUser } from '@/entities/auth';
import { applyOrderBonus, type ApplyOrderBonusResponse } from '@/entities/order';
import { formatPrice } from '@/shared/utils/format-price';

export function BonusBalanceControl({
  accessToken,
  orderId,
  currentAmount,
  onApplied,
}: {
  accessToken: string;
  orderId: string;
  currentAmount: number;
  onApplied: (result: ApplyOrderBonusResponse) => void;
}) {
  const [amount, setAmount] = useState(String(currentAmount));
  const user = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const mutation = useMutation({
    mutationFn: (requestedAmount: number) => applyOrderBonus(accessToken, orderId, requestedAmount),
    onSuccess: onApplied,
  });
  const balance = user.data?.balance;
  const spendable = Math.max(0, (balance?.value ?? 0) - (balance?.spendingHoldValue ?? 0) + currentAmount);

  return (
    <section className="rounded-2xl bg-primary/5 p-4">
      <h2 className="font-semibold">Оплатить бонусами</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Доступно: {formatPrice(spendable)}. Бонусами можно оплатить до 30% стоимости товаров; доставка и зарезервированные награды не участвуют.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          name="bonusAmount"
          type="number"
          min={0}
          max={spendable}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          disabled={(balance?.debtValue ?? 0) > 0 || mutation.isPending}
        />
        <Button type="button" onClick={() => mutation.mutate(Math.max(0, Math.trunc(Number(amount) || 0)))} disabled={mutation.isPending || (balance?.debtValue ?? 0) > 0}>
          {mutation.isPending ? 'Применяем…' : 'Применить'}
        </Button>
        {currentAmount > 0 && (
          <Button type="button" variant="secondary" onClick={() => { setAmount('0'); mutation.mutate(0); }} disabled={mutation.isPending}>
            Убрать
          </Button>
        )}
      </div>
      {(balance?.pendingRewardValue ?? 0) > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Зарезервировано до доставки: {formatPrice(balance?.pendingRewardValue ?? 0)}</p>
      )}
      {(balance?.debtValue ?? 0) > 0 && <ErrorMessage className="mt-3">Использование бонусов заблокировано до погашения бонусного долга.</ErrorMessage>}
      {mutation.isError && <ErrorMessage className="mt-3">Не удалось применить бонусы. Обновите заказ и попробуйте снова.</ErrorMessage>}
    </section>
  );
}
