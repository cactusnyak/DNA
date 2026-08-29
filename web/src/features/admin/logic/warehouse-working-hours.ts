export const WEEKDAYS = [
  ["monday", "Понедельник"],
  ["tuesday", "Вторник"],
  ["wednesday", "Среда"],
  ["thursday", "Четверг"],
  ["friday", "Пятница"],
  ["saturday", "Суббота"],
  ["sunday", "Воскресенье"],
] as const;

export type WeekdayKey = (typeof WEEKDAYS)[number][0];
export type WorkingHoursDay = {
  isWorking: boolean;
  start: string;
  end: string;
};
export type WorkingHoursForm = Record<WeekdayKey, WorkingHoursDay>;
export type WorkingHoursParseResult = {
  value: WorkingHoursForm;
  preservedFields: Record<string, unknown>;
  error?: string;
};

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const emptyDay = (): WorkingHoursDay => ({
  isWorking: false,
  start: "",
  end: "",
});
export const createEmptyWorkingHours = (): WorkingHoursForm =>
  Object.fromEntries(
    WEEKDAYS.map(([key]) => [key, emptyDay()]),
  ) as WorkingHoursForm;

function parseInterval(value: unknown): WorkingHoursDay | undefined {
  if (value == null) return emptyDay();
  if (typeof value === "string") {
    const match = value.match(/^([0-2]\d:[0-5]\d)-([0-2]\d:[0-5]\d)$/);
    if (!match || !TIME_PATTERN.test(match[1]) || !TIME_PATTERN.test(match[2]))
      return undefined;
    return { isWorking: true, start: match[1], end: match[2] };
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const day = value as Record<string, unknown>;
    if (day.isWorking === false) return emptyDay();
    if (
      typeof day.start === "string" &&
      typeof day.end === "string" &&
      TIME_PATTERN.test(day.start) &&
      TIME_PATTERN.test(day.end)
    )
      return {
        isWorking: day.isWorking !== false,
        start: day.start,
        end: day.end,
      };
  }
  return undefined;
}

export function parseWarehouseWorkingHours(
  value: unknown,
): WorkingHoursParseResult {
  const empty = createEmptyWorkingHours();
  if (value == null) return { value: empty, preservedFields: {} };
  if (typeof value !== "object" || Array.isArray(value))
    return {
      value: empty,
      preservedFields: {},
      error: "Сохранённое расписание имеет неподдерживаемый формат.",
    };
  const source = value as Record<string, unknown>;
  const canonicalDays =
    source.version === 1 &&
    source.days &&
    typeof source.days === "object" &&
    !Array.isArray(source.days)
      ? (source.days as Record<string, unknown>)
      : source;
  const parsed = createEmptyWorkingHours();
  for (const [key] of WEEKDAYS) {
    const day = parseInterval(canonicalDays[key]);
    if (!day)
      return {
        value: empty,
        preservedFields: {},
        error: `Не удалось прочитать расписание для дня «${key}».`,
      };
    parsed[key] = day;
  }
  const preservedFields = Object.fromEntries(
    Object.entries(source).filter(
      ([key]) => key !== "version" && key !== "days",
    ),
  );
  for (const [key] of WEEKDAYS) delete preservedFields[key];
  return { value: parsed, preservedFields };
}

export function validateWorkingHoursDay(
  day: WorkingHoursDay,
): string | undefined {
  if (!day.isWorking) return undefined;
  if (!TIME_PATTERN.test(day.start) || !TIME_PATTERN.test(day.end))
    return "Укажите время начала и окончания в формате ЧЧ:ММ.";
  if (day.start >= day.end)
    return "Окончание должно быть позже начала; интервалы через полночь не поддерживаются.";
  return undefined;
}

export function serializeWarehouseWorkingHours(
  value: WorkingHoursForm,
  preservedFields: Record<string, unknown>,
) {
  const days = Object.fromEntries(
    WEEKDAYS.map(([key]) => [
      key,
      value[key].isWorking
        ? { isWorking: true, start: value[key].start, end: value[key].end }
        : { isWorking: false },
    ]),
  );
  return { ...preservedFields, version: 1, days };
}
