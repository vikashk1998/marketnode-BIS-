import { test, expect } from '../../src/fixtures/global-test-options';
import { FinancialUtility } from '../../src/utilities/FinancialUtility';
import { DateUtility } from '../../src/utilities/DateUtility';
import { BOND_CONSTRAINTS } from '../../src/constants';

test.describe('Financial Utilities & Boundaries', () => {
  test('exact decimal avoids floating-point drift', () => {
    // Classic float trap: 0.1 + 0.2 !== 0.3
    const sum = FinancialUtility.toDecimal('0.1').plus('0.2');
    expect(sum.toFixed(1)).toBe('0.3');
  });

  test('face value decimal validation helper', () => {
    expect(FinancialUtility.hasAtMostDecimals('1000.00', BOND_CONSTRAINTS.maxFaceValueDecimals)).toBe(
      true,
    );
    expect(FinancialUtility.hasAtMostDecimals('1000.001', BOND_CONSTRAINTS.maxFaceValueDecimals)).toBe(
      false,
    );
  });

  test('weekend detection and next business day', () => {
    // 2026-07-18 is Saturday, 2026-07-19 Sunday
    expect(DateUtility.isWeekend('2026-07-18')).toBe(true);
    expect(DateUtility.isWeekend('2026-07-19')).toBe(true);
    expect(DateUtility.nextBusinessDay('2026-07-18')).toBe('2026-07-20');
    expect(DateUtility.isBusinessDay('2026-07-14')).toBe(true); // Tuesday
  });

  test('business day counting excludes weekends', () => {
    // Thu 2026-06-11 to Thu 2026-06-25 inclusive = 11 business days (PRODUCT.md)
    expect(DateUtility.countBusinessDaysInclusive('2026-06-11', '2026-06-25')).toBe(11);
  });
});
