import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import type { User } from '@/entities/user';
import { LegalFormNotice } from '@/shared/legal/LegalFormNotice';

type AvatarEditModalProps = {
  user: User;
  isOpen: boolean;
  isPending: boolean;
  error?: Error | null;
  onClose: () => void;
  onSubmit: (value: { avatarFile?: File; remove: boolean }) => void;
};

export function AvatarEditModal({
  user,
  isOpen,
  isPending,
  error,
  onClose,
  onSubmit,
}: AvatarEditModalProps) {
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    user.avatar?.url,
  );
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAvatarFile(undefined);
    setAvatarPreview(user.avatar?.url);
    setIsRemoved(false);
  }, [isOpen, user]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setIsRemoved(false);
  }

  function handleRemove() {
    setAvatarFile(undefined);
    setAvatarPreview(undefined);
    setIsRemoved(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      avatarFile,
      remove: isRemoved,
    });
  }

  const hasAvatar = Boolean(avatarPreview) && !isRemoved;

  return (
    <Modal
      isOpen={isOpen}
      title="Аватар профиля"
      size="sm"
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-full min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar src={avatarPreview} name={user.nickname} size="xl" />

            <div className="flex flex-wrap items-center justify-center gap-1">
              <label className="cursor-pointer">
                <input
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  title="Загрузить новый аватар"
                  aria-label="Загрузить новый аватар"
                  asChild
                >
                  <span>
                    <Pencil className="size-3.5" strokeWidth={1.5} />
                  </span>
                </Button>
              </label>

              {hasAvatar && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  title="Удалить аватар"
                  aria-label="Удалить аватар"
                  onClick={handleRemove}
                >
                  <Trash2 className="size-3.5" strokeWidth={1.5} />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-6">
          {error && (
            <p className="text-sm text-destructive">
              Не удалось обновить аватар. Проверьте соединение и попробуйте
              снова.
            </p>
          )}

          <LegalFormNotice />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Сохраняем...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
