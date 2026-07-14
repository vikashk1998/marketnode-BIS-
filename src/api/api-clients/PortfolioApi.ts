import { APIRequestContext } from '@playwright/test';
import { API_PATHS } from '../../constants';
import {
  CouponPaymentV1,
  MaturityPaymentV1,
  PortfolioItemV1,
  PortfolioV2Response,
} from '../../types/domain';
import { ApiUtility } from '../../utilities/ApiUtility';
import { Logger } from '../../utilities/Logger';

export class PortfolioApi {
  private readonly api: ApiUtility;
  private readonly logger: Logger;

  constructor(request: APIRequestContext, logger?: Logger) {
    this.logger = logger ?? new Logger('PortfolioApi');
    this.api = new ApiUtility(request, this.logger);
  }

  async getPortfolioV1(userId: string): Promise<PortfolioItemV1[]> {
    return this.api.getJson<PortfolioItemV1[]>(API_PATHS.v1.portfolio, { userId });
  }

  async getCouponsV1(userId: string): Promise<CouponPaymentV1[]> {
    return this.api.getJson<CouponPaymentV1[]>(API_PATHS.v1.coupons, { userId });
  }

  async getMaturitiesV1(userId: string): Promise<MaturityPaymentV1[]> {
    return this.api.getJson<MaturityPaymentV1[]>(API_PATHS.v1.maturities, { userId });
  }

  async getPortfolioV2(userId: string): Promise<PortfolioV2Response> {
    return this.api.getJson<PortfolioV2Response>(API_PATHS.v2.portfolio, { userId });
  }

  async findSubscriptionV1(
    userId: string,
    bondId: number,
  ): Promise<PortfolioItemV1 | undefined> {
    const portfolio = await this.getPortfolioV1(userId);
    return portfolio.find((p) => p.bond_id === bondId);
  }

  async sumCouponsForBond(userId: string, bondId: number): Promise<number> {
    const coupons = await this.getCouponsV1(userId);
    return coupons
      .filter((c) => c.bond_id === bondId)
      .reduce((sum, c) => sum + Number(c.amount), 0);
  }
}
