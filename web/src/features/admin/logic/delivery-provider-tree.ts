import type { AdminDeliveryProvider } from '@/entities/admin';

export type DeliveryProviderTreeRecord =
  | {
      type: 'provider';
      id: string;
      code: string;
      name: string;
      isActive: boolean;
      deletedAt?: null;
      provider: AdminDeliveryProvider;
      children: DeliveryProviderTreeRecord[];
    }
  | {
      type: 'service';
      id: string;
      code: string;
      name: string;
      isActive: boolean;
      deletedAt?: null;
      provider: AdminDeliveryProvider;
      service: AdminDeliveryProvider['services'][number];
      children?: undefined;
    };

export function buildDeliveryProviderTree(providers: AdminDeliveryProvider[]): DeliveryProviderTreeRecord[] {
  return providers.map((provider) => ({
    type: 'provider',
    id: provider.id,
    code: provider.code,
    name: provider.name,
    isActive: provider.isActive,
    provider,
    children: provider.services.map((service) => ({
      type: 'service',
      id: service.id,
      code: service.code,
      name: service.name,
      isActive: service.isActive,
      provider,
      service,
    })),
  }));
}

export function getDeliveryRecordUpdatePath(record: DeliveryProviderTreeRecord) {
  return record.type === 'provider'
    ? `/admin/logistics/providers/${record.id}`
    : `/admin/logistics/services/${record.id}`;
}
