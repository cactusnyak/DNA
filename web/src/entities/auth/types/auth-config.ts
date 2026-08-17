export type AuthMethod = 'email' | 'email_otp' | 'otp' | 'yandex';

export type AuthConfig = {
  login: {
    primaryMethod: AuthMethod;
    methods: AuthMethod[];
  };
  registration: {
    primaryMethod: AuthMethod;
    methods: AuthMethod[];
  };
};
