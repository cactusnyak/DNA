import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

type OrderConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function OrderConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: OrderConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Добавить товары заказа?"
      size="sm"
      onClose={onClose}
    >
      <div className="flex flex-col gap-5 overflow-auto p-5">
        <p className="text-sm text-muted-foreground">
          Текущая корзина будет сохранена. Позиции заказа добавятся к ней, а
          количество полностью совпадающих позиций увеличится.
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="accent"
            onClick={onConfirm}
          >
            Подтвердить
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  );
}
