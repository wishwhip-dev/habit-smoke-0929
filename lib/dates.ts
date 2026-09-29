/**
 * Local calendar dates as `YYYY-MM-DD` strings.
 *
 * Days are counted by calendar date — reading `getFullYear`/`getMonth`/`getDate` off a `Date`
 * built from `today` — never by dividing milliseconds, so a midnight boundary or a
 * daylight-saving shift cannot skip or repeat a day.
 */

/** The local calendar date a timestamp falls on, as `YYYY-MM-DD`. */
export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return localDateKey(new Date());
}

/**
 * The `count` local calendar dates ending today, oldest first.
 *
 * Walked with `setDate`, so across a daylight-saving change each step is still exactly one
 * calendar day.
 */
export function lastNDayKeys(count: number, from: Date = new Date()): string[] {
  const keys: string[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let index = 0; index < count; index += 1) {
    keys.unshift(localDateKey(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return keys;
}

/** Fixed English weekday labels — deterministic, so client renders match hydration. */
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function weekdayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number) as [number, number, number];
  return WEEKDAYS[new Date(year, month - 1, day).getDay()] ?? "";
}

/** Day of month without a leading zero, for the chart's second label line. */
export function dayOfMonthLabel(dateKey: string): string {
  const day = Number(dateKey.slice(8, 10));
  return String(day);
}
