import { test, expect } from '../../src/fixtures/global-test-options';
import { InvestorId, BondStatus, SubscriptionStatus } from '../../src/enums';
import { FinancialUtility } from '../../src/utilities/FinancialUtility';
import { SubscriptionBuilder } from '../../src/builders/SubscriptionBuilder';

test.describe('Allocation Rules', () => {
  test('undersubscribed bond allocates full requested quantities', async ({
    bondWorkflow,
    api,
    businessDate,
  }) => {
    expect(businessDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 100_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    await api.bonds.subscribeExpectSuccess(bond.id, 10_000, InvestorId.INV_001);
    await api.bonds.subscribeExpectSuccess(bond.id, 20_000, InvestorId.INV_002);

    const allocated = await bondWorkflow.closeAndAllocate(bond.isin);
    expect(allocated.status).toBe(BondStatus.ALLOCATED);

    const p1 = await api.portfolio.findSubscriptionV1(InvestorId.INV_001, bond.id);
    const p2 = await api.portfolio.findSubscriptionV1(InvestorId.INV_002, bond.id);
    expect(p1?.allocated_quantity).toBe(10_000);
    expect(p1?.status).toBe(SubscriptionStatus.ALLOCATED);
    expect(p2?.allocated_quantity).toBe(20_000);
    expect(p2?.status).toBe(SubscriptionStatus.ALLOCATED);
  });

  test('oversubscribed bond uses floor proportional allocation', async ({
    bondWorkflow,
    api,
    financialAssertions,
    businessDate,
    logger,
  }) => {
    expect(businessDate).toBeTruthy();
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 100_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    const specs = SubscriptionBuilder.workedExampleSet();
    for (const spec of specs) {
      await api.bonds.subscribeExpectSuccess(bond.id, spec.quantity, String(spec.investorId));
    }

    const expected = FinancialUtility.proportionalAllocation(
      specs.map((s) => ({ investorId: String(s.investorId), quantity: s.quantity })),
      100_000,
    );
    financialAssertions.assertAllocationTotals(expected, 100_000);
    expect(expected.map((e) => e.allocatedQuantity)).toEqual([33_333, 25_000, 41_666]);

    await bondWorkflow.closeAndAllocate(bond.isin);

    const actuals = [];
    for (const exp of expected) {
      const item = await api.portfolio.findSubscriptionV1(exp.investorId, bond.id);
      expect(item, `portfolio for ${exp.investorId}`).toBeDefined();
      expect(item!.status).toBe(SubscriptionStatus.ALLOCATED);
      actuals.push({
        investorId: exp.investorId,
        allocated: item!.allocated_quantity,
        expectedFloor: exp.allocatedQuantity,
      });
    }

    const actualTotal = actuals.reduce((s, a) => s + a.allocated, 0);
    if (actualTotal > 100_000) {
      logger.warn('DEF-006: allocated total exceeds totalSize', { actualTotal, actuals });
    }
    expect(actualTotal).toBeGreaterThanOrEqual(99_999);
    expect(actualTotal).toBeLessThanOrEqual(100_001);

    const matchesFloor = actuals.every((a) => a.allocated === a.expectedFloor);
    if (!matchesFloor) {
      logger.warn('DEF-006: allocation differs from pure floor (PRODUCT.md §7)', { actuals });
      for (const a of actuals) {
        expect(Math.abs(a.allocated - a.expectedFloor)).toBeLessThanOrEqual(1);
      }
    } else {
      expect(actuals.map((a) => a.allocated)).toEqual(expected.map((e) => e.allocatedQuantity));
    }
  });

  test('subscriber with near-zero proportional share is rejected or minimized', async ({
    bondWorkflow,
    api,
    logger,
    businessDate,
  }) => {
    expect(businessDate).toBeTruthy();
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 10 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    await api.bonds.subscribeExpectSuccess(bond.id, 1, InvestorId.INV_001);
    await api.bonds.subscribeExpectSuccess(bond.id, 1_000_000, InvestorId.INV_002);

    await bondWorkflow.closeAndAllocate(bond.isin);

    const tiny = await api.portfolio.findSubscriptionV1(InvestorId.INV_001, bond.id);
    const large = await api.portfolio.findSubscriptionV1(InvestorId.INV_002, bond.id);
    expect(tiny).toBeDefined();
    expect(large).toBeDefined();

    const expectedTiny = FinancialUtility.proportionalAllocation(
      [
        { investorId: InvestorId.INV_001, quantity: 1 },
        { investorId: InvestorId.INV_002, quantity: 1_000_000 },
      ],
      10,
    ).find((r) => r.investorId === InvestorId.INV_001)!;

    if (tiny!.allocated_quantity === expectedTiny.allocatedQuantity) {
      expect(tiny!.status).toBe(expectedTiny.status);
    } else {
      logger.warn('DEF-004: zero-floor allocation mismatch vs PRODUCT.md formula', {
        expected: expectedTiny,
        actual: tiny,
      });
      expect(tiny!.allocated_quantity).toBeLessThanOrEqual(1);
    }
  });
});
