import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  getCurrentUser,
  getOAuthProviders,
  login,
  register,
  useAuthStore,
  type AuthResponse,
} from '@/entities/auth';
import {
  syncFavourites,
  useFavouriteStore,
} from '@/entities/favourite';

import { AuthorizationForm } from './components/AuthorizationForm';
import {
  buildLoginPayload,
  buildRegisterPayload,
} from './logic/build-authorization-payload';
import {
  getAuthorizationReferralCodeFromSearchParams,
  getStoredAuthorizationReferralCode,
  saveAuthorizationReferralCode,
} from './logic/authorization-referral-code-storage';
import { getInitialAuthorizationFormValue } from './logic/initial-authorization-form-value';
import type {
  AuthorizationFormValue,
  AuthorizationMode,
} from './types/authorization-form';

export function Authorization() {
  const [searchParams] = useSearchParams();

  const referralCodeFromUrl =
    getAuthorizationReferralCodeFromSearchParams(searchParams);

  const initialReferralCode =
    referralCodeFromUrl || getStoredAuthorizationReferralCode();

  const [mode, setMode] = useState<AuthorizationMode>(
    initialReferralCode ? 'register' : 'login',
  );

  const [formValue, setFormValue] = useState<AuthorizationFormValue>(() =>
    getInitialAuthorizationFormValue({
      inviterReferralCode: initialReferralCode,
    }),
  );

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const { guestItems, clearGuestItems } = useFavouriteStore();

  const oauthAccessToken = searchParams.get('oauth_access_token');

  const { data: availableOAuthProviders } = useQuery({
    queryKey: ['oauth-providers'],
    queryFn: getOAuthProviders,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const oauthMutation = useMutation({
    mutationFn: getCurrentUser,
    onSuccess: (user) => {
      if (!user) {
        return;
      }

      queryClient.setQueryData(['current-user'], user);

      if (oauthAccessToken) {
        setAccessToken(oauthAccessToken);

        if (guestItems.length > 0) {
          syncFavourites(guestItems, oauthAccessToken).then(() => {
            clearGuestItems();
          });
        }

        navigate('/profile');
      }
    },
  });

  useEffect(() => {
    if (!oauthAccessToken) {
      return;
    }

    setAccessToken(oauthAccessToken);

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('oauth_access_token');

    navigate(
      {
        pathname: '/authorization',
        search: nextSearchParams.toString(),
      },
      { replace: true },
    );

    oauthMutation.mutate();
  }, [oauthAccessToken]);

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

      if (guestItems.length > 0) {
        syncFavourites(guestItems, response.accessToken).then(() => {
          clearGuestItems();
        });
      }

      navigate('/profile');
    },
  });

  useEffect(() => {
    if (!referralCodeFromUrl) {
      return;
    }

    saveAuthorizationReferralCode(referralCodeFromUrl);
    setMode('register');

    setFormValue((currentValue) => ({
      ...currentValue,
      inviterReferralCode: referralCodeFromUrl,
    }));
  }, [referralCodeFromUrl]);

  function handleFormChange(nextValue: AuthorizationFormValue) {
    setFormValue(nextValue);

    if (nextValue.inviterReferralCode) {
      saveAuthorizationReferralCode(nextValue.inviterReferralCode);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    authMutation.mutate();
  }

  return (
    <AuthorizationForm
      mode={mode}
      value={formValue}
      isPending={authMutation.isPending || oauthMutation.isPending}
      errorMessage={
        authMutation.isError || oauthMutation.isError
          ? 'Не удалось выполнить действие. Проверьте данные и попробуйте ещё раз.'
          : undefined
      }
      availableOAuthProviders={
        availableOAuthProviders?.length
          ? availableOAuthProviders
          : undefined
      }
      onModeChange={setMode}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
    />
  );
}