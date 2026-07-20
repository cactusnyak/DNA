export function getAdminRecordStatusLabel(record: {
  isActive?: boolean;
  deletedAt?: string | null;
}) {
  if (record.deletedAt) {
    return 'Удалено';
  }

  return record.isActive === false ? 'Неактивно' : 'Активно';
}
