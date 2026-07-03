export function getNextColumnWidth(value: number, minWidth: number) {
  return Math.max(minWidth, Math.round(value));
}
