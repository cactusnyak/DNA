import { Link } from 'react-router-dom';

import { BottomConfirm } from '@/components/ui/BottomConfirm';

import { useCookieNoticeStore } from './cookie-notice-store';

export function CookieNotice() {
  const isVisible = useCookieNoticeStore((state) => state.isVisible);
  const acknowledge = useCookieNoticeStore((state) => state.acknowledge);

  if (!isVisible) return null;

  return (
    <BottomConfirm
      ariaLabel="Уведомление о локальном хранении"
      confirmLabel="Понятно"
      onConfirm={acknowledge}
    >
      DNA использует только необходимое локальное хранение браузера для входа,
      корзины и избранного. Подробнее — в{' '}
      <Link
        className="font-medium text-foreground underline underline-offset-2"
        to="/cookie-policy"
      >
        политике использования cookie и локального хранения
      </Link>
      .
    </BottomConfirm>
  );
}
