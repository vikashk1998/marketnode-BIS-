import * as fs from 'fs';
import * as path from 'path';
import { CSV_HEADERS } from '../constants';
import { BondCsvRow } from '../types/domain';
import { DateUtility } from './DateUtility';
import { RandomDataUtility } from './RandomDataUtility';
import { Logger } from './Logger';

export type CsvScenario =
  | 'valid'
  | 'invalid-header'
  | 'duplicate-isin'
  | 'malformed-row'
  | 'negative-face-value'
  | 'invalid-currency'
  | 'invalid-date'
  | 'boundary-face-value'
  | 'zero-quantity-fields'
  | 'coupon-rate-out-of-range';

/**
 * Builds bond CSV content and files for SFTP upload scenarios.
 */
export class CsvUtility {
  private static fileCounter = 0;
  private readonly logger: Logger;
  private readonly outputDir: string;

  constructor(logger?: Logger, outputDir?: string) {
    this.logger = logger ?? new Logger('CsvUtility');
    this.outputDir = outputDir ?? path.join(process.cwd(), 'test-data', 'generated');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  buildContent(rows: readonly BondCsvRow[], headers: readonly string[] = CSV_HEADERS): string {
    const lines = [headers.join(',')];
    for (const row of rows) {
      const record: Record<string, string> = { ...row };
      lines.push(headers.map((h) => record[h] ?? '').join(','));
    }
    return `${lines.join('\n')}\n`;
  }

  createRow(overrides: Partial<BondCsvRow> = {}, businessDate?: string): BondCsvRow {
    const base = businessDate ?? DateUtility.todayIso();
    const open = overrides.bookOpenDate ?? base;
    const close = overrides.bookCloseDate ?? DateUtility.addDays(open, 3);
    const maturity = overrides.maturityDate ?? DateUtility.nextBusinessDay(DateUtility.addDays(close, 10));

    return {
      isin: overrides.isin ?? RandomDataUtility.generateIsin(),
      issuerName: overrides.issuerName ?? RandomDataUtility.issuerName(),
      bondName: overrides.bondName ?? RandomDataUtility.bondName(),
      currency: overrides.currency ?? 'MYR',
      faceValue: overrides.faceValue ?? '1000.00',
      couponRate: overrides.couponRate ?? '0.0005',
      maturityDate: maturity,
      totalSize: overrides.totalSize ?? '100000',
      bookOpenDate: open,
      bookCloseDate: close,
    };
  }

  writeFile(rows: readonly BondCsvRow[], fileName?: string): { filePath: string; fileName: string; content: string } {
    const name = fileName ?? this.nextFileName();
    const content = this.buildContent(rows);
    const filePath = path.join(this.outputDir, name);
    fs.writeFileSync(filePath, content, 'utf8');
    this.logger.generatedData('CSV', { fileName: name, rows: rows.length });
    return { filePath, fileName: name, content };
  }

  writeScenario(
    scenario: CsvScenario,
    businessDate?: string,
  ): { filePath: string; fileName: string; content: string; isins: string[] } {
    const base = businessDate ?? DateUtility.todayIso();
    let headers: readonly string[] = CSV_HEADERS;
    let rows: BondCsvRow[] = [];
    let contentOverride: string | undefined;

    switch (scenario) {
      case 'valid': {
        const row = this.createRow({}, base);
        rows = [row];
        break;
      }
      case 'invalid-header': {
        headers = [...CSV_HEADERS.slice(0, -1), 'bookClose'];
        rows = [this.createRow({}, base)];
        break;
      }
      case 'duplicate-isin': {
        const shared = RandomDataUtility.generateIsin();
        rows = [
          this.createRow({ isin: shared }, base),
          this.createRow({ isin: shared, bondName: 'Dup Bond' }, base),
        ];
        break;
      }
      case 'malformed-row': {
        contentOverride = `${CSV_HEADERS.join(',')}\nNOT_ENOUGH_COLUMNS,ONLY_TWO\n`;
        break;
      }
      case 'negative-face-value': {
        rows = [this.createRow({ faceValue: '-10.00' }, base)];
        break;
      }
      case 'invalid-currency': {
        rows = [this.createRow({ currency: 'XXXX' }, base)];
        break;
      }
      case 'invalid-date': {
        rows = [this.createRow({ maturityDate: '06-25-2026' }, base)];
        break;
      }
      case 'boundary-face-value': {
        rows = [this.createRow({ faceValue: '1000000.00' }, base)];
        break;
      }
      case 'zero-quantity-fields': {
        rows = [this.createRow({ totalSize: '0', faceValue: '0' }, base)];
        break;
      }
      case 'coupon-rate-out-of-range': {
        rows = [this.createRow({ couponRate: '1.5' }, base)];
        break;
      }
      default: {
        const exhaustive: never = scenario;
        throw new Error(`Unknown CSV scenario: ${exhaustive}`);
      }
    }

    const fileName = this.nextFileName();
    const content = contentOverride ?? this.buildContent(rows, headers);
    const filePath = path.join(this.outputDir, fileName);
    fs.writeFileSync(filePath, content, 'utf8');
    const isins = rows.map((r) => r.isin);
    this.logger.generatedData(`CSV scenario=${scenario}`, { fileName, isins });
    return { filePath, fileName, content, isins };
  }

  nextFileName(date = DateUtility.todayIso()): string {
    CsvUtility.fileCounter += 1;
    const yyyymmdd = date.replace(/-/g, '');
    return `BONDS_${yyyymmdd}_${RandomDataUtility.fileSequence(CsvUtility.fileCounter)}.csv`;
  }
}
