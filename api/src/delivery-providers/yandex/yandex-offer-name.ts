const TITLES: Record<string, string> = {
  express: 'Экспресс',
  express_30min_longer: 'Экспресс +30 минут',
  express_60min_longer: 'Экспресс +60 минут',
  courier: 'Доставка до двери',
  pickup: 'Доставка до ПВЗ',
};

export function getYandexOfferTitle(
  code: string | undefined,
  fallback: string,
) {
  return (code && TITLES[code]) || fallback || 'Яндекс Доставка';
}
