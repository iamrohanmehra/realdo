// lib/date-utils.ts
export function isToday(date: string | Date): boolean {
  const today = new Date();
  const compareDate = new Date(date);

  return (
    today.getFullYear() === compareDate.getFullYear() &&
    today.getMonth() === compareDate.getMonth() &&
    today.getDate() === compareDate.getDate()
  );
}

export function shouldShowCompletedTask(completedAt: string | null): boolean {
  if (!completedAt) return true; // Not completed, always show
  return isToday(completedAt);
}

export function isOlderThanDays(date: string | Date, days: number): boolean {
  const compareDate = new Date(date);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return compareDate < cutoffDate;
}
