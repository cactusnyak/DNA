import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings2, X } from "lucide-react";

import {
  FormImageFilesField,
  FormInputField,
  FormMultiSelectField,
  FormSelectField,
  FormTextareaField,
  FormToggleField,
} from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { getAdminRewardConfiguration, getAdminRewardPreview, type AdminProductPackage } from "@/entities/admin";
import { formatPrice } from "@/shared/utils/format-price";
import { useAuthStore } from "@/entities/auth";
import type { AdminCrudFieldsProps } from "../../types/admin-crud-form";
import type { ProductAddition } from "@/entities/product";
import { ProductAdditionsFields } from "../ProductAdditionsFields";
import { LocationCrudFields } from "../LocationCrudFields";
import {
  buildDeliveryServiceOptions,
  buildWarehouseOptions,
} from "../../../../logic/product-logistics-options";

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getFileArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is File => item instanceof File)
    : [];
}

export function ProductCrudFields({
  values,
  categories,
  warehouses = [],
  deliveryProviders = [],
  logisticsOptionsState = "ready",
  onRetryLogisticsOptions,
  onValueChange,
}: AdminCrudFieldsProps) {
  const categoryOptions = [
    {
      value: "",
      label: "Выберите категорию",
      disabled: true,
    },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const existingImageUrls = getStringArray(values.imageUrls);
  const imageFiles = getFileArray(values.imageFiles);
  const packages = Array.isArray(values.packages)
    ? (values.packages as AdminProductPackage[])
    : [];
  const [visiblePackageIndex, setVisiblePackageIndex] = useState<number | null>(
    packages.length ? packages.length - 1 : null,
  );
  const warehouseIds = getStringArray(values.warehouseIds);
  const serviceIds = getStringArray(values.deliveryServiceIds);
  const accessToken = useAuthStore((state) => state.accessToken);
  const rewardConfiguration = useQuery({
    queryKey: ["admin-reward-configuration"],
    queryFn: () => getAdminRewardConfiguration(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const configuredShares = Array.isArray(values.rewardShares)
    ? (values.rewardShares as Array<{ depth: number; shareBasisPoints: number }>)
    : [];
  const rewardRows = [
    { depth: 0, name: "L0 · Кешбэк покупателя", defaultShare: 1000 },
    ...(rewardConfiguration.data?.levels ?? []).map((level) => ({
      depth: level.depth,
      name: `L${level.depth} · ${level.name}`,
      defaultShare: level.depth === 1 ? 6000 : level.depth === 2 ? 3000 : 0,
    })),
  ];
  const effectiveShares = rewardRows.map((row) => ({
    depth: row.depth,
    shareBasisPoints:
      configuredShares.find((share) => share.depth === row.depth)?.shareBasisPoints ?? row.defaultShare,
  }));
  const totalRewardShare = effectiveShares.reduce((sum, share) => sum + share.shareBasisPoints, 0);
  const rewardPreview = useQuery({
    queryKey: [
      "admin-reward-preview",
      values.price,
      values.purchasePrice,
      values.rewardEnabled,
      effectiveShares,
    ],
    queryFn: () =>
      getAdminRewardPreview(accessToken ?? "", {
        price: Math.trunc(Number(values.price) || 0),
        costBasis: String(values.purchasePrice ?? "").trim()
          ? Math.trunc(Number(values.purchasePrice))
          : null,
        rewardEnabled: Boolean(values.rewardEnabled),
        shares: effectiveShares,
      }),
    enabled: Boolean(accessToken) && totalRewardShare <= 10_000,
  });

  const updateRewardShare = (depth: number, percent: number) => {
    onValueChange(
      "rewardShares",
      effectiveShares.map((share) =>
        share.depth === depth
          ? { ...share, shareBasisPoints: Math.max(0, Math.min(10_000, Math.trunc(percent * 100))) }
          : share,
      ),
    );
    onValueChange("rewardConfigVersion", String(rewardConfiguration.data?.version ?? 1));
  };

  const warehouseOptions = buildWarehouseOptions(warehouses, warehouseIds);

  const allServices = deliveryProviders.flatMap((provider) =>
    provider.services.map((service) => ({ provider, service })),
  );
  const activeServices = allServices.filter(
    ({ provider, service }) => provider.isActive && service.isActive,
  );
  const serviceOptions = buildDeliveryServiceOptions(
    deliveryProviders,
    serviceIds,
  );

  const updatePackage = (
    index: number,
    patch: Partial<AdminProductPackage>,
  ) => {
    onValueChange(
      "packages",
      packages.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const addPackage = () => {
    setVisiblePackageIndex(packages.length);
    onValueChange("packages", [
      ...packages,
      {
        sequence: packages.length,
        type: "BOX",
        quantity: 1,
        weightGrams: 1,
        lengthMillimeters: 1,
        widthMillimeters: 1,
        heightMillimeters: 1,
      },
    ]);
  };

  const removePackage = (index: number) => {
    setVisiblePackageIndex((currentIndex) => {
      if (currentIndex === null || currentIndex < index) return currentIndex;
      if (currentIndex === index) return null;
      return currentIndex - 1;
    });
    onValueChange(
      "packages",
      packages
        .filter((_, itemIndex) => itemIndex !== index)
        .map((value, sequence) => ({ ...value, sequence })),
    );
  };

  const handleWarehouseChange = (nextWarehouseIds: string[]) => {
    onValueChange("warehouseIds", nextWarehouseIds);
    if (!nextWarehouseIds.includes(String(values.primaryWarehouseId ?? ""))) {
      onValueChange("primaryWarehouseId", "");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <FormInputField
        name="title"
        required
        label="Название"
        value={String(values.title ?? "")}
        onChange={(event) => onValueChange("title", event.target.value)}
      />

      <div className="space-y-5">
        <div className="space-y-4">
          <FormInputField
            name="sku"
            label="SKU"
            value={String(values.sku ?? "")}
            onChange={(event) => onValueChange("sku", event.target.value)}
          />
          <FormToggleField
            label="Начислять бонусы за товар"
            checked={Boolean(values.rewardEnabled)}
            onCheckedChange={(value) => onValueChange("rewardEnabled", value)}
          />
          <section className="rounded-2xl border border-border/80 p-4">
            <h3 className="text-sm font-medium">Распределение бонусного фонда</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Проценты от фонда BV. Нераспределённая часть остаётся платформе.
            </p>
            {rewardConfiguration.isPending && <p className="mt-3 text-sm">Загружаем уровни…</p>}
            {rewardConfiguration.isError && <p className="mt-3 text-sm text-dangerous">Не удалось загрузить конфигурацию уровней.</p>}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {rewardRows.map((row) => {
                const share = effectiveShares.find((item) => item.depth === row.depth);
                return (
                  <FormInputField
                    key={row.depth}
                    name={`rewardShare${row.depth}`}
                    type="number"
                    min={0}
                    max={100}
                    label={`${row.name}, %`}
                    value={String((share?.shareBasisPoints ?? 0) / 100)}
                    onChange={(event) => updateRewardShare(row.depth, Number(event.target.value))}
                  />
                );
              })}
            </div>
            <p className={`mt-3 text-sm ${totalRewardShare > 10_000 ? "text-dangerous" : "text-muted-foreground"}`}>
              Распределено: {(totalRewardShare / 100).toFixed(2)}% / 100%
            </p>
            {rewardPreview.data && (
              <div className="mt-3 rounded-xl bg-primary/5 p-3 text-sm">
                <p className="font-medium">Бонусный фонд: {formatPrice(rewardPreview.data.rewardBudget)}</p>
                <ul className="mt-2 grid gap-1 text-muted-foreground">
                  {rewardPreview.data.distributions.filter((item) => item.amount > 0).map((item) => (
                    <li key={item.depth}>L{item.depth}: {formatPrice(item.amount)}</li>
                  ))}
                </ul>
              </div>
            )}
            {Boolean(values.rewardEnabled) && (!String(values.purchasePrice ?? "").trim() || Number(values.purchasePrice) <= 0) && (
              <p className="mt-2 text-sm text-warning">Без положительной закупочной стоимости награда будет равна нулю.</p>
            )}
          </section>
          <FormInputField
            name="purchasePrice"
            type="number"
            min={0}
            label="Закупочная стоимость, ₽"
            value={String(values.purchasePrice ?? "")}
            onChange={(event) =>
              onValueChange("purchasePrice", event.target.value)
            }
          />
        </div>

        <FormToggleField
          label="Использовать профиль перевозки"
          checked={Boolean(values.shippingProfileEnabled)}
          onCheckedChange={(value) =>
            onValueChange("shippingProfileEnabled", value)
          }
        />

        {Boolean(values.shippingProfileEnabled) && (
          <div className="space-y-3">
            <FormToggleField
              label="Хрупкий"
              checked={Boolean(values.isFragile)}
              onCheckedChange={(value) => onValueChange("isFragile", value)}
            />
            <FormToggleField
              label="Штабелируемый"
              checked={Boolean(values.isStackable)}
              onCheckedChange={(value) => onValueChange("isStackable", value)}
            />
            <FormToggleField
              label="18+"
              checked={Boolean(values.ageRestricted)}
              onCheckedChange={(value) => onValueChange("ageRestricted", value)}
            />
            <FormTextareaField
              name="handlingNotes"
              label="Инструкции по обращению"
              value={String(values.handlingNotes ?? "")}
              onChange={(event) =>
                onValueChange("handlingNotes", event.target.value)
              }
            />
          </div>
        )}

        <div className="space-y-4 border-y border-border/80 my-6 px-4 py-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Упаковки одной единицы товара
            </h3>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={addPackage}
            >
              Добавить упаковку
            </Button>
          </div>

          {packages.map((item, index) => (
            <div
              key={item.id ?? index}
              className="space-y-3 rounded-2xl p-4 shadow-card-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs">
                    {item.type}
                  </span>
                  <span
                    className={`truncate text-sm font-medium ${item.name?.trim() ? "" : "text-muted-foreground"}`}
                  >
                    {item.name?.trim() || `Упаковка ${index + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={
                      visiblePackageIndex === index
                        ? "Скрыть настройки упаковки"
                        : "Показать настройки упаковки"
                    }
                    aria-expanded={visiblePackageIndex === index}
                    onClick={() =>
                      setVisiblePackageIndex((currentIndex) =>
                        currentIndex === index ? null : index,
                      )
                    }
                  >
                    <Settings2 className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Удалить упаковку"
                    onClick={() => removePackage(index)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {visiblePackageIndex === index && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <FormInputField
                    name={`package-name-${index}`}
                    label="Название"
                    className="sm:col-span-2 lg:col-span-6"
                    value={item.name ?? ""}
                    onChange={(event) =>
                      updatePackage(index, { name: event.target.value })
                    }
                  />

                  <FormSelectField
                    label="Тип"
                    className="sm:col-span-2 lg:col-span-6"
                    value={item.type}
                    options={[
                      "BOX",
                      "PALLET",
                      "ENVELOPE",
                      "CRATE",
                      "OTHER",
                    ].map((value) => ({ value, label: value }))}
                    onValueChange={(value) =>
                      updatePackage(index, {
                        type: value as AdminProductPackage["type"],
                      })
                    }
                  />

                  <FormInputField
                    required
                    min={1}
                    type="number"
                    name={`package-quantity-${index}`}
                    label="Количество мест"
                    className="lg:col-span-2"
                    value={String(item.quantity)}
                    onChange={(event) =>
                      updatePackage(index, {
                        quantity: Number(event.target.value),
                      })
                    }
                  />

                  <FormInputField
                    required
                    min={1}
                    type="number"
                    name={`package-weight-${index}`}
                    label="Вес, г"
                    className="lg:col-span-2"
                    value={String(item.weightGrams)}
                    onChange={(event) =>
                      updatePackage(index, {
                        weightGrams: Number(event.target.value),
                      })
                    }
                  />

                  <FormInputField
                    required
                    min={1}
                    type="number"
                    name={`package-length-${index}`}
                    label="Длина, мм"
                    className="lg:col-span-2"
                    value={String(item.lengthMillimeters)}
                    onChange={(event) =>
                      updatePackage(index, {
                        lengthMillimeters: Number(event.target.value),
                      })
                    }
                  />

                  <FormInputField
                    required
                    min={1}
                    type="number"
                    name={`package-width-${index}`}
                    label="Ширина, мм"
                    className="lg:col-span-2"
                    value={String(item.widthMillimeters)}
                    onChange={(event) =>
                      updatePackage(index, {
                        widthMillimeters: Number(event.target.value),
                      })
                    }
                  />

                  <FormInputField
                    required
                    min={1}
                    type="number"
                    name={`package-height-${index}`}
                    label="Высота, мм"
                    className="lg:col-span-2"
                    value={String(item.heightMillimeters)}
                    onChange={(event) =>
                      updatePackage(index, {
                        heightMillimeters: Number(event.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <FormMultiSelectField
          label="Склады"
          values={warehouseIds}
          options={warehouseOptions}
          placeholder="Выберите склады"
          onValuesChange={handleWarehouseChange}
        />

        <FormSelectField
          label="Основной склад"
          value={String(values.primaryWarehouseId ?? "")}
          options={warehouseOptions.filter((option) =>
            warehouseIds.includes(option.value),
          )}
          placeholder="Выберите основной склад"
          disabled={!warehouseIds.length}
          onValueChange={(value) => onValueChange("primaryWarehouseId", value)}
        />

        <div className="space-y-2">
          {logisticsOptionsState === "loading" && (
            <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              Загружаем сервисы доставки…
            </p>
          )}
          {logisticsOptionsState === "error" && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-destructive/10 p-3 text-sm">
              <span>
                Не удалось загрузить конфигурацию логистики. Существующие связи
                не будут изменены.
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onRetryLogisticsOptions}
              >
                Повторить
              </Button>
            </div>
          )}
          {logisticsOptionsState === "ready" && allServices.length === 0 && (
            <p className="rounded-lg bg-warning/10 p-3 text-sm">
              Сервисы доставки не настроены
            </p>
          )}
          {logisticsOptionsState === "ready" &&
            allServices.length > 0 &&
            activeServices.length === 0 && (
              <p className="rounded-lg bg-warning/10 p-3 text-sm">
                Все сервисы доставки отключены. Уже выбранные сервисы можно
                удалить, но нельзя выбрать заново.
              </p>
            )}
          <FormMultiSelectField
            label="Доступные сервисы"
            caption="Сервисы доступны при настроенных упаковках и основном складе."
            values={serviceIds}
            options={serviceOptions}
            placeholder="Выберите сервисы"
            disabled={
              logisticsOptionsState !== "ready" || allServices.length === 0
            }
            onValuesChange={(values) =>
              onValueChange("deliveryServiceIds", values)
            }
          />
        </div>
      </div>

      <FormInputField
        name="slug"
        label="Slug"
        caption="Можно оставить пустым, система создаст сама."
        value={String(values.slug ?? "")}
        onChange={(event) => onValueChange("slug", event.target.value)}
      />

      <FormSelectField
        required
        label="Категория"
        value={String(values.categoryId ?? "")}
        options={categoryOptions}
        onValueChange={(value) => onValueChange("categoryId", value)}
      />

      <FormSelectField
        label="Крупногабаритность"
        caption={`При наследовании сейчас: ${
          categories.find((category) => category.id === values.categoryId)
            ?.isOversized
            ? "крупногабаритный"
            : "обычный товар"
        }`}
        value={String(values.isOversizedOverride ?? "inherit")}
        options={[
          { value: "inherit", label: "Наследовать от категории" },
          { value: "oversized", label: "Крупногабаритный" },
          { value: "regular", label: "Обычный товар" },
        ]}
        onValueChange={(value) => onValueChange("isOversizedOverride", value)}
      />

      <FormInputField
        name="price"
        required
        type="number"
        label="Цена"
        value={String(values.price ?? "")}
        onChange={(event) => onValueChange("price", event.target.value)}
      />

      <FormTextareaField
        name="description"
        label="Описание"
        caption="Каждая строка — отдельный блок. Начните строку с «# », чтобы создать заголовок."
        rows={8}
        value={String(values.description ?? "")}
        onChange={(event) => onValueChange("description", event.target.value)}
      />

      <LocationCrudFields plain values={values} onValueChange={onValueChange} />

      <FormImageFilesField
        name="images"
        label="Изображения"
        caption="Новые файлы будут загружены на сервер, а в товар сохранятся полученные URL."
        files={imageFiles}
        existingImageUrls={existingImageUrls}
        onFilesChange={(files) => onValueChange("imageFiles", files)}
        onExistingImageUrlsChange={(imageUrls) =>
          onValueChange("imageUrls", imageUrls)
        }
      />

      <ProductAdditionsFields
        value={
          Array.isArray(values.additions)
            ? (values.additions as ProductAddition[])
            : []
        }
        onChange={(additions) => onValueChange("additions", additions)}
      />
    </div>
  );
}
