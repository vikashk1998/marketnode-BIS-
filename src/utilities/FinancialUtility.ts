import Decimal from 'decimal.js';
import { AllocationResult } from '../types/domain';
import { SubscriptionStatus } from '../enums';

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

/**
 * Exact-decimal financial calculations matching PRODUCT.md rules.
 * Never uses native floating-point arithmetic for money.
 */
export class FinancialUtility {
  static toDecimal(value: number | string | Decimal): Decimal {
    return new Decimal(value);
  }

  static dailyCoupon(
    faceValue: number | string,
    couponRate: number | string,
    allocatedQuantity: number | string,
  ): Decimal {
    return new Decimal(faceValue).mul(couponRate).mul(allocatedQuantity);
  }

  static maturityPrincipal(
    faceValue: number | string,
    allocatedQuantity: number | string,
  ): Decimal {
    return new Decimal(faceValue).mul(allocatedQuantity);
  }

  static totalCoupon(
    faceValue: number | string,
    couponRate: number | string,
    allocatedQuantity: number | string,
    businessDays: number,
  ): Decimal {
    return FinancialUtility.dailyCoupon(faceValue, couponRate, allocatedQuantity).mul(businessDays);
  }

  /**
   * Proportional allocation: floor(quantity / totalSubscribed × totalSize)
   */
  static proportionalAllocation(
    subscriptions: ReadonlyArray<{ investorId: string; quantity: number }>,
    totalSize: number,
  ): AllocationResult[] {
    const totalSubscribed = subscriptions.reduce((sum, s) => sum + s.quantity, 0);

    if (totalSubscribed <= totalSize) {
      return subscriptions.map((s) => ({
        investorId: s.investorId,
        subscribedQuantity: s.quantity,
        allocatedQuantity: s.quantity,
        status: SubscriptionStatus.ALLOCATED,
      }));
    }

    return subscriptions.map((s) => {
      const allocated = new Decimal(s.quantity)
        .div(totalSubscribed)
        .mul(totalSize)
        .floor()
        .toNumber();
      return {
        investorId: s.investorId,
        subscribedQuantity: s.quantity,
        allocatedQuantity: allocated,
        status: allocated === 0 ? SubscriptionStatus.REJECTED : SubscriptionStatus.ALLOCATED,
      };
    });
  }

  static equals(a: number | string | Decimal, b: number | string | Decimal): boolean {
    return new Decimal(a).eq(b);
  }

  static formatMoney(value: number | string | Decimal, decimals = 2): string {
    return new Decimal(value).toFixed(decimals);
  }

  static hasAtMostDecimals(value: string | number, maxDecimals: number): boolean {
    const asString = String(value);
    const parts = asString.split('.');
    if (parts.length === 1) {
      return true;
    }
    return parts[1].length <= maxDecimals;
  }
}
