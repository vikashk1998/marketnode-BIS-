import { BondCsvRow } from '../types/domain';
import { CsvUtility, CsvScenario } from '../utilities/CsvUtility';
import { BondBuilder } from './BondBuilder';

export class CsvBuilder {
  private readonly csv: CsvUtility;
  private rows: BondCsvRow[] = [];
  private scenario?: CsvScenario;
  private businessDate?: string;

  constructor(csv?: CsvUtility) {
    this.csv = csv ?? new CsvUtility();
  }

  static create(csv?: CsvUtility): CsvBuilder {
    return new CsvBuilder(csv);
  }

  withBusinessDate(date: string): CsvBuilder {
    this.businessDate = date;
    return this;
  }

  addBond(builder: BondBuilder): CsvBuilder {
    this.rows.push(builder.buildCsvRow());
    return this;
  }

  addRow(row: BondCsvRow): CsvBuilder {
    this.rows.push(row);
    return this;
  }

  asScenario(scenario: CsvScenario): CsvBuilder {
    this.scenario = scenario;
    return this;
  }

  buildFile(fileName?: string): {
    filePath: string;
    fileName: string;
    content: string;
    isins: string[];
  } {
    if (this.scenario) {
      return this.csv.writeScenario(this.scenario, this.businessDate);
    }
    if (this.rows.length === 0) {
      const row = this.csv.createRow({}, this.businessDate);
      this.rows = [row];
    }
    const written = this.csv.writeFile(this.rows, fileName);
    return { ...written, isins: this.rows.map((r) => r.isin) };
  }
}

export type { CsvScenario };
