export type AuthMethod = 'email' | 'otp' | 'yandex';

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
