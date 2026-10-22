export const HOME_TZ = "Australia/Brisbane";

export function localDate(now: Date = new Date(), timeZone = HOME_TZ): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Monday–Sunday week containing the local calendar date. */
export function weekRange(isoDate: string): { start: string; end: string } {
  const [y, m, d] = isoDate.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const start = addCalendarDays(isoDate, mondayOffset);
  return { start, end: addCalendarDays(start, 6) };
}

export function formatWeekLabel(start: string, end: string): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("en-AU", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(Date.UTC(y, m - 1, d)));
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

export function datesInWeek(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addCalendarDays(start, i));
}
