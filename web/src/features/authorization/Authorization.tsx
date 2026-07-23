import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  getCurrentUser,
  getOAuthProviders,
  sendOtp,
  useAuthStore,
  verifyOtp,
} from '@/entities/auth';
import {
  syncFavourites,
  useFavouriteStore,
} from '@/entities/favourite';

import { AuthorizationForm } from './components/AuthorizationForm';
import {
  buildSendOtpPayload,
  buildVerifyOtpPayload,
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

type AuthorizationStep = 'login' | 'otp';

export function Authorization() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const processedOAuthTokenRef = useRef<string | null>(null);

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const { guestItems, clearGuestItems } = useFavouriteStore();

  const referralCodeFromUrl =
    getAuthorizationReferralCodeFromSearchParams(searchParams);

  const initialReferralCode =
    referralCodeFromUrl || getStoredAuthorizationReferralCode();

  const oauthAccessToken = searchParams.get('oauth_access_token');
  const oauthError = searchParams.get('oauth_error');

  const [mode, setMode] = useState<AuthorizationMode>(
    initialReferralCode ? 'register' : 'login',
  );

  const [step, setStep] = useState<AuthorizationStep>('login');

  const [formValue, setFormValue] = useState<AuthorizationFormValue>(() =>
    getInitialAuthorizationFormValue({
      inviterReferralCode: initialReferralCode,
    }),
  );

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

      if (guestItems.length > 0 && oauthAccessToken) {
        void syncFavourites(guestItems, oauthAccessToken).then(() => {
          clearGuestItems();
        });
      }

      navigate('/profile', { replace: true });
    },
  });

  useEffect(() => {
    if (
      !oauthAccessToken ||
      processedOAuthTokenRef.current === oauthAccessToken
    ) {
      return;
    }

    processedOAuthTokenRef.current = oauthAccessToken;
    setAccessToken(oauthAccessToken);
    oauthMutation.mutate();
  }, [oauthAccessToken]);

  useEffect(() => {
    if (!oauthError) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('oauth_error');

    navigate(
      {
        pathname: '/authorization',
        search: nextSearchParams.toString(),
      },
      { replace: true },
    );
  }, [oauthError]);

  const sendOtpMutation = useMutation({
    mutationFn: () => sendOtp(buildSendOtpPayload(formValue, mode)),
    onSuccess: () => {
      setStep('otp');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: () => verifyOtp(buildVerifyOtpPayload(formValue, mode)),
    onSuccess: (response) => {
      setAccessToken(response.accessToken);
      queryClient.setQueryData(['current-user'], response.user);

      if (guestItems.length > 0) {
        void syncFavourites(guestItems, response.accessToken).then(() => {
          clearGuestItems();
        });
      }

      navigate('/profile', { replace: true });
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

  function handleModeChange(nextMode: AuthorizationMode) {
    setMode(nextMode);
    setStep('login');

    setFormValue((currentValue) => ({
      ...currentValue,
      otpCode: '',
    }));
  }

  function handleSendOtp() {
    sendOtpMutation.mutate();
  }

  function handleVerifyOtp() {
    verifyOtpMutation.mutate();
  }

  const errorMessage =
    sendOtpMutation.error ||
      verifyOtpMutation.error ||
      oauthMutation.error
      ? 'Не удалось выполнить действие. Проверьте данные и попробуйте ещё раз.'
      : oauthError ?? undefined;

  return (
    <AuthorizationForm
      mode={mode}
      step={step}
      value={formValue}
      isPending={
        sendOtpMutation.isPending ||
        verifyOtpMutation.isPending ||
        oauthMutation.isPending
      }
      errorMessage={errorMessage}
      availableOAuthProviders={
        availableOAuthProviders?.length
          ? availableOAuthProviders
          : undefined
      }
      onModeChange={handleModeChange}
      onChange={handleFormChange}
      onSendOtp={handleSendOtp}
      onVerifyOtp={handleVerifyOtp}
    />
  );
}