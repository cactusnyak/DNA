import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HttpError } from '@/shared/api/http-client';
import type { User } from '@/entities/user';

import {
  getCurrentUser,
  getOAuthProviders,
  loginEmail,
  registerEmail,
  sendOtp,
  useAuthCapabilities,
  useAuthStore,
  verifyOtp,
} from '@/entities/auth';
import { syncFavourites, useFavouriteStore } from '@/entities/favourite';

import { AuthorizationForm } from './components/AuthorizationForm';
import {
  buildLoginEmailPayload,
  buildRegisterEmailPayload,
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
  AuthorizationFormMethod,
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
  const { config: authConfig } = useAuthCapabilities();

  const referralCodeFromUrl =
    getAuthorizationReferralCodeFromSearchParams(searchParams);

  const initialReferralCode =
    referralCodeFromUrl || getStoredAuthorizationReferralCode();

  const oauthAccessToken = searchParams.get('oauth_access_token');
  const oauthError = searchParams.get('oauth_error');

  const [mode, setMode] = useState<AuthorizationMode>(
    initialReferralCode ? 'register' : 'login',
  );

  function toAuthConfigOperation(forMode: AuthorizationMode) {
    return forMode === 'register' ? 'registration' : 'login';
  }

  const availableFormMethods = useMemo<AuthorizationFormMethod[]>(
    () =>
      authConfig[toAuthConfigOperation(mode)].methods.filter(
        (method): method is AuthorizationFormMethod => method !== 'yandex',
      ),
    [authConfig, mode],
  );

  function getDefaultMethod(
    forMode: AuthorizationMode,
  ): AuthorizationFormMethod {
    const operationConfig = authConfig[toAuthConfigOperation(forMode)];
    const methods = operationConfig.methods.filter(
      (item): item is AuthorizationFormMethod => item !== 'yandex',
    );
    const primary = operationConfig.primaryMethod;

    if (primary !== 'yandex' && methods.includes(primary)) {
      return primary;
    }

    return methods[0] ?? 'otp';
  }

  const [requestedMethod, setRequestedMethod] =
    useState<AuthorizationFormMethod>(() => getDefaultMethod(mode));

  const activeMethod = availableFormMethods.includes(requestedMethod)
    ? requestedMethod
    : getDefaultMethod(mode);

  const [step, setStep] = useState<AuthorizationStep>('login');
  const [resendSeconds, setResendSeconds] = useState(0);

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

  const visibleOAuthProviders = authConfig[
    toAuthConfigOperation(mode)
  ].methods.includes('yandex')
    ? availableOAuthProviders
    : [];

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
    onSuccess: (response) => {
      setStep('otp');
      setResendSeconds(response.resendAfterSeconds);
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

  function handleEmailAuthSuccess(response: {
    accessToken: string;
    user: User;
  }) {
    setAccessToken(response.accessToken);
    queryClient.setQueryData(['current-user'], response.user);

    if (guestItems.length > 0) {
      void syncFavourites(guestItems, response.accessToken).then(() => {
        clearGuestItems();
      });
    }

    navigate('/profile', { replace: true });
  }

  const registerEmailMutation = useMutation({
    mutationFn: () => registerEmail(buildRegisterEmailPayload(formValue)),
    onSuccess: handleEmailAuthSuccess,
  });

  const loginEmailMutation = useMutation({
    mutationFn: () => loginEmail(buildLoginEmailPayload(formValue)),
    onSuccess: handleEmailAuthSuccess,
  });

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timeout = window.setTimeout(
      () => setResendSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [resendSeconds]);

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
    setRequestedMethod(getDefaultMethod(nextMode));

    setFormValue((currentValue) => ({
      ...currentValue,
      otpCode: '',
      password: '',
    }));
  }

  function handleMethodChange(nextMethod: AuthorizationFormMethod) {
    setRequestedMethod(nextMethod);
    setStep('login');

    setFormValue((currentValue) => ({
      ...currentValue,
      otpCode: '',
      password: '',
    }));
  }

  function handleSendOtp() {
    if (sendOtpMutation.isPending || resendSeconds > 0) return;
    sendOtpMutation.mutate();
  }

  function handleVerifyOtp() {
    verifyOtpMutation.mutate();
  }

  function handleSubmitEmail() {
    if (mode === 'register') {
      registerEmailMutation.mutate();
    } else {
      loginEmailMutation.mutate();
    }
  }

  const isEmailMethod = activeMethod === 'email_password';

  const requestError =
    sendOtpMutation.error ||
    verifyOtpMutation.error ||
    registerEmailMutation.error ||
    loginEmailMutation.error ||
    oauthMutation.error;
  const errorMessage =
    requestError instanceof HttpError && requestError.status === 429
      ? 'Слишком много попыток. Подождите и попробуйте снова.'
      : requestError instanceof HttpError && requestError.status >= 500
        ? 'Сервис отправки временно недоступен. Попробуйте позже.'
        : requestError instanceof HttpError && requestError.status === 409
          ? 'Пользователь с такими данными уже зарегистрирован.'
          : requestError instanceof HttpError && isEmailMethod
            ? requestError.message
            : requestError
              ? 'Неверный или истёкший код либо данные не удалось подтвердить.'
              : (oauthError ?? undefined);

  return (
    <AuthorizationForm
      mode={mode}
      step={step}
      activeMethod={activeMethod}
      availableFormMethods={availableFormMethods}
      value={formValue}
      isPending={
        sendOtpMutation.isPending ||
        verifyOtpMutation.isPending ||
        registerEmailMutation.isPending ||
        loginEmailMutation.isPending ||
        oauthMutation.isPending
      }
      errorMessage={errorMessage}
      resendSeconds={resendSeconds}
      availableOAuthProviders={
        visibleOAuthProviders?.length ? visibleOAuthProviders : undefined
      }
      onModeChange={handleModeChange}
      onMethodChange={handleMethodChange}
      onChange={handleFormChange}
      onSendOtp={handleSendOtp}
      onVerifyOtp={handleVerifyOtp}
      onSubmitEmail={handleSubmitEmail}
    />
  );
}
