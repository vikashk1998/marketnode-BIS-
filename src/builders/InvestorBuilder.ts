import { InvestorId } from '../enums';
import { INVESTORS } from '../constants';
import { Investor } from '../types/domain';

export class InvestorBuilder {
  private id: InvestorId = InvestorId.INV_001;

  static create(): InvestorBuilder {
    return new InvestorBuilder();
  }

  withId(id: InvestorId): InvestorBuilder {
    this.id = id;
    return this;
  }

  alpha(): InvestorBuilder {
    this.id = InvestorId.INV_001;
    return this;
  }

  beta(): InvestorBuilder {
    this.id = InvestorId.INV_002;
    return this;
  }

  gamma(): InvestorBuilder {
    this.id = InvestorId.INV_003;
    return this;
  }

  delta(): InvestorBuilder {
    this.id = InvestorId.INV_004;
    return this;
  }

  epsilon(): InvestorBuilder {
    this.id = InvestorId.INV_005;
    return this;
  }

  build(): Investor {
    return { ...INVESTORS[this.id] };
  }

  static all(): Investor[] {
    return Object.values(INVESTORS).map((i) => ({ ...i }));
  }

  static allIds(): InvestorId[] {
    return Object.keys(INVESTORS) as InvestorId[];
  }
}
