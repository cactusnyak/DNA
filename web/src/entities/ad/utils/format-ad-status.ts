import type { AdStatus } from '../types/ad-status';

const adStatusLabels: Record<AdStatus, string> = {
  DRAFT: 'Черновик',
  PENDING_MODERATION: 'На модерации',
  PUBLISHED: 'Опубликовано',
  REJECTED: 'Отклонено',
  ARCHIVED: 'В архиве',
};

export function formatAdStatus(status: AdStatus) {
  return adStatusLabels[status] ?? status;
}

export const AD_STATUS_LABELS = adStatusLabels;
