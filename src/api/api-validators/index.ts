import { expect } from '@playwright/test';
import { BondV1, BondV2, SubscriptionV1, SubscriptionV2 } from '../../types/domain';
import { BondStatus } from '../../enums';
import { FinancialUtility } from '../../utilities/FinancialUtility';

export class BondApiValidator {
  static assertV1Shape(bond: BondV1): void {
    expect(bond).toHaveProperty('isin');
    expect(bond).toHaveProperty('issuer_name');
    expect(bond).toHaveProperty('bond_name');
    expect(bond).toHaveProperty('face_value');
    expect(bond).toHaveProperty('coupon_rate');
    expect(bond).toHaveProperty('book_open_date');
    expect(bond).toHaveProperty('book_close_date');
    expect(typeof bond.issuer_name).toBe('string');
  }

  static assertV2Shape(bond: BondV2): void {
    expect(bond).toHaveProperty('isin');
    expect(bond).toHaveProperty('issuerName');
    expect(bond).toHaveProperty('bondName');
    expect(bond).toHaveProperty('terms');
    expect(bond).toHaveProperty('book');
    expect(bond.terms).toHaveProperty('couponRate');
    expect(bond.book).toHaveProperty('totalSize');
  }

  static assertStatus(bond: BondV1 | BondV2, expected: BondStatus | string): void {
    expect(bond.status).toBe(expected);
  }

  static assertV1V2Consistency(v1: BondV1, v2: BondV2): void {
    expect(v1.isin).toBe(v2.isin);
    expect(v1.bond_name).toBe(v2.bondName);
    expect(v1.issuer_name).toBe(v2.issuerName);
    expect(v1.status).toBe(v2.status);
    expect(v1.currency).toBe(v2.currency);
    expect(v1.total_size).toBe(v2.book.totalSize);
    expect(v1.book_open_date).toBe(v2.book.openDate);
    expect(v1.book_close_date).toBe(v2.book.closeDate);
    expect(FinancialUtility.equals(v1.coupon_rate, v2.terms.couponRate)).toBe(true);
  }
}

export class SubscriptionApiValidator {
  static assertV1Created(sub: SubscriptionV1, bondId: number, userId: string, qty: number): void {
    expect(sub.bond_id).toBe(bondId);
    expect(sub.investor_id).toBe(userId);
    expect(sub.quantity).toBe(qty);
    expect(sub.status).toBe('PENDING');
  }

  static assertV2Created(sub: SubscriptionV2, bondId: number, userId: string, qty: number): void {
    expect(sub.bondId).toBe(bondId);
    expect(sub.investorId).toBe(userId);
    expect(sub.quantity).toBe(qty);
    expect(sub.status).toBe('PENDING');
  }
}
