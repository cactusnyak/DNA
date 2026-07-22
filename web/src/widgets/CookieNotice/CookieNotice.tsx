import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

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
    <aside className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-xl md:bottom-4" aria-label="Уведомление о локальном хранении">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">DNA использует только необходимое локальное хранение браузера для входа, корзины и избранного. Подробнее — в <Link className="font-medium text-foreground underline underline-offset-2" to="/cookie-policy">политике использования cookie и локального хранения</Link>.</p>
        <Button type="button" className="shrink-0" onClick={acknowledge}>Понятно</Button>
      </div>
    </aside>
  );
}

