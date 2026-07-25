import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

export type Location = {
  name: string;
  coordinates: GeoCoordinates;
};

function getObject(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException(`${path} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function getCoordinate(
  value: unknown,
  path: string,
  minimum: number,
  maximum: number,
): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new BadRequestException(
      `${path} must be a finite number between ${minimum} and ${maximum}.`,
    );
  }

  return value;
}

export function normalizeLocation(value: unknown): Location | null {
  if (value === null || value === undefined) return null;

  const location = getObject(value, 'location');
  const unknownLocationKey = Object.keys(location).find(
    (key) => !['name', 'coordinates'].includes(key),
  );

  if (unknownLocationKey) {
    throw new BadRequestException(
      `location.${unknownLocationKey} is not supported.`,
    );
  }

  if (typeof location.name !== 'string' || !location.name.trim()) {
    throw new BadRequestException('location.name must be a non-empty string.');
  }

  const coordinates = getObject(location.coordinates, 'location.coordinates');
  const unknownCoordinatesKey = Object.keys(coordinates).find(
    (key) => !['latitude', 'longitude'].includes(key),
  );

  if (unknownCoordinatesKey) {
    throw new BadRequestException(
      `location.coordinates.${unknownCoordinatesKey} is not supported.`,
    );
  }

  return {
    name: location.name.trim(),
    coordinates: {
      latitude: getCoordinate(
        coordinates.latitude,
        'location.coordinates.latitude',
        -90,
        90,
      ),
      longitude: getCoordinate(
        coordinates.longitude,
        'location.coordinates.longitude',
        -180,
        180,
      ),
    },
  };
}

export function locationToJson(
  value: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  const location = normalizeLocation(value);
  return location ?? Prisma.JsonNull;
}
