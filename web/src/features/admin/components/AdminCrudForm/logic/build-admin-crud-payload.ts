import type { AdStatus } from '@/entities/ad';
import type { OrderStatus } from '@/entities/order';
import type { UserRole } from '@/entities/user';
import type { ProductAddition } from '@/entities/product';
import { markdownToContentDescription } from '@/shared/utils/content-description';

import type { AdminManagementTabId } from '../../../types/admin-management';
import type {
  AdminCrudFormValue,
  AdminCrudFormValues,
  AdminCrudPayload,
  AdminImageUploader,
} from '../types/admin-crud-form';

type BuildAdminCrudPayloadParams = {
  tabId: AdminManagementTabId;
  values: AdminCrudFormValues;
  uploadImage: AdminImageUploader;
};

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function getFile(value: AdminCrudFormValue) {
  return isFile(value) ? value : null;
}

function getFiles(value: AdminCrudFormValue) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is File => isFile(item));
}

function getImageUrls(value: AdminCrudFormValue) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split('\n')
    .map((imageUrl) => imageUrl.trim())
    .filter(Boolean);
}

function getLocation(values: AdminCrudFormValues) {
  const name = String(values.locationName ?? '').trim();
  const latitudeValue = String(values.locationLatitude ?? '').trim();
  const longitudeValue = String(values.locationLongitude ?? '').trim();

  if (!name && !latitudeValue && !longitudeValue) return undefined;

  if (!name || !latitudeValue || !longitudeValue) {
    throw new Error(
      'Для геопозиции заполните название точки, широту и долготу.',
    );
  }

  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error('Широта должна быть числом от −90 до 90.');
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('Долгота должна быть числом от −180 до 180.');
  }

  return { name, coordinates: { latitude, longitude } };
}

export async function buildAdminCrudPayload({
  tabId,
  values,
  uploadImage,
}: BuildAdminCrudPayloadParams): Promise<AdminCrudPayload> {
  if (tabId === 'market-categories' || tabId === 'ad-categories') {
    const imageFile = getFile(values.imageFile);
    const imageUrl = imageFile
      ? await uploadImage(imageFile)
      : String(values.imageUrl ?? '');

    return {
      name: String(values.name ?? ''),
      slug: String(values.slug ?? ''),
      description: String(values.description ?? ''),
      parentId: String(values.parentId ?? ''),
      sortOrder: Number(values.sortOrder ?? 0),
      imageUrl,
      imageAlt: String(values.imageAlt ?? ''),
      isActive: Boolean(values.isActive),
      ...(tabId === 'market-categories' ? { isOversized: Boolean(values.isOversized) } : {}),
    };
  }

  if (tabId === 'market-products') {
    const existingImageUrls = getImageUrls(values.imageUrls);
    const imageFiles = getFiles(values.imageFiles);
    const uploadedImageUrls = await Promise.all(imageFiles.map(uploadImage));

    return {
      title: String(values.title ?? ''),
      slug: String(values.slug ?? ''),
      description: markdownToContentDescription(
        String(values.description ?? ''),
      ),
      categoryId: String(values.categoryId ?? ''),
      price: Number(values.price ?? 0),
      sku: String(values.sku ?? '').trim() || undefined,
      purchasePrice: String(values.purchasePrice ?? '').trim() === '' ? null : Number(values.purchasePrice),
      location: getLocation(values),
      imageUrls: [...existingImageUrls, ...uploadedImageUrls],
      additions: Array.isArray(values.additions)
        ? (values.additions as ProductAddition[])
        : [],
      isActive: Boolean(values.isActive),
      isOversizedOverride: values.isOversizedOverride === 'inherit' ? null : values.isOversizedOverride === 'oversized',
      logistics: {
        shippingProfile: values.shippingProfileEnabled ? {
          isFragile: Boolean(values.isFragile),
          isStackable: Boolean(values.isStackable),
          ageRestricted: Boolean(values.ageRestricted),
          handlingNotes: String(values.handlingNotes ?? '').trim() || undefined,
        } : undefined,
        packages: Array.isArray(values.packages) ? values.packages as import('@/entities/admin').AdminProductPackage[] : [],
        warehouseIds: Array.isArray(values.warehouseIds) ? values.warehouseIds.filter((value): value is string => typeof value === 'string') : [],
        primaryWarehouseId: String(values.primaryWarehouseId ?? '').trim() || undefined,
        deliveryServiceIds: Array.isArray(values.deliveryServiceIds) ? values.deliveryServiceIds.filter((value): value is string => typeof value === 'string') : [],
      },
    };
  }

  if (tabId === 'collections') {
    return {
      title: String(values.title ?? ''),
      slug: String(values.slug ?? ''),
      type: values.type === 'PRODUCT' ? 'PRODUCT' : 'CATEGORY',
      description: String(values.description ?? ''),
      isActive: Boolean(values.isActive),
    };
  }

  if (tabId === 'ads') {
    const existingImageUrls = getImageUrls(values.imageUrls);
    const imageFiles = getFiles(values.imageFiles);
    const uploadedImageUrls = await Promise.all(imageFiles.map(uploadImage));

    return {
      title: String(values.title ?? ''),
      slug: String(values.slug ?? ''),
      description: markdownToContentDescription(
        String(values.description ?? ''),
      ),
      categoryId: String(values.categoryId ?? ''),
      price: Number(values.price ?? 0),
      location: getLocation(values),
      status: (values.status as AdStatus) ?? 'PUBLISHED',
      imageUrls: [...existingImageUrls, ...uploadedImageUrls],
      isActive: Boolean(values.isActive),
      contactPhone: String(values.contactPhone ?? '').trim() || undefined,
      contactTelegram: String(values.contactTelegram ?? '').trim() || undefined,
      contactEmail: String(values.contactEmail ?? '').trim() || undefined,
      contactOther: String(values.contactOther ?? '').trim() || undefined,
    };
  }

  if (tabId === 'users') {
    return {
      role: (values.role as UserRole) ?? 'DEFAULT',
    };
  }

  return {
    status: values.status as OrderStatus,
  };
}
