import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

export const PRODUCT_ADDITION_TYPES = [
  { key: 'boolean', name: 'Да/нет' },
  { key: 'quantity', name: 'Количество' },
] as const;

type ProductAdditionBase = {
  id: string;
  title: string;
  price: number;
  required: boolean;
};

export type BooleanProductAddition = ProductAdditionBase & {
  type: 'boolean';
  defaultValue: boolean | null;
};

export type QuantityProductAddition = ProductAdditionBase & {
  type: 'quantity';
  defaultValue: number | null;
  min: number;
  max: number | null;
  unitLabel: string;
};

export type ProductAddition = BooleanProductAddition | QuantityProductAddition;

export type SelectedProductAddition =
  | { additionId: string; type: 'boolean'; value: boolean }
  | { additionId: string; type: 'quantity'; value: number };

export type ResolvedProductAddition = {
  additionId: string;
  type: 'boolean' | 'quantity';
  title: string;
  value: boolean | number;
  unitLabel?: string;
  unitPrice: number;
  totalPrice: number;
};

function fail(path: string, message: string): never {
  throw new BadRequestException(`${path} ${message}`);
}

function getObject(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(path, 'must be an object.');
  }
  return value as Record<string, unknown>;
}

function getInteger(value: unknown, path: string, minimum = 0) {
  if (!Number.isInteger(value) || (value as number) < minimum) {
    fail(path, `must be an integer greater than or equal to ${minimum}.`);
  }
  return value as number;
}

function getNullableInteger(value: unknown, path: string) {
  return value === null ? null : getInteger(value, path);
}

function assertKeys(
  item: Record<string, unknown>,
  allowed: string[],
  path: string,
) {
  const unknownKey = Object.keys(item).find((key) => !allowed.includes(key));
  if (unknownKey) fail(`${path}.${unknownKey}`, 'is not supported.');
}

export function normalizeProductAdditions(value: unknown): ProductAddition[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) fail('additions', 'must be an array.');

  const ids = new Set<string>();
  return value.map((rawItem, index) => {
    const path = `additions[${index}]`;
    const item = getObject(rawItem, path);
    if (typeof item.id !== 'string' || !item.id.trim()) {
      fail(`${path}.id`, 'must be a non-empty string.');
    }
    const id = item.id.trim();
    if (ids.has(id)) fail(`${path}.id`, 'must be unique.');
    ids.add(id);
    if (typeof item.title !== 'string' || !item.title.trim()) {
      fail(`${path}.title`, 'must be a non-empty string.');
    }
    if (typeof item.required !== 'boolean') {
      fail(`${path}.required`, 'must be a boolean.');
    }
    const base = {
      id,
      title: item.title.trim(),
      price: getInteger(item.price, `${path}.price`),
      required: item.required,
    };

    if (item.type === 'boolean') {
      assertKeys(
        item,
        ['id', 'type', 'title', 'price', 'required', 'defaultValue'],
        path,
      );
      if (
        item.defaultValue !== null &&
        typeof item.defaultValue !== 'boolean'
      ) {
        fail(`${path}.defaultValue`, 'must be true, false, or null.');
      }
      return { ...base, type: 'boolean', defaultValue: item.defaultValue };
    }

    if (item.type === 'quantity') {
      assertKeys(
        item,
        [
          'id',
          'type',
          'title',
          'price',
          'required',
          'defaultValue',
          'min',
          'max',
          'unitLabel',
        ],
        path,
      );
      const min = getInteger(item.min, `${path}.min`);
      const max = getNullableInteger(item.max, `${path}.max`);
      const defaultValue = getNullableInteger(
        item.defaultValue,
        `${path}.defaultValue`,
      );
      if (item.required && min < 1) {
        fail(`${path}.min`, 'must be at least 1 when required is true.');
      }
      if (max !== null && max < min) {
        fail(`${path}.max`, 'must be greater than or equal to min.');
      }
      if (
        defaultValue !== null &&
        (defaultValue < min || (max !== null && defaultValue > max))
      ) {
        fail(`${path}.defaultValue`, 'must be within min and max.');
      }
      if (typeof item.unitLabel !== 'string' || !item.unitLabel.trim()) {
        fail(`${path}.unitLabel`, 'must be a non-empty string.');
      }
      return {
        ...base,
        type: 'quantity',
        defaultValue,
        min,
        max,
        unitLabel: item.unitLabel.trim(),
      };
    }

    fail(`${path}.type`, 'must be boolean or quantity.');
  });
}

export function productAdditionsToJson(
  additions: ProductAddition[],
): Prisma.InputJsonValue {
  return additions;
}

export function resolveSelectedProductAdditions(
  configurationValue: unknown,
  selectedValue: unknown,
): { additionsTotal: number; snapshot: ResolvedProductAddition[] } {
  const configuration = normalizeProductAdditions(configurationValue);
  if (!Array.isArray(selectedValue)) {
    fail('selectedAdditions', 'must be an array.');
  }
  const selectedById = new Map<string, SelectedProductAddition>();
  selectedValue.forEach((rawSelection, index) => {
    const path = `selectedAdditions[${index}]`;
    const item = getObject(rawSelection, path);
    assertKeys(item, ['additionId', 'type', 'value'], path);
    if (typeof item.additionId !== 'string' || !item.additionId.trim()) {
      fail(`${path}.additionId`, 'must be a non-empty string.');
    }
    if (selectedById.has(item.additionId)) {
      fail(`${path}.additionId`, 'must be unique.');
    }
    if (item.type === 'boolean' && typeof item.value === 'boolean') {
      selectedById.set(item.additionId, item as SelectedProductAddition);
      return;
    }
    if (item.type === 'quantity' && Number.isInteger(item.value)) {
      selectedById.set(item.additionId, item as SelectedProductAddition);
      return;
    }
    fail(path, 'has an invalid type or value.');
  });

  const configurationById = new Map(
    configuration.map((addition) => [addition.id, addition]),
  );
  selectedById.forEach((_, id) => {
    if (!configurationById.has(id)) {
      fail('selectedAdditions', `contains unknown additionId "${id}".`);
    }
  });

  const snapshot: ResolvedProductAddition[] = [];
  configuration.forEach((addition) => {
    const selected = selectedById.get(addition.id);
    if (!selected) {
      if (addition.required) {
        fail(
          'selectedAdditions',
          `is missing required addition "${addition.title}". Product parameters may have changed.`,
        );
      }
      return;
    }
    if (selected.type !== addition.type) {
      fail(
        'selectedAdditions',
        `has the wrong type for addition "${addition.title}".`,
      );
    }
    if (addition.type === 'boolean' && selected.type === 'boolean') {
      snapshot.push({
        additionId: addition.id,
        type: addition.type,
        title: addition.title,
        value: selected.value,
        unitPrice: addition.price,
        totalPrice: selected.value ? addition.price : 0,
      });
      return;
    }
    if (addition.type === 'quantity' && selected.type === 'quantity') {
      if (
        selected.value < addition.min ||
        (addition.max !== null && selected.value > addition.max)
      ) {
        fail(
          'selectedAdditions',
          `has an out-of-range value for addition "${addition.title}".`,
        );
      }
      snapshot.push({
        additionId: addition.id,
        type: addition.type,
        title: addition.title,
        value: selected.value,
        unitLabel: addition.unitLabel,
        unitPrice: addition.price,
        totalPrice: selected.value * addition.price,
      });
    }
  });

  return {
    additionsTotal: snapshot.reduce((sum, item) => sum + item.totalPrice, 0),
    snapshot,
  };
}
