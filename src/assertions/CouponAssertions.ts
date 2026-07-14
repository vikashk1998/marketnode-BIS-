import { expect } from '@playwright/test';
import { CouponPaymentV1, MaturityPaymentV1 } from '../types/domain';
import { FinancialUtility } from '../utilities/FinancialUtility';
import { DateUtility } from '../utilities/DateUtility';

export class CouponAssertions {
  assertDailyAmount(
    payment: CouponPaymentV1,
    faceValue: number,
    couponRate: number,
    allocatedQty: number,
  ): void {
    const expected = FinancialUtility.dailyCoupon(faceValue, couponRate, allocatedQty);
    expect(FinancialUtility.formatMoney(payment.amount)).toBe(FinancialUtility.formatMoney(expected));
  }

  assertNoWeekendPayments(payments: readonly CouponPaymentV1[]): void {
    for (const p of payments) {
      expect(DateUtility.isWeekend(p.payment_date), `Coupon on weekend ${p.payment_date}`).toBe(
        false,
      );
    }
  }

  assertTotalReceived(
    payments: readonly CouponPaymentV1[],
    bondId: number,
    expectedTotal: number | string,
  ): void {
    const sum = payments
      .filter((p) => p.bond_id === bondId)
      .reduce((acc, p) => acc + Number(p.amount), 0);
    expect(FinancialUtility.formatMoney(sum)).toBe(FinancialUtility.formatMoney(expectedTotal));
  }
}

export class MaturityAssertions {
  assertPrincipal(
    payment: MaturityPaymentV1,
    faceValue: number,
    allocatedQty: number,
  ): void {
    const expected = FinancialUtility.maturityPrincipal(faceValue, allocatedQty);
    expect(FinancialUtility.formatMoney(payment.principal_amount)).toBe(
      FinancialUtility.formatMoney(expected),
    );
  }
}

export class FinancialAssertions {
  assertExactMoney(actual: number | string, expected: number | string): void {
    expect(FinancialUtility.formatMoney(actual)).toBe(FinancialUtility.formatMoney(expected));
  }

  assertAllocationTotals(
    allocations: ReadonlyArray<{ allocatedQuantity: number }>,
    totalSize: number,
  ): void {
    const sum = allocations.reduce((a, b) => a + b.allocatedQuantity, 0);
    expect(sum).toBeLessThanOrEqual(totalSize);
  }
}
