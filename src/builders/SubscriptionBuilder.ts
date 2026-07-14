import { InvestorId } from '../enums';

export interface SubscriptionSpec {
  readonly investorId: InvestorId | string;
  readonly quantity: number;
  readonly bondId?: number;
}

export class SubscriptionBuilder {
  private investorId: string = InvestorId.INV_001;
  private quantity = 1_000;
  private bondId?: number;

  static create(): SubscriptionBuilder {
    return new SubscriptionBuilder();
  }

  forInvestor(investorId: string): SubscriptionBuilder {
    this.investorId = investorId;
    return this;
  }

  withQuantity(quantity: number): SubscriptionBuilder {
    this.quantity = quantity;
    return this;
  }

  forBond(bondId: number): SubscriptionBuilder {
    this.bondId = bondId;
    return this;
  }

  build(): SubscriptionSpec {
    return {
      investorId: this.investorId,
      quantity: this.quantity,
      bondId: this.bondId,
    };
  }

  /** Worked-example oversubscription set from PRODUCT.md. */
  static workedExampleSet(): SubscriptionSpec[] {
    return [
      { investorId: InvestorId.INV_001, quantity: 40_000 },
      { investorId: InvestorId.INV_002, quantity: 30_000 },
      { investorId: InvestorId.INV_003, quantity: 50_000 },
    ];
  }
}
