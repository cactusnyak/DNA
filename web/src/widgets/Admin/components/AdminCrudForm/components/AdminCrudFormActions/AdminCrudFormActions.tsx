import { Button } from '@/components/ui/Button';

type AdminCrudFormActionsProps = {
  isPending?: boolean;
  onCancel: () => void;
};

export function AdminCrudFormActions({
  isPending = false,
  onCancel,
}: AdminCrudFormActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Отмена
      </Button>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Сохраняем...' : 'Сохранить'}
      </Button>
    </div>
  );
}
