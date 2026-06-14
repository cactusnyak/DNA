import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  login,
  register,
  useAuthStore,
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
} from '@/entities/auth';

import { AuthorizationForm } from './components/AuthorizationForm';
import { initialAuthorizationFormValue } from './logic/initial-authorization-form-value';
import type {
  AuthorizationFormValue,
  AuthorizationMode,
} from './types/authorization-form';

function normalizeOptionalString(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue || undefined;
}

function buildLoginPayload(value: AuthorizationFormValue): LoginPayload {
  return {
    email: value.email.trim(),
    password: value.password,
  };
}

function buildRegisterPayload(value: AuthorizationFormValue): RegisterPayload {
  return {
    email: value.email.trim(),
    password: value.password,
    firstName: value.firstName.trim(),
    lastName: value.lastName.trim(),
    phone: normalizeOptionalString(value.phone),
    inviterReferralCode: normalizeOptionalString(value.inviterReferralCode),
  };
}

export function Authorization() {
  const [mode, setMode] = useState<AuthorizationMode>('login');
  const [formValue, setFormValue] = useState(initialAuthorizationFormValue);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const authMutation = useMutation({
    mutationFn: () => {
      if (mode === 'register') {
        return register(buildRegisterPayload(formValue));
      }

      return login(buildLoginPayload(formValue));
    },
    onSuccess: (response: AuthResponse) => {
      setAccessToken(response.accessToken);
      queryClient.setQueryData(['current-user'], response.user);
      navigate('/profile');
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    authMutation.mutate();
  }

  return (
    <AuthorizationForm
      mode={mode}
      value={formValue}
      isPending={authMutation.isPending}
      errorMessage={
        authMutation.isError
          ? 'Не удалось выполнить действие. Проверьте данные и попробуйте ещё раз.'
          : undefined
      }
      onModeChange={setMode}
      onChange={setFormValue}
      onSubmit={handleSubmit}
    />
  );
}