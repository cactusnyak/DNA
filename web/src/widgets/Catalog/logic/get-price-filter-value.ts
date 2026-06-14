export type PriceBoundSource = {
  price: number;
};

export function getPriceFilterValue(products: PriceBoundSource[]) {
  if (!products.length) {
    return {
      from: 0,
      to: 0,
    };
  }

  const prices = products.map((product) => product.price);

  return {
    from: Math.min(...prices),
    to: Math.max(...prices),
  };
}