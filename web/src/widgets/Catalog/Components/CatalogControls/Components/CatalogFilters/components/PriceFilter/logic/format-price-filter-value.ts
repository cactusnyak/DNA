export function formatPriceFilterValue(value: number, currencyLabel = '') {
  const formattedValue = value.toLocaleString('ru-RU');

  return currencyLabel
    ? `${formattedValue} ${currencyLabel}`
    : formattedValue;
}