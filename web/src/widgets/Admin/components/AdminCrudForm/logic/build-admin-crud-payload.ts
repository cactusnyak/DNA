import type { AdStatus } from '@/entities/ad';
import type { OrderStatus } from '@/entities/order';
import type { UserRole } from '@/entities/user';

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

function isFile(value: AdminCrudFormValue): value is File {
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
    };
  }

  if (tabId === 'market-products') {
    const existingImageUrls = getImageUrls(values.imageUrls);
    const imageFiles = getFiles(values.imageFiles);
    const uploadedImageUrls = await Promise.all(imageFiles.map(uploadImage));

    return {
      title: String(values.title ?? ''),
      slug: String(values.slug ?? ''),
      description: String(values.description ?? ''),
      categoryId: String(values.categoryId ?? ''),
      price: Number(values.price ?? 0),
      imageUrls: [...existingImageUrls, ...uploadedImageUrls],
      isActive: Boolean(values.isActive),
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
      description: String(values.description ?? ''),
      categoryId: String(values.categoryId ?? ''),
      price: Number(values.price ?? 0),
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
