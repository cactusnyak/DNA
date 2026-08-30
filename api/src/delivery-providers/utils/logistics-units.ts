import { DeliveryProviderError } from '../delivery-provider.error';

export const gramsToKilograms = (grams: number) => grams / 1000;
export const millimetersToMeters = (millimeters: number) => millimeters / 1000;
export const millimetersToCentimeters = (millimeters: number) =>
  millimeters / 10;

export function normalizeDecimalRubles(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(String(value));
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new DeliveryProviderError(
      'MALFORMED_PROVIDER_RESPONSE',
      'Провайдер вернул некорректную цену.',
    );
  }
  return Math.ceil(parsed);
}

export function normalizeKopecks(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new DeliveryProviderError(
      'MALFORMED_PROVIDER_RESPONSE',
      'Провайдер вернул некорректную цену.',
    );
  }
  return Math.ceil(parsed / 100);
}

export function normalizeRussianPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const normalized =
    digits.length === 11 && digits.startsWith('8')
      ? `7${digits.slice(1)}`
      : digits;
  if (normalized.length !== 11 || !normalized.startsWith('7')) {
    throw new DeliveryProviderError(
      'VALIDATION_ERROR',
      'Укажите российский телефон получателя.',
    );
  }
  return normalized;
}
