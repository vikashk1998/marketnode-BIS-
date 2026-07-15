import { test, expect } from '../../src/fixtures/global-test-options';
import { InvestorId, BondStatus } from '../../src/enums';
import { FinancialUtility } from '../../src/utilities/FinancialUtility';
import { DateUtility } from '../../src/utilities/DateUtility';
import { BondBuilder } from '../../src/builders/BondBuilder';

test.describe('Maturity & Principal Return @financial', () => {
  test('maturity pays faceValue × allocatedQuantity and transitions to MATURED', async ({
    bondWorkflow,
    api,
    maturityAssertions,
  }) => {
    const faceValue = 1000;
    const qty = 250;

    const businessDate = await api.system.getBusinessDate();
    // Short lifecycle for faster maturity
    const builder = BondBuilder.create()
      .withFaceValue(faceValue)
      .withCouponRate(0.0005)
      .withTotalSize(10_000)
      .withBookWindow(businessDate, DateUtility.addDays(businessDate, 1))
      .withMaturity(DateUtility.nextBusinessDay(DateUtility.addDays(businessDate, 5)));

    const uploaded = await bondWorkflow.uploadBond(builder);
    const bond = await bondWorkflow.ensureOpen(uploaded);
    await api.bonds.subscribeExpectSuccess(bond.id, qty, InvestorId.INV_001);
    await bondWorkflow.closeAndAllocate(bond.isin);

    await api.system.advanceTo(bond.maturity_date);
    // If maturity falls on weekend, payment on next business day per spec
    const targetMaturity = DateUtility.isWeekend(bond.maturity_date)
      ? DateUtility.nextBusinessDay(bond.maturity_date)
      : bond.maturity_date;
    if (targetMaturity > (await api.system.getBusinessDate())) {
      await api.system.advanceTo(targetMaturity);
    }

    const matured = await api.bonds.waitForStatus(bond.isin, BondStatus.MATURED);
    expect(matured.status).toBe(BondStatus.MATURED);

    const maturities = await api.portfolio.getMaturitiesV1(InvestorId.INV_001);
    const payment = maturities.find((m) => m.bond_id === bond.id);
    expect(payment).toBeDefined();
    maturityAssertions.assertPrincipal(payment!, faceValue, qty);
    expect(FinancialUtility.formatMoney(payment!.principal_amount)).toBe(
      FinancialUtility.formatMoney(faceValue * qty),
    );
  });
});
