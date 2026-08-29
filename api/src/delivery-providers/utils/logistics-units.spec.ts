import { createDeliveryFingerprint } from './delivery-fingerprint';
import {
  gramsToKilograms,
  millimetersToCentimeters,
  millimetersToMeters,
  normalizeDecimalRubles,
  normalizeKopecks,
  normalizeRussianPhone,
} from './logistics-units';

describe('logistics units', () => {
  it('converts canonical units for both Yandex contours', () => {
    expect(gramsToKilograms(1250)).toBe(1.25);
    expect(millimetersToMeters(850)).toBe(0.85);
    expect(millimetersToCentimeters(850)).toBe(85);
  });

  it('always rounds provider cost up to whole internal rubles', () => {
    expect(normalizeDecimalRubles('100.01')).toBe(101);
    expect(normalizeKopecks(10001)).toBe(101);
  });

  it('normalizes Russian phone numbers', () => {
    expect(normalizeRussianPhone('+7 (912) 345-67-89')).toBe('79123456789');
    expect(normalizeRussianPhone('8 912 345-67-89')).toBe('79123456789');
  });

  it('produces a stable order-independent object fingerprint', () => {
    expect(createDeliveryFingerprint({ b: 2, a: 1 })).toBe(
      createDeliveryFingerprint({ a: 1, b: 2 }),
    );
    expect(createDeliveryFingerprint({ a: 2 })).not.toBe(
      createDeliveryFingerprint({ a: 1 }),
    );
  });
});
