import { useState } from 'react';
import { Link } from 'react-router-dom';

import { BottomConfirm } from '@/components/ui/BottomConfirm';

const storageKey = 'dna-essential-storage-notice';

export function CookieNotice() {
  const [isVisible, setIsVisible] = useState(() => {
    try { return window.localStorage.getItem(storageKey) !== 'acknowledged'; } catch { return true; }
  });

  if (!isVisible) return null;

  function acknowledge() {
    try { window.localStorage.setItem(storageKey, 'acknowledged'); } catch { /* Storage may be unavailable. */ }
    setIsVisible(false);
  }

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
