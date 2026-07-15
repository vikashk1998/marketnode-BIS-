import { test, expect } from '../../src/fixtures/global-test-options';
import { InvestorId, BondStatus, SubscriptionStatus } from '../../src/enums';
import { FinancialUtility } from '../../src/utilities/FinancialUtility';
import { SubscriptionBuilder } from '../../src/builders/SubscriptionBuilder';
import { DateUtility } from '../../src/utilities/DateUtility';
import { BondBuilder } from '../../src/builders/BondBuilder';

test.describe('E2E — Bond Lifecycle @e2e @smoke', () => {
  test('upload → open → subscribe → allocate → coupons → mature', async ({
    bondWorkflow,
    api,
    couponAssertions,
    maturityAssertions,
    logger,
  }) => {
    const faceValue = 1000;
    const couponRate = 0.0005;
    const businessDate = await api.system.getBusinessDate();

    const builder = BondBuilder.create()
      .withFaceValue(faceValue)
      .withCouponRate(couponRate)
      .withTotalSize(100_000)
      .withBookWindow(businessDate, DateUtility.addDays(businessDate, 5))
      .withMaturity(DateUtility.nextBusinessDay(DateUtility.addDays(businessDate, 12)));

    const { bond: created, row } = await bondWorkflow.uploadBond(builder);
    logger.generatedData('e2e-bond', row);

    const bond = await bondWorkflow.ensureOpen({ bond: created, row, fileName: '' });
    expect(bond.status).toBe(BondStatus.OPEN);

    const specs = SubscriptionBuilder.workedExampleSet();
    for (const spec of specs) {
      await api.bonds.subscribeExpectSuccess(bond.id, spec.quantity, String(spec.investorId));
    }

    const expectedAlloc = FinancialUtility.proportionalAllocation(
      specs.map((s) => ({ investorId: String(s.investorId), quantity: s.quantity })),
      100_000,
    );

    await bondWorkflow.closeAndAllocate(bond.isin);

    const actuals = [];
    for (const exp of expectedAlloc) {
      const item = await api.portfolio.findSubscriptionV1(exp.investorId, bond.id);
      expect(item!.status).toBe(SubscriptionStatus.ALLOCATED);
      actuals.push(item!.allocated_quantity);
      expect(Math.abs(item!.allocated_quantity - exp.allocatedQuantity)).toBeLessThanOrEqual(1);
    }
    const total = actuals.reduce((a, b) => a + b, 0);
    if (total > 100_000) {
      logger.warn('DEF-006: allocated total exceeds totalSize', { total, actuals });
    }
    expect(total).toBeGreaterThanOrEqual(99_999);
    expect(total).toBeLessThanOrEqual(100_001);

    let couponFound = false;
    for (let i = 0; i < 6; i += 1) {
      await api.system.advanceDate();
      const coupons = (await api.portfolio.getCouponsV1(InvestorId.INV_001)).filter(
        (c) => c.bond_id === bond.id,
      );
      if (coupons.length > 0) {
        couponAssertions.assertDailyAmount(coupons[0], faceValue, couponRate, actuals[0]);
        couponFound = true;
        break;
      }
    }
    expect(couponFound).toBe(true);

    await api.system.advanceTo(bond.maturity_date);
    const maturityTarget = DateUtility.isWeekend(bond.maturity_date)
      ? DateUtility.nextBusinessDay(bond.maturity_date)
      : bond.maturity_date;
    if ((await api.system.getBusinessDate()) < maturityTarget) {
      await api.system.advanceTo(maturityTarget);
    }

    const matured = await api.bonds.waitForStatus(bond.isin, BondStatus.MATURED);
    expect(matured.status).toBe(BondStatus.MATURED);

    const maturity = (await api.portfolio.getMaturitiesV1(InvestorId.INV_001)).find(
      (m) => m.bond_id === bond.id,
    );
    expect(maturity).toBeDefined();
    maturityAssertions.assertPrincipal(maturity!, faceValue, actuals[0]);
  });
});
