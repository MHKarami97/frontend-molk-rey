export const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
export function toJalali(date: Date) {
  const f = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  return {
    jy: Number(f.find((x) => x.type === "year")?.value),
    jm: Number(f.find((x) => x.type === "month")?.value),
    jd: Number(f.find((x) => x.type === "day")?.value),
  };
}
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  let date = new Date(Date.UTC(jy + 621, 2, 20));
  for (let i = 0; i < 370; i++) {
    const j = toJalali(date);
    if (j.jy === jy && j.jm === jm && j.jd === jd)
      return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
      );
    date.setUTCDate(date.getUTCDate() + 1);
  }
  throw new Error("تاریخ شمسی نامعتبر");
}
export function daysInJalaliMonth(jy: number, jm: number) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return 30;
}
export function toIsoDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
