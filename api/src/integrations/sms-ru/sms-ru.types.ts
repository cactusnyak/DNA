export type SmsRuErrorCategory =
  | 'INVALID_RECIPIENT'
  | 'RATE_LIMITED'
  | 'PROVIDER_AUTH_ERROR'
  | 'PROVIDER_CONFIGURATION_ERROR'
  | 'PROVIDER_BALANCE_ERROR'
  | 'PROVIDER_TEMPORARILY_UNAVAILABLE'
  | 'MESSAGE_REJECTED'
  | 'UNKNOWN_PROVIDER_ERROR';

export type SmsRuResponse = {
  status?: string;
  status_code?: number;
  balance?: number;
  sms?: Record<
    string,
    {
      status?: string;
      status_code?: number;
      sms_id?: string;
    }
  >;
  senders?: string[];
  callback?: string[];
};
