import { test, expect } from '../../src/fixtures/global-test-options';
import { BondBuilder } from '../../src/builders/BondBuilder';
import { BondStatus } from '../../src/enums';
import { BondApiValidator } from '../../src/api/api-validators';

test.describe('Bond Upload via SFTP @smoke', () => {
  test('valid CSV upload creates bond discoverable via API', async ({
    bondWorkflow,
    api,
    bondAssertions,
    businessDate,
  }) => {
    const builder = BondBuilder.create().alreadyOpenOn(businessDate);
    const { bond, row } = await bondWorkflow.uploadBond(builder);

    bondAssertions.assertIsin(bond, row.isin);
    BondApiValidator.assertV1Shape(bond);
    expect([BondStatus.PENDING, BondStatus.OPEN]).toContain(bond.status);

    const listed = await api.bonds.findByIsin(row.isin);
    expect(listed).toBeDefined();
  });

  test('multi-row CSV creates multiple bonds', async ({ bondWorkflow, businessDate }) => {
    const builders = [
      BondBuilder.create().alreadyOpenOn(businessDate).withTotalSize(50_000),
      BondBuilder.create().alreadyOpenOn(businessDate).withTotalSize(75_000),
    ];
    const uploaded = await bondWorkflow.uploadBonds(builders);
    expect(uploaded).toHaveLength(2);
    expect(uploaded[0].bond.isin).not.toBe(uploaded[1].bond.isin);
  });

  test('PENDING bond becomes OPEN when business date reaches bookOpenDate', async ({
    bondWorkflow,
    api,
    businessDate,
    bondAssertions,
  }) => {
    const builder = BondBuilder.create().pendingOn(businessDate, 1, 4);
    const { bond, row } = await bondWorkflow.uploadBond(builder);
    expect(bond.status).toBe(BondStatus.PENDING);

    await api.system.advanceTo(row.bookOpenDate);
    const opened = await api.bonds.waitForStatus(row.isin, BondStatus.OPEN);
    bondAssertions.assertStatus(opened, BondStatus.OPEN);
  });

  test('duplicate file name is not reprocessed as a new bond set', async ({
    bondWorkflow,
    csvUtility,
    sftpUtility,
    api,
    businessDate,
  }) => {
    const row = BondBuilder.create().alreadyOpenOn(businessDate).buildCsvRow();
    const fileName = csvUtility.nextFileName();
    const written = csvUtility.writeFile([row], fileName);
    try {
      await sftpUtility.uploadFile(written.filePath, fileName);
    } catch {
      sftpUtility.uploadViaVolume(written.filePath, fileName);
    }
    await api.bonds.waitForBondByIsin(row.isin);
    const beforeCount = (await api.bonds.listBonds()).filter((b) => b.isin === row.isin).length;

    // Re-upload same file name
    try {
      await sftpUtility.uploadFile(written.filePath, fileName);
    } catch {
      sftpUtility.uploadViaVolume(written.filePath, fileName);
    }

    // Give poller a moment via bond wait timeout short poll — count should stay same
    await api.system.getBusinessDate();
    const afterCount = (await api.bonds.listBonds()).filter((b) => b.isin === row.isin).length;
    expect(afterCount).toBe(beforeCount);
  });
});
