import { DayOption } from '../types';

// Convert English numbers to Persian numerals
export function toPersianDigits(n: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[+w]);
}

// Format currency in Tomans (تومان)
export function formatToman(amount: number): string {
  const formatted = amount.toLocaleString('en-US');
  return `${toPersianDigits(formatted)} تومان`;
}

// Format standard Date object to YYYY-MM-DD in local time
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate the next N days with Persian labels
export function getUpcomingDays(count = 10): DayOption[] {
  const days: DayOption[] = [];
  const today = new Date();

  // Intl formatters for Persian calendar
  const weekdayFormatter = new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    weekday: 'long',
  });
  const dayNumberFormatter = new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    day: 'numeric',
  });
  const monthFormatter = new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    month: 'long',
  });

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dateStr = formatDateKey(d);
    let dayNameFa = weekdayFormatter.format(d);
    if (i === 0) dayNameFa = 'امروز';
    else if (i === 1) dayNameFa = 'فردا';

    const dayNumberFa = dayNumberFormatter.format(d);
    const monthNameFa = monthFormatter.format(d);

    days.push({
      dateStr,
      dayNameFa,
      dayNumberFa,
      monthNameFa,
      isToday: i === 0,
    });
  }

  return days;
}

// Format full Persian date for receipts, e.g. "دوشنبه ۲ مهر ۱۴۰۳"
export function getFullPersianDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      calendar: 'persian',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(date);
  } catch {
    return dateStr;
  }
}
