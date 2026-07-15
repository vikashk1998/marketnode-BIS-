import { expect } from '@playwright/test';
import { BondV1 } from '../types/domain';
import { BondStatus } from '../enums';
import { AssertionUtility } from '../utilities/AssertionUtility';
import { FinancialUtility } from '../utilities/FinancialUtility';

export class BondAssertions {
  private readonly assertions: AssertionUtility;

  constructor(assertions?: AssertionUtility) {
    this.assertions = assertions ?? new AssertionUtility();
  }

  assertStatus(bond: BondV1, expected: BondStatus | string): void {
    this.assertions.assertEqual(bond.status, expected, `Bond ${bond.isin} status`);
  }

  assertIsin(bond: BondV1, expected: string): void {
    this.assertions.assertEqual(bond.isin, expected);
  }

  assertAvailableSize(bond: BondV1, expected: number): void {
    this.assertions.assertEqual(bond.available_size, expected);
  }

  assertOpenForSubscription(bond: BondV1): void {
    expect(bond.status).toBe(BondStatus.OPEN);
    expect(bond.available_size).toBeGreaterThan(0);
  }

  assertTerms(
    bond: BondV1,
    expected: {
      faceValue: number;
      couponRate: number;
      totalSize: number;
      currency: string;
    },
  ): void {
    expect(FinancialUtility.equals(bond.face_value, expected.faceValue)).toBe(true);
    expect(FinancialUtility.equals(bond.coupon_rate, expected.couponRate)).toBe(true);
    expect(bond.total_size).toBe(expected.totalSize);
    expect(bond.currency).toBe(expected.currency);
  }
}
