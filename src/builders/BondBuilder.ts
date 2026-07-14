import { BondCsvRow, BondTermsInput } from '../types/domain';
import { DateUtility } from '../utilities/DateUtility';
import { RandomDataUtility } from '../utilities/RandomDataUtility';
import { CurrencyCode } from '../enums';

/**
 * Fluent builder for bond terms / CSV rows with sensible lifecycle dates
 * relative to the current business date.
 */
export class BondBuilder {
  private isinValue: string = RandomDataUtility.generateIsin();
  private issuerNameValue = RandomDataUtility.issuerName();
  private bondNameValue = RandomDataUtility.bondName();
  private currencyValue: string = CurrencyCode.MYR;
  private faceValueValue = 1000;
  private couponRateValue = 0.0005;
  private totalSizeValue = 100_000;
  private bookOpenDateValue = DateUtility.todayIso();
  private bookCloseDateValue = DateUtility.addDays(DateUtility.todayIso(), 2);
  private maturityDateValue = DateUtility.nextBusinessDay(
    DateUtility.addDays(DateUtility.todayIso(), 14),
  );

  static create(): BondBuilder {
    return new BondBuilder();
  }

  /**
   * Opens today, closes in `closeOffset` days, matures `maturityOffset` days after close (business day).
   */
  withLifecycleRelativeTo(
    businessDate: string,
    options: { openOffset?: number; closeOffset?: number; maturityOffset?: number } = {},
  ): BondBuilder {
    const openOffset = options.openOffset ?? 0;
    const closeOffset = options.closeOffset ?? 2;
    const maturityOffset = options.maturityOffset ?? 10;
    this.bookOpenDateValue = DateUtility.addDays(businessDate, openOffset);
    this.bookCloseDateValue = DateUtility.addDays(businessDate, closeOffset);
    this.maturityDateValue = DateUtility.nextBusinessDay(
      DateUtility.addDays(this.bookCloseDateValue, maturityOffset),
    );
    return this;
  }

  /** Bond already OPEN on businessDate (open earlier, close later). */
  alreadyOpenOn(businessDate: string, closeOffset = 3, maturityOffset = 12): BondBuilder {
    this.bookOpenDateValue = DateUtility.addDays(businessDate, -1);
    this.bookCloseDateValue = DateUtility.addDays(businessDate, closeOffset);
    this.maturityDateValue = DateUtility.nextBusinessDay(
      DateUtility.addDays(this.bookCloseDateValue, maturityOffset),
    );
    return this;
  }

  /** PENDING: opens in the future. */
  pendingOn(businessDate: string, openOffset = 2, closeOffset = 5): BondBuilder {
    return this.withLifecycleRelativeTo(businessDate, { openOffset, closeOffset, maturityOffset: 12 });
  }

  withIsin(isin: string): BondBuilder {
    this.isinValue = isin;
    return this;
  }

  withIssuer(name: string): BondBuilder {
    this.issuerNameValue = name;
    return this;
  }

  withBondName(name: string): BondBuilder {
    this.bondNameValue = name;
    return this;
  }

  withCurrency(currency: string): BondBuilder {
    this.currencyValue = currency;
    return this;
  }

  withFaceValue(faceValue: number): BondBuilder {
    this.faceValueValue = faceValue;
    return this;
  }

  withCouponRate(rate: number): BondBuilder {
    this.couponRateValue = rate;
    return this;
  }

  withTotalSize(size: number): BondBuilder {
    this.totalSizeValue = size;
    return this;
  }

  withBookWindow(open: string, close: string): BondBuilder {
    this.bookOpenDateValue = open;
    this.bookCloseDateValue = close;
    return this;
  }

  withMaturity(date: string): BondBuilder {
    this.maturityDateValue = date;
    return this;
  }

  /** Mirrors PRODUCT.md worked example proportions scaled for current date. */
  withWorkedExampleTerms(businessDate: string): BondBuilder {
    this.issuerNameValue = 'MegaCorp';
    this.bondNameValue = 'MEGA 2026 Notes';
    this.faceValueValue = 1000;
    this.couponRateValue = 0.0005;
    this.totalSizeValue = 100_000;
    this.bookOpenDateValue = businessDate;
    this.bookCloseDateValue = DateUtility.addDays(businessDate, 2);
    this.maturityDateValue = DateUtility.nextBusinessDay(
      DateUtility.addDays(this.bookCloseDateValue, 10),
    );
    return this;
  }

  buildTerms(): BondTermsInput {
    return {
      isin: this.isinValue,
      issuerName: this.issuerNameValue,
      bondName: this.bondNameValue,
      currency: this.currencyValue,
      faceValue: this.faceValueValue,
      couponRate: this.couponRateValue,
      totalSize: this.totalSizeValue,
      bookOpenDate: this.bookOpenDateValue,
      bookCloseDate: this.bookCloseDateValue,
      maturityDate: this.maturityDateValue,
    };
  }

  buildCsvRow(): BondCsvRow {
    const terms = this.buildTerms();
    return {
      isin: terms.isin ?? this.isinValue,
      issuerName: terms.issuerName,
      bondName: terms.bondName,
      currency: terms.currency,
      faceValue: terms.faceValue.toFixed(2),
      couponRate: terms.couponRate.toFixed(4),
      maturityDate: terms.maturityDate,
      totalSize: String(terms.totalSize),
      bookOpenDate: terms.bookOpenDate,
      bookCloseDate: terms.bookCloseDate,
    };
  }
}
