import { WEEKEND_DAYS } from '../constants';
import { frameworkConfig } from '../config/framework-config';

/**
 * Date helpers for Asia/Kuala_Lumpur business-day logic.
 * All public APIs use YYYY-MM-DD calendar dates (no time component).
 */
export class DateUtility {
  static todayIso(): string {
    return DateUtility.formatIso(new Date());
  }

  static formatIso(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static parseIso(date: string): Date {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  static addDays(date: string, days: number): string {
    const parsed = DateUtility.parseIso(date);
    parsed.setDate(parsed.getDate() + days);
    return DateUtility.formatIso(parsed);
  }

  static isWeekend(date: string): boolean {
    const day = DateUtility.parseIso(date).getDay();
    return WEEKEND_DAYS.has(day);
  }

  static isBusinessDay(date: string): boolean {
    return !DateUtility.isWeekend(date);
  }

  /**
   * Returns the next business day on or after the given date.
   */
  static nextBusinessDay(date: string): string {
    let current = date;
    while (DateUtility.isWeekend(current)) {
      current = DateUtility.addDays(current, 1);
    }
    return current;
  }

  /**
   * Advances from start (exclusive) counting calendar days until `count` business days pass.
   */
  static addBusinessDays(start: string, count: number): string {
    let current = start;
    let remaining = count;
    while (remaining > 0) {
      current = DateUtility.addDays(current, 1);
      if (DateUtility.isBusinessDay(current)) {
        remaining -= 1;
      }
    }
    return current;
  }

  /**
   * Counts inclusive business days between two ISO dates.
   */
  static countBusinessDaysInclusive(from: string, to: string): number {
    let current = from;
    let count = 0;
    while (current <= to) {
      if (DateUtility.isBusinessDay(current)) {
        count += 1;
      }
      current = DateUtility.addDays(current, 1);
    }
    return count;
  }

  static compare(a: string, b: string): number {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }

  static timezone(): string {
    return frameworkConfig.timezone;
  }
}
