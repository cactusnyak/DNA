import { BadRequestException } from '@nestjs/common';

import { normalizeLocation } from './location';

describe('normalizeLocation', () => {
  it('normalizes a valid location', () => {
    expect(
      normalizeLocation({
        name: ' Талдом ',
        coordinates: { latitude: 56.7308, longitude: 37.5276 },
      }),
    ).toEqual({
      name: 'Талдом',
      coordinates: { latitude: 56.7308, longitude: 37.5276 },
    });
  });

  it('allows an omitted location', () => {
    expect(normalizeLocation(undefined)).toBeNull();
    expect(normalizeLocation(null)).toBeNull();
  });

  it.each([
    { name: '', coordinates: { latitude: 0, longitude: 0 } },
    { name: 'Точка', coordinates: { latitude: 91, longitude: 0 } },
    { name: 'Точка', coordinates: { latitude: 0, longitude: 181 } },
    { name: 'Точка', coordinates: { latitude: 0 } },
  ])('rejects an invalid location: %p', (location) => {
    expect(() => normalizeLocation(location)).toThrow(BadRequestException);
  });
});
