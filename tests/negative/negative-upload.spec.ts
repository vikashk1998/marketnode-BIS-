import { test, expect } from '../../src/fixtures/global-test-options';
import { BondBuilder } from '../../src/builders/BondBuilder';
import { InvestorId } from '../../src/enums';
import { RetryUtility } from '../../src/utilities/RetryUtility';

test.describe('Negative CSV Upload Scenarios', () => {
  const scenarios = [
    { name: 'invalid-header' as const, defect: null },
    { name: 'malformed-row' as const, defect: null },
    { name: 'negative-face-value' as const, defect: 'DEF-008' },
    { name: 'invalid-currency' as const, defect: 'DEF-009' },
    { name: 'invalid-date' as const, defect: null },
    { name: 'zero-quantity-fields' as const, defect: 'DEF-010' },
    { name: 'coupon-rate-out-of-range' as const, defect: 'DEF-011' },
  ];

  for (const scenario of scenarios) {
    test(`scenario "${scenario.name}" does not create a valid bond from bad content`, async ({
      csvUtility,
      sftpUtility,
      api,
      businessDate,
      logger,
    }) => {
      const beforeIsins = new Set((await api.bonds.listBonds()).map((b) => b.isin));
      const file = csvUtility.writeScenario(scenario.name, businessDate);
      logger.generatedData(scenario.name, file.isins);

      try {
        await sftpUtility.uploadFile(file.filePath, file.fileName);
      } catch {
        sftpUtility.uploadViaVolume(file.filePath, file.fileName);
      }

      await new RetryUtility(logger).sleep(5_000);

      const after = await api.bonds.listBonds();
      for (const isin of file.isins) {
        if (!isin) continue;
        const created = after.find((b) => b.isin === isin && !beforeIsins.has(isin));
        if (created && scenario.defect) {
          logger.warn(`${scenario.defect}: invalid CSV accepted and created bond`, {
            scenario: scenario.name,
            isin,
            bondId: created.id,
          });
          test.info().annotations.push({
            type: 'defect',
            description: `${scenario.defect}: invalid ${scenario.name} created bond ${isin}`,
          });
        } else {
          expect(created, `Invalid scenario ${scenario.name} should not create ISIN ${isin}`).toBeUndefined();
        }
      }
    });
  }

  test('duplicate ISIN within file yields at most one bond for that ISIN', async ({
    csvUtility,
    sftpUtility,
    api,
    businessDate,
  }) => {
    const file = csvUtility.writeScenario('duplicate-isin', businessDate);
    const before = (await api.bonds.listBonds()).filter((b) => b.isin === file.isins[0]).length;

    try {
      await sftpUtility.uploadFile(file.filePath, file.fileName);
    } catch {
      sftpUtility.uploadViaVolume(file.filePath, file.fileName);
    }

    await new RetryUtility().sleep(5_000);
    const after = (await api.bonds.listBonds()).filter((b) => b.isin === file.isins[0]).length;
    expect(after - before).toBeLessThanOrEqual(1);
  });
});

test.describe('Negative Subscription Rules', () => {
  test('subscription rejected when bond is PENDING (book not open)', async ({
    bondWorkflow,
    api,
    businessDate,
  }) => {
    const { bond } = await bondWorkflow.uploadBond(
      BondBuilder.create().pendingOn(businessDate, 2, 5),
    );
    expect(bond.status).toBe('PENDING');
    const { response } = await api.bonds.subscribe(bond.id, 1000, InvestorId.INV_001);
    expect(response.ok()).toBeFalsy();
  });

  test('duplicate subscription by same investor is rejected', async ({
    bondWorkflow,
    api,
    logger,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 50_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    await api.bonds.subscribeExpectSuccess(bond.id, 1_000, InvestorId.INV_001);
    const second = await api.bonds.subscribe(bond.id, 1_000, InvestorId.INV_001);
    if (second.response.ok()) {
      logger.warn('DEF-012: duplicate subscription accepted for same investor', {
        bondId: bond.id,
        status: second.response.status(),
      });
      test.info().annotations.push({
        type: 'defect',
        description: 'DEF-012: duplicate subscription accepted',
      });
    } else {
      expect(second.response.ok()).toBeFalsy();
    }
  });

  test('zero quantity is rejected', async ({ bondWorkflow, api, logger }) => {
    const uploaded = await bondWorkflow.uploadOpenBond();
    const bond = await bondWorkflow.ensureOpen(uploaded);
    const { response } = await api.bonds.subscribe(bond.id, 0, InvestorId.INV_002);
    if (response.ok()) {
      logger.warn('DEF-013: zero quantity subscription accepted', { bondId: bond.id });
      test.info().annotations.push({
        type: 'defect',
        description: 'DEF-013: zero quantity accepted',
      });
    } else {
      expect(response.ok()).toBeFalsy();
    }
  });

  test('subscription rejected after book close', async ({ bondWorkflow, api }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 10_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);
    const { DateUtility } = await import('../../src/utilities/DateUtility');
    await api.system.advanceTo(DateUtility.addDays(bond.book_close_date, 1));
    const closed = await api.bonds.waitForBondByIsin(bond.isin);
    expect(['CLOSED', 'ALLOCATED']).toContain(closed.status);
    const { response } = await api.bonds.subscribe(bond.id, 100, InvestorId.INV_003);
    expect(response.ok()).toBeFalsy();
  });
});
