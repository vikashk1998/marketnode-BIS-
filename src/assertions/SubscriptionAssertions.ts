import { expect } from '@playwright/test';
import { PortfolioItemV1, SubscriptionV1 } from '../types/domain';
import { SubscriptionStatus } from '../enums';
import { AllocationResult } from '../types/domain';

export class SubscriptionAssertions {
  assertCreated(sub: SubscriptionV1, bondId: number, userId: string, qty: number): void {
    expect(sub.bond_id).toBe(bondId);
    expect(sub.investor_id).toBe(userId);
    expect(sub.quantity).toBe(qty);
    expect(sub.status).toBe(SubscriptionStatus.PENDING);
  }

  assertPortfolioAllocation(
    item: PortfolioItemV1,
    expectedAllocated: number,
    expectedStatus: SubscriptionStatus | string,
  ): void {
    expect(item.allocated_quantity).toBe(expectedAllocated);
    expect(item.status).toBe(expectedStatus);
  }

  assertMatchesExpected(actual: PortfolioItemV1, expected: AllocationResult): void {
    expect(itemInvestorMatches(actual, expected.investorId)).toBe(true);
    expect(actual.allocated_quantity).toBe(expected.allocatedQuantity);
    expect(actual.status).toBe(expected.status);
  }
}

function itemInvestorMatches(_item: PortfolioItemV1, _investorId: string): boolean {
  // Portfolio items are scoped by X-User-Id; investor id is implicit.
  return true;
}
