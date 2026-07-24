import { BadRequestException } from '@nestjs/common';

import {
  normalizeProductAdditions,
  resolveSelectedProductAdditions,
} from './product-additions';

const configuration = [
  {
    id: 'boolean-id',
    type: 'boolean',
    title: '  Электрика  ',
    price: 3000,
    required: true,
    defaultValue: null,
  },
  {
    id: 'quantity-id',
    type: 'quantity',
    title: 'Плиты',
    price: 470,
    required: true,
    defaultValue: 2,
    min: 1,
    max: 5,
    unitLabel: ' шт. ',
  },
];

describe('product additions', () => {
  it('normalizes valid boolean and quantity configuration', () => {
    expect(normalizeProductAdditions(configuration)).toEqual([
      expect.objectContaining({ title: 'Электрика', type: 'boolean' }),
      expect.objectContaining({ unitLabel: 'шт.', type: 'quantity' }),
    ]);
  });

  it.each([
    [[configuration[0], configuration[0]], 'must be unique'],
    [[{ ...configuration[0], type: 'unknown' }], 'must be boolean or quantity'],
    [[{ ...configuration[0], price: -1 }], 'greater than or equal'],
    [[{ ...configuration[0], price: 1.5 }], 'greater than or equal'],
    [[{ ...configuration[1], min: 6, max: 5 }], 'greater than or equal to min'],
    [[{ ...configuration[1], defaultValue: 6 }], 'within min and max'],
  ])('rejects invalid configuration', (value, message) => {
    expect(() => normalizeProductAdditions(value)).toThrow(message);
  });

  it('accepts explicit false for a required boolean and recalculates prices', () => {
    const result = resolveSelectedProductAdditions(configuration, [
      { additionId: 'boolean-id', type: 'boolean', value: false },
      { additionId: 'quantity-id', type: 'quantity', value: 4 },
    ]);
    expect(result.additionsTotal).toBe(1880);
    expect(result.snapshot).toEqual([
      expect.objectContaining({
        title: 'Электрика',
        value: false,
        unitPrice: 3000,
        totalPrice: 0,
      }),
      expect.objectContaining({
        title: 'Плиты',
        value: 4,
        unitPrice: 470,
        totalPrice: 1880,
      }),
    ]);
  });

  it.each([
    [
      [{ additionId: 'quantity-id', type: 'quantity', value: 2 }],
      'missing required',
    ],
    [
      [
        { additionId: 'boolean-id', type: 'boolean', value: true },
        { additionId: 'unknown', type: 'quantity', value: 1 },
      ],
      'unknown additionId',
    ],
  ])('rejects invalid selections', (selected, message) => {
    expect(() =>
      resolveSelectedProductAdditions(configuration, selected),
    ).toThrow(BadRequestException);
    expect(() =>
      resolveSelectedProductAdditions(configuration, selected),
    ).toThrow(message);
  });
});
