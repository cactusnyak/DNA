import type {
  ProductAddition,
  SelectedProductAddition,
} from '../types/product';

export function createDefaultSelectedAdditions(
  additions: ProductAddition[],
): SelectedProductAddition[] {
  return additions.flatMap((addition) =>
    addition.defaultValue === null
      ? []
      : [{
          additionId: addition.id,
          type: addition.type,
          value: addition.defaultValue,
        } as SelectedProductAddition],
  );
}

export function calculateProductAdditionsTotal(
  additions: ProductAddition[],
  selected: SelectedProductAddition[],
) {
  const selectedById = new Map(selected.map((item) => [item.additionId, item]));
  return additions.reduce((sum, addition) => {
    const selection = selectedById.get(addition.id);
    if (!selection || selection.type !== addition.type) return sum;
    if (addition.type === 'boolean' && selection.type === 'boolean') {
      return sum + (selection.value ? addition.price : 0);
    }
    if (addition.type === 'quantity' && selection.type === 'quantity') {
      return sum + selection.value * addition.price;
    }
    return sum;
  }, 0);
}

export function validateSelectedProductAdditions(
  additions: ProductAddition[],
  selected: SelectedProductAddition[],
) {
  const selectedById = new Map(selected.map((item) => [item.additionId, item]));
  const errors: Record<string, string> = {};
  additions.forEach((addition) => {
    const selection = selectedById.get(addition.id);
    if (!selection) {
      if (addition.required) errors[addition.id] = 'Выберите значение.';
      return;
    }
    if (selection.type !== addition.type) {
      errors[addition.id] = 'Некорректный тип значения.';
    } else if (
      addition.type === 'quantity' &&
      selection.type === 'quantity' &&
      (selection.value < addition.min ||
        (addition.max !== null && selection.value > addition.max))
    ) {
      errors[addition.id] = 'Количество вне допустимого диапазона.';
    }
  });
  return errors;
}

export function createCartConfigurationKey(
  productId: string,
  selected: SelectedProductAddition[],
) {
  const canonical = [...selected]
    .map(({ additionId, type, value }) => ({ additionId, type, value }))
    .sort((first, second) => first.additionId.localeCompare(second.additionId));
  return `${productId}:${JSON.stringify(canonical)}`;
}
