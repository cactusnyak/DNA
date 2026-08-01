export function resolveEffectiveOversizedStatus(
  override: boolean | null | undefined,
  immediateCategoryIsOversized: boolean,
) {
  return override ?? immediateCategoryIsOversized;
}
