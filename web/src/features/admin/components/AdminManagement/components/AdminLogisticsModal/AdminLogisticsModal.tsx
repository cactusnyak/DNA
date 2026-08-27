import { useState } from "react";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  FormInputField,
  FormSelectField,
  FormTextareaField,
  FormToggleField,
} from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type {
  AdminDeliveryProvider,
  AdminDeliveryService,
  AdminLogisticsRecord,
  AdminWarehouse,
} from "@/entities/admin";
import {
  parseWarehouseWorkingHours,
  serializeWarehouseWorkingHours,
  validateWorkingHoursDay,
  WEEKDAYS,
} from "@/features/admin/logic/warehouse-working-hours";
import { WAREHOUSE_TYPE_OPTIONS } from "@/features/admin/logic/warehouse-type-labels";
import { WarehouseWorkingHoursEditor } from "./WarehouseWorkingHoursEditor";

type Props = {
  record?: AdminLogisticsRecord;
  details?: Record<string, unknown>;
  isCreatingWarehouse: boolean;
  providers: AdminDeliveryProvider[];
  isPending: boolean;
  mutationError?: string;
  onClose: () => void;
  onSaveWarehouse: (value: Partial<AdminWarehouse>) => void;
  onSaveProvider: (value: AdminDeliveryProvider) => void;
  onSaveService: (value: AdminDeliveryService) => void;
};

function DetailValue({ value }: { value: unknown }) {
  if (value == null || ["string", "number", "boolean"].includes(typeof value))
    return <span>{String(value ?? "—")}</span>;
  if (Array.isArray(value))
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="rounded-md bg-muted/40 p-2">
            <DetailValue value={item} />
          </div>
        ))}
      </div>
    );
  if (typeof value === "object")
    return (
      <dl className="space-y-1">
        {Object.entries(value).map(([key, nested]) => (
          <div
            key={key}
            className="grid grid-cols-[minmax(7rem,0.35fr)_1fr] gap-2"
          >
            <dt className="text-muted-foreground">{key}</dt>
            <dd className="break-words">
              <DetailValue value={nested} />
            </dd>
          </div>
        ))}
      </dl>
    );
  return <span>—</span>;
}

