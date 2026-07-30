import type { SmsRuErrorCategory } from './sms-ru.types';

export class SmsRuError extends Error {
  constructor(
    readonly category: SmsRuErrorCategory,
    readonly providerStatusCode?: number,
    message = 'SMS provider request failed',
  ) {
    super(message);
    this.name = 'SmsRuError';
  }
}

export function mapSmsRuStatus(code?: number): SmsRuErrorCategory {
  if (code === 200 || code === 301) return 'PROVIDER_AUTH_ERROR';
  if (code === 201) return 'PROVIDER_BALANCE_ERROR';
  if ([202, 207, 214, 215, 550].includes(code ?? -1))
    return 'INVALID_RECIPIENT';
  if (
    [206, 230, 231, 232, 233, 501, 502, 503, 504, 505, 506, 507].includes(
      code ?? -1,
    )
  )
    return 'RATE_LIMITED';
  if ([203, 204, 205, 210, 212, 221, 222].includes(code ?? -1))
    return 'PROVIDER_CONFIGURATION_ERROR';
  if (code === 220 || code === 500) return 'PROVIDER_TEMPORARILY_UNAVAILABLE';
  if (code !== undefined) return 'MESSAGE_REJECTED';
  return 'UNKNOWN_PROVIDER_ERROR';
}
