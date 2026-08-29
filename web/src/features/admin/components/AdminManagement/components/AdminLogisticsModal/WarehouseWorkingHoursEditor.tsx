import { FormInputField, FormToggleField } from "@/components/ui/FormField";
import {
  validateWorkingHoursDay,
  WEEKDAYS,
  type WorkingHoursForm,
  type WeekdayKey,
} from "@/features/admin/logic/warehouse-working-hours";

type Props = {
  value: WorkingHoursForm;
  onChange: (value: WorkingHoursForm) => void;
};

export function WarehouseWorkingHoursEditor({ value, onChange }: Props) {
  function update(
    key: WeekdayKey,
    patch: Partial<WorkingHoursForm[WeekdayKey]>,
  ) {
    onChange({ ...value, [key]: { ...value[key], ...patch } });
  }

  return (
    <section className="space-y-4 border-y border-border/80 px-4 py-6">
      <div>
        <h3 className="font-medium">Рабочие часы</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Интервалы через полночь не поддерживаются. Для выходного дня время не
          сохраняется.
        </p>
      </div>
      <div className="space-y-2">
        {WEEKDAYS.map(([key, label]) => {
          const day = value[key];
          const error = validateWorkingHoursDay(day);
          return (
            <div key={key} className="space-y-3 rounded-2xl p-4 shadow-card-lg">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">{label}</span>
                <FormToggleField
                  label={day.isWorking ? "Рабочий день" : "Выходной"}
                  checked={day.isWorking}
                  onCheckedChange={(isWorking) =>
                    update(
                      key,
                      isWorking
                        ? {
                            isWorking: true,
                            start: day.start || "09:00",
                            end: day.end || "18:00",
                          }
                        : { isWorking: false, start: "", end: "" },
                    )
                  }
                />
              </div>
              {day.isWorking && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInputField
                    required
                    name={`${key}-working-start`}
                    type="time"
                    label="Начало"
                    value={day.start}
                    onChange={(event) =>
                      update(key, { start: event.target.value })
                    }
                  />
                  <FormInputField
                    required
                    name={`${key}-working-end`}
                    type="time"
                    label="Окончание"
                    value={day.end}
                    onChange={(event) =>
                      update(key, { end: event.target.value })
                    }
                  />
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
