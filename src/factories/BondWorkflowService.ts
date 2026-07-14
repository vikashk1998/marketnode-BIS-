import { APIRequestContext } from '@playwright/test';
import { BondApi } from '../api/api-clients/BondApi';
import { SystemApi } from '../api/api-clients/SystemApi';
import { BondBuilder } from '../builders/BondBuilder';
import { CsvBuilder } from '../builders/CsvBuilder';
import { BondV1, BondCsvRow } from '../types/domain';
import { CsvUtility } from '../utilities/CsvUtility';
import { SftpUtility } from '../utilities/SftpUtility';
import { Logger } from '../utilities/Logger';
import { BondStatus } from '../enums';
import { DateUtility } from '../utilities/DateUtility';

export interface UploadedBond {
  readonly bond: BondV1;
  readonly row: BondCsvRow;
  readonly fileName: string;
}

/**
 * High-level workflow: generate CSV → SFTP upload → await ingestion.
 *
 * Note: status transitions (PENDING→OPEN, etc.) are driven by POST /api/system/advance-date,
 * not by upload alone — even when book dates already include the current business date.
 */
export class BondWorkflowService {
  private readonly bonds: BondApi;
  private readonly system: SystemApi;
  private readonly csv: CsvUtility;
  private readonly sftp: SftpUtility;
  private readonly logger: Logger;

  constructor(request: APIRequestContext, logger?: Logger) {
    this.logger = logger ?? new Logger('BondWorkflowService');
    this.bonds = new BondApi(request, this.logger);
    this.system = new SystemApi(request, this.logger);
    this.csv = new CsvUtility(this.logger);
    this.sftp = new SftpUtility(this.logger);
  }

  async uploadBond(builder: BondBuilder): Promise<UploadedBond> {
    const row = builder.buildCsvRow();
    const written = this.csv.writeFile([row]);
    await this.uploadWithFallback(written.filePath, written.fileName);
    const bond = await this.bonds.waitForBondByIsin(row.isin);
    this.logger.info(`Bond ingested: ${bond.isin} id=${bond.id} status=${bond.status}`);
    return { bond, row, fileName: written.fileName };
  }

  async uploadBonds(builders: BondBuilder[]): Promise<UploadedBond[]> {
    const rows = builders.map((b) => b.buildCsvRow());
    const written = this.csv.writeFile(rows);
    await this.uploadWithFallback(written.filePath, written.fileName);
    const results: UploadedBond[] = [];
    for (const row of rows) {
      const bond = await this.bonds.waitForBondByIsin(row.isin);
      results.push({ bond, row, fileName: written.fileName });
    }
    return results;
  }

  async uploadOpenBond(options?: {
    totalSize?: number;
    faceValue?: number;
    couponRate?: number;
  }): Promise<UploadedBond> {
    const businessDate = await this.system.getBusinessDate();
    // Open today, close far enough that ensureOpen's mandatory +1 day advance
    // still leaves the book OPEN for subscriptions.
    const builder = BondBuilder.create()
      .withBookWindow(businessDate, DateUtility.addDays(businessDate, 5))
      .withMaturity(DateUtility.nextBusinessDay(DateUtility.addDays(businessDate, 16)))
      .withTotalSize(options?.totalSize ?? 100_000)
      .withFaceValue(options?.faceValue ?? 1000)
      .withCouponRate(options?.couponRate ?? 0.0005);
    const uploaded = await this.uploadBond(builder);
    const openBond = await this.ensureOpen(uploaded);
    return { ...uploaded, bond: openBond };
  }

  /**
   * Ensures the bond is OPEN for subscription.
   * Lifecycle evaluation runs on date advance; if the bond is still PENDING while
   * book_open_date <= current business date, we advance one day to trigger processing
   * (then continue advancing until OPEN if needed).
   */
  async ensureOpen(uploaded: UploadedBond): Promise<BondV1> {
    let bond = await this.bonds.waitForBondByIsin(uploaded.bond.isin);
    if (bond.status === BondStatus.OPEN) {
      return bond;
    }

    let businessDate = await this.system.getBusinessDate();

    if (bond.book_open_date > businessDate) {
      await this.system.advanceTo(bond.book_open_date);
      businessDate = await this.system.getBusinessDate();
    }

    // Trigger lifecycle when open date is already reached but status still PENDING
    if (bond.status === BondStatus.PENDING && bond.book_open_date <= businessDate) {
      this.logger.info(
        `Bond ${bond.isin} is PENDING despite book_open_date=${bond.book_open_date} <= ${businessDate}; advancing to trigger lifecycle`,
      );
      await this.system.advanceDate();
    }

    bond = await this.bonds.waitForStatus(bond.isin, BondStatus.OPEN);
    return bond;
  }

  async closeAndAllocate(isin: string): Promise<BondV1> {
    const bond = await this.bonds.waitForBondByIsin(isin);
    // Advance to the day after book close so CLOSE + ALLOCATE lifecycle events fire
    await this.system.advanceTo(DateUtility.addDays(bond.book_close_date, 1));
    return this.bonds.waitForStatus(isin, BondStatus.ALLOCATED);
  }

  private async uploadWithFallback(localPath: string, fileName: string): Promise<void> {
    try {
      await this.sftp.uploadFile(localPath, fileName);
    } catch (error) {
      this.logger.warn('SFTP upload failed; falling back to volume copy', String(error));
      this.sftp.uploadViaVolume(localPath, fileName);
    }
  }

  createCsvBuilder(): CsvBuilder {
    return CsvBuilder.create(this.csv);
  }

  getCsvUtility(): CsvUtility {
    return this.csv;
  }

  getSftpUtility(): SftpUtility {
    return this.sftp;
  }
}
