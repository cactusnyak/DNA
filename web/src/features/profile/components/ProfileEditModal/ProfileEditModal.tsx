import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { FormInputField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import type { User } from '@/entities/user';
import { LegalFormNotice } from '@/shared/legal/LegalFormNotice';

type ProfileEditModalProps = {
  user: User;
  isOpen: boolean;
  isPending: boolean;
  error?: Error | null;
  onClose: () => void;
  onSubmit: (value: {
    nickname: string;
    firstName: string;
    lastName: string;
    patronymic: string;
    phone?: string;
  }) => void;
};

function getInputChangeHandler(
  setter: (value: string) => void,
) {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };
}

export function ProfileEditModal({
  user,
  isOpen,
  isPending,
  error,
  onClose,
  onSubmit,
}: ProfileEditModalProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const [patronymic, setPatronymic] = useState(user.patronymic ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setNickname(user.nickname);
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setPatronymic(user.patronymic ?? '');
    setPhone(user.phone ?? '');
  }, [isOpen, user]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      nickname: nickname.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      patronymic: patronymic.trim(),
      phone: phone.trim() || undefined,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Редактировать профиль"
      size="md"
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-full min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
          <FormInputField
            name="nickname"
            required
            label="Имя аккаунта"
            value={nickname}
            onChange={getInputChangeHandler(setNickname)}
          />

          <FormInputField
            name="lastName"
            label="Фамилия"
            value={lastName}
            onChange={getInputChangeHandler(setLastName)}
          />

          <FormInputField
            name="firstName"
            label="Имя"
            value={firstName}
            onChange={getInputChangeHandler(setFirstName)}
          />

          <FormInputField
            name="patronymic"
            label="Отчество"
            value={patronymic}
            onChange={getInputChangeHandler(setPatronymic)}
          />

          <FormInputField
            name="phone"
            type="tel"
            label="Телефон"
            value={phone}
            onChange={getInputChangeHandler(setPhone)}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-6">
          {error && (
            <p className="text-sm text-destructive">
              Не удалось сохранить. Проверьте соединение и попробуйте снова.
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
