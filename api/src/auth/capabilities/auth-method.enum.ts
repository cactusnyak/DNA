export enum AuthMethod {
  EMAIL_PASSWORD = 'email_password',
  EMAIL_OTP = 'email_otp',
  OTP = 'otp',
  YANDEX = 'yandex',
}

export enum AuthOperation {
  LOGIN = 'login',
  REGISTRATION = 'registration',
}

export const OAUTH_AUTH_METHODS: ReadonlySet<AuthMethod> = new Set([
  AuthMethod.YANDEX,
]);

export function isOAuthAuthMethod(method: AuthMethod): boolean {
  return OAUTH_AUTH_METHODS.has(method);
}