function WarehouseForm({
  warehouse,
  providers,
  isPending,
  mutationError,
  onClose,
  onSave,
}: {
  warehouse?: AdminWarehouse;
  providers: AdminDeliveryProvider[];
  isPending: boolean;
  mutationError?: string;
  onClose: () => void;
  onSave: (value: Partial<AdminWarehouse>) => void;
}) {
  const [draft, setDraft] = useState<Partial<AdminWarehouse>>(
    warehouse ?? {
      type: "OWN",
      isActive: true,
      loadingAvailable: false,
      providerConfigs: [],
    },
  );
  const parsedWorkingHours = parseWarehouseWorkingHours(
    warehouse?.workingHours,
  );
  const [workingHours, setWorkingHours] = useState(parsedWorkingHours.value);
  const [workingHoursSourceError, setWorkingHoursSourceError] = useState(
    parsedWorkingHours.error,
  );
  const [expandedProviderIds, setExpandedProviderIds] = useState<Set<string>>(
    () =>
      new Set(
        warehouse?.providerConfigs.map((config) => config.deliveryProviderId) ??
        [],
      ),
  );
  const [formError, setFormError] = useState<string>();
  const set = (key: keyof AdminWarehouse, value: unknown) =>
    setDraft((current) => ({ ...current, [key]: value }));

  function submit() {
    setFormError(undefined);
    if (workingHoursSourceError) {
      setFormError(
        "Исправьте расписание, чтобы заменить сохранённые некорректные данные.",
      );
      return;
    }
    const invalidDay = WEEKDAYS.find(([key]) =>
      validateWorkingHoursDay(workingHours[key]),
    );
    if (invalidDay) {
      setFormError(`Проверьте рабочие часы: ${invalidDay[1]}.`);
      return;
    }
    onSave({
      ...draft,
      workingHours: serializeWarehouseWorkingHours(
        workingHours,
        parsedWorkingHours.preservedFields,
      ),
    });
  }

  return (
    <Modal
      isOpen
      title={warehouse ? `Склад: ${warehouse.name}` : "Новый склад"}
      size="sm"
      preventClose={isPending}
      onClose={onClose}
    >
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
          <FormInputField
            required
            name="warehouse-code"
            label="Стабильный код"
            value={draft.code ?? ""}
            onChange={(event) => set("code", event.target.value)}
          />
          <FormInputField
            required
            name="warehouse-name"
            label="Название"
            value={draft.name ?? ""}
            onChange={(event) => set("name", event.target.value)}
          />
          <FormSelectField
            label="Тип"
            value={draft.type ?? "OWN"}
            options={WAREHOUSE_TYPE_OPTIONS}
            onValueChange={(value) => set("type", value)}
          />
          <FormInputField
            name="warehouse-country"
            label="Страна"
            value={draft.country ?? ""}
            onChange={(event) => set("country", event.target.value)}
          />
          <FormInputField
            name="warehouse-region"
            label="Регион"
            value={draft.region ?? ""}
            onChange={(event) => set("region", event.target.value)}
          />
          <FormInputField
            name="warehouse-city"
            label="Город"
            value={draft.city ?? ""}
            onChange={(event) => set("city", event.target.value)}
          />
          <FormInputField
            name="warehouse-postal-code"
            label="Почтовый индекс"
            caption="Передаётся провайдеру отдельно от строки полного адреса."
            value={draft.postalCode ?? ""}
            onChange={(event) => set("postalCode", event.target.value)}
          />
          <FormInputField
            name="warehouse-street"
            label="Улица"
            value={draft.street ?? ""}
            onChange={(event) => set("street", event.target.value)}
          />
          <FormInputField
            name="warehouse-building"
            label="Дом / строение"
            value={draft.building ?? ""}
            onChange={(event) => set("building", event.target.value)}
          />
          <FormTextareaField
            name="warehouse-address"
            label="Полный адрес"
            value={draft.fullAddress ?? ""}
            onChange={(event) => set("fullAddress", event.target.value)}
          />
          <FormInputField
            name="warehouse-latitude"
            type="number"
            label="Широта"
            value={String(draft.latitude ?? "")}
            onChange={(event) =>
              set(
                "latitude",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          />
          <FormInputField
            name="warehouse-longitude"
            type="number"
            label="Долгота"
            value={String(draft.longitude ?? "")}
            onChange={(event) =>
              set(
                "longitude",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          />
          <FormInputField
            name="warehouse-contact"
            label="Контактное лицо"
            value={draft.contactName ?? ""}
            onChange={(event) => set("contactName", event.target.value)}
          />
          <FormInputField
            name="warehouse-phone"
            label="Телефон"
            value={draft.contactPhone ?? ""}
            onChange={(event) => set("contactPhone", event.target.value)}
          />
          <FormInputField
            name="warehouse-email"
            type="email"
            label="Email"
            value={draft.contactEmail ?? ""}
            onChange={(event) => set("contactEmail", event.target.value)}
          />
          <FormInputField
            name="warehouse-timezone"
            label="Часовой пояс"
            placeholder="Europe/Moscow"
            value={draft.timezone ?? ""}
            onChange={(event) => set("timezone", event.target.value)}
          />
          {workingHoursSourceError && (
            <div className="rounded-lg bg-warning/10 p-3 text-sm">
              {workingHoursSourceError} Измените любой день, чтобы явно заменить
              старое расписание безопасным форматом.
            </div>
          )}
          <WarehouseWorkingHoursEditor
            value={workingHours}
            onChange={(value) => {
              setWorkingHours(value);
              setWorkingHoursSourceError(undefined);
            }}
          />
          <FormTextareaField
            name="warehouse-courier-instructions"
            label="Инструкции для курьера"
            caption="Например, правила въезда и контакт перед прибытием."
            rows={4}
            value={draft.courierInstructions ?? ""}
            onChange={(event) => set("courierInstructions", event.target.value)}
          />

          <section className="space-y-4 border-y border-border/80 px-4 py-6">
            <h3 className="font-medium">Конфигурация провайдеров</h3>
            {providers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Провайдеры доставки не настроены.
              </p>
            )}
            {providers.map((provider) => {
              const config = draft.providerConfigs?.find(
                (value) => value.deliveryProviderId === provider.id,
              );
              return (
                <div
                  key={provider.id}
                  className={`space-y-3 rounded-2xl p-4 shadow-card-lg ${provider.isActive ? "" : "opacity-70"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium text-muted-foreground">
                        {provider.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <StatusBadge
                        text={
                          provider.isActive ? "Активен" : "Провайдер отключён"
                        }
                        variant={provider.isActive ? "access" : "destructive"}
                      />
                      <StatusBadge
                        text={
                          config?.isEnabled
                            ? "Подключён"
                            : config
                              ? "Отключён для склада"
                              : "Не настроен"
                        }
                        variant={config?.isEnabled ? "access" : "warning"}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={
                          expandedProviderIds.has(provider.id)
                            ? `Скрыть настройки ${provider.name}`
                            : `Показать настройки ${provider.name}`
                        }
                        aria-expanded={expandedProviderIds.has(provider.id)}
                        onClick={() =>
                          setExpandedProviderIds((current) => {
                            const next = new Set(current);
                            if (next.has(provider.id)) next.delete(provider.id);
                            else next.add(provider.id);
                            return next;
                          })
                        }
                      >
                        <Settings2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {expandedProviderIds.has(provider.id) && (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {config
                          ? config.isEnabled
                            ? "Конфигурация подключена к складу."
                            : "Конфигурация существует, но отключена."
                          : "Конфигурация для склада ещё не создана."}
                      </p>
                      {!provider.isActive && (
                        <p className="rounded-lg bg-warning/10 p-3 text-xs">
                          Провайдер отключён глобально. Включить его только для
                          этого склада нельзя.
                        </p>
                      )}
                      <FormInputField
                        name={`external-${provider.id}`}
                        label="External location ID"
                        caption={
                          provider.code === "YANDEX"
                            ? "Для production-доставки по России здесь хранится platform_station_id."
                            : provider.code === "CDEK"
                              ? "Для склада с CDEK_PVZ-origin код пункта отправления хранится в защищённой provider metadata; для door-origin это поле оставьте пустым."
                            : undefined
                        }
                        value={config?.externalLocationId ?? ""}
                        onChange={(event) =>
                          set("providerConfigs", [
                            ...(draft.providerConfigs ?? []).filter(
                              (value) =>
                                value.deliveryProviderId !== provider.id,
                            ),
                            {
                              deliveryProviderId: provider.id,
                              externalLocationId: event.target.value,
                              isEnabled: config?.isEnabled ?? false,
                            },
                          ])
                        }
                      />
                      <FormToggleField
                        label="Включён для склада"
                        checked={config?.isEnabled ?? false}
                        disabled={!provider.isActive}
                        onCheckedChange={(checked) =>
                          set("providerConfigs", [
                            ...(draft.providerConfigs ?? []).filter(
                              (value) =>
                                value.deliveryProviderId !== provider.id,
                            ),
                            {
                              deliveryProviderId: provider.id,
                              externalLocationId: config?.externalLocationId,
                              isEnabled: checked,
                            },
                          ])
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
          {warehouse && !warehouse.isConfigured && (
            <div className="rounded-xl bg-warning/10 p-3 text-sm">
              Не хватает: {warehouse.missingConfigurationFields.join(", ")}
            </div>
          )}
          <FormToggleField
            label="Доступна погрузка"
            checked={draft.loadingAvailable ?? false}
            onCheckedChange={(value) => set("loadingAvailable", value)}
          />
          <FormToggleField
            label="Склад активен"
            checked={draft.isActive ?? true}
            onCheckedChange={(value) => set("isActive", value)}
          />
          {(formError || mutationError) && (
            <ErrorMessage>{formError ?? mutationError}</ErrorMessage>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t p-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="accent" disabled={isPending}>
            {isPending ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ProviderForm({
  provider,
  isPending,
  mutationError,
  onClose,
  onSave,
}: {
  provider: AdminDeliveryProvider;
  isPending: boolean;
  mutationError?: string;
  onClose: () => void;
  onSave: (value: AdminDeliveryProvider) => void;
}) {
  const [name, setName] = useState(provider.name);
  const [fixedMarkup, setFixedMarkup] = useState(String(provider.fixedMarkup));
  const [isActive, setIsActive] = useState(provider.isActive);
  const [formError, setFormError] = useState<string>();
  function submit() {
    const normalizedName = name.trim();
    const markup = Number(fixedMarkup);
    if (!normalizedName)
      return setFormError("Название провайдера обязательно.");
    if (!Number.isInteger(markup) || markup < 0)
      return setFormError(
        "Наценка должна быть целым неотрицательным числом рублей.",
      );
    setFormError(undefined);
    onSave({
      ...provider,
      name: normalizedName,
      fixedMarkup: markup,
      isActive,
    });
  }
  return (
    <Modal
      isOpen
      title={`Провайдер: ${provider.code}`}
      size="sm"
      preventClose={isPending}
      onClose={onClose}
    >
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
          <FormInputField
            required
            name="provider-name"
            label="Название"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <FormInputField
            name="provider-code"
            label="Стабильный код"
            value={provider.code}
            disabled
            onChange={() => undefined}
          />
          <FormInputField
            required
            name="provider-markup"
            type="number"
            min={0}
            step={1}
            label="Фиксированная надбавка за отправление, ₽"
            value={fixedMarkup}
            onChange={(event) => setFixedMarkup(event.target.value)}
          />
          <FormToggleField
            label="Провайдер активен"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          {(formError || mutationError) && (
            <ErrorMessage>{formError ?? mutationError}</ErrorMessage>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t p-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="accent" disabled={isPending}>
            {isPending ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ServiceForm({
  service,
  provider,
  isPending,
  mutationError,
  onClose,
  onSave,
}: {
  service: AdminDeliveryService;
  provider: AdminDeliveryProvider;
  isPending: boolean;
  mutationError?: string;
  onClose: () => void;
  onSave: (value: AdminDeliveryService) => void;
}) {
  const [name, setName] = useState(service.name);
  const [isActive, setIsActive] = useState(service.isActive);
  const [formError, setFormError] = useState<string>();
  function submit() {
    const normalizedName = name.trim();
    if (!normalizedName) return setFormError("Название сервиса обязательно.");
    setFormError(undefined);
    onSave({ ...service, name: normalizedName, isActive });
  }
  return (
    <Modal
      isOpen
      title={`Сервис: ${service.code}`}
      size="sm"
      preventClose={isPending}
      onClose={onClose}
    >
      <form
        className="space-y-5 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="text-sm text-muted-foreground">
          Провайдер: {provider.name} · {provider.code}
        </div>
        <FormInputField
          required
          name="service-name"
          label="Название"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <FormInputField
          name="service-code"
          label="Стабильный код"
          value={service.code}
          disabled
          onChange={() => undefined}
        />
        <FormToggleField
          label="Сервис активен"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <StatusBadge
          text={isActive ? "Активен" : "Отключён"}
          variant={isActive ? "access" : "destructive"}
        />
        {(formError || mutationError) && (
          <ErrorMessage>{formError ?? mutationError}</ErrorMessage>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="accent" disabled={isPending}>
            {isPending ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminLogisticsModal({
  record,
  details,
  isCreatingWarehouse,
  providers,
  isPending,
  mutationError,
  onClose,
  onSaveWarehouse,
  onSaveProvider,
  onSaveService,
}: Props) {
  if (record?.type === "warehouse" || isCreatingWarehouse)
    return (
      <WarehouseForm
        warehouse={record?.type === "warehouse" ? record.warehouse : undefined}
        providers={providers}
        isPending={isPending}
        mutationError={mutationError}
        onClose={onClose}
        onSave={onSaveWarehouse}
      />
    );
  if (record?.type === "provider")
    return (
      <ProviderForm
        provider={record.provider}
        isPending={isPending}
        mutationError={mutationError}
        onClose={onClose}
        onSave={onSaveProvider}
      />
    );
  if (record?.type === "service")
    return (
      <ServiceForm
        provider={record.provider}
        service={record.service}
        isPending={isPending}
        mutationError={mutationError}
        onClose={onClose}
        onSave={onSaveService}
      />
    );
  if (record?.type === "quote" || record?.type === "shipment") {
    const item = record.type === "quote" ? record.quote : record.shipment;
    return (
      <Modal
        isOpen
        title={
          record.type === "shipment"
            ? `Отправление ${item.id.slice(0, 8)}`
            : `Расчёт ${item.id.slice(0, 8)}`
        }
        size="sm"
        onClose={onClose}
      >
        <div className="grid gap-4 overflow-y-auto p-6 md:grid-cols-2">
          {Object.entries(details ?? item).map(([key, value]) => (
            <div key={key} className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">{key}</div>
              <div className="break-words text-sm">
                <DetailValue value={value} />
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  }
  return null;
}
