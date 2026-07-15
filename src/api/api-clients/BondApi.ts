import { APIRequestContext, APIResponse } from '@playwright/test';
import { API_PATHS } from '../../constants';
import { BondV1, SubscribeRequest, SubscriptionV1 } from '../../types/domain';
import { ApiUtility } from '../../utilities/ApiUtility';
import { Logger } from '../../utilities/Logger';
import { RetryUtility } from '../../utilities/RetryUtility';
import { frameworkConfig } from '../../config/framework-config';
import { BondStatus } from '../../enums';

export class BondApi {
  private readonly api: ApiUtility;
  private readonly logger: Logger;
  private readonly retry: RetryUtility;

  constructor(request: APIRequestContext, logger?: Logger) {
    this.logger = logger ?? new Logger('BondApi');
    this.api = new ApiUtility(request, this.logger);
    this.retry = new RetryUtility(this.logger);
  }

  async listBonds(): Promise<BondV1[]> {
    return this.api.getJson<BondV1[]>(API_PATHS.v1.bonds);
  }

  async getBond(id: number): Promise<BondV1> {
    return this.api.getJson<BondV1>(API_PATHS.v1.bondById(id));
  }

  async getBondRaw(id: number): Promise<APIResponse> {
    return this.api.get(API_PATHS.v1.bondById(id));
  }

  async findByIsin(isin: string): Promise<BondV1 | undefined> {
    const bonds = await this.listBonds();
    return bonds.find((b) => b.isin === isin);
  }

  async waitForBondByIsin(isin: string): Promise<BondV1> {
    return this.retry.until(
      async () => {
        const bond = await this.findByIsin(isin);
        return bond ?? null;
      },
      {
        timeoutMs: frameworkConfig.timeouts.bondAppear,
        intervalMs: frameworkConfig.polling.bondAppearIntervalMs,
        description: `bond ISIN ${isin} to appear`,
      },
    );
  }

  async waitForStatus(isin: string, status: BondStatus | string): Promise<BondV1> {
    return this.retry.until(
      async () => {
        const bond = await this.findByIsin(isin);
        if (!bond) return null;
        return bond.status === status ? bond : null;
      },
      {
        timeoutMs: frameworkConfig.timeouts.bondAppear,
        intervalMs: frameworkConfig.polling.bondAppearIntervalMs,
        description: `bond ${isin} status=${status}`,
      },
    );
  }

  async subscribe(
    bondId: number,
    quantity: number,
    userId: string,
  ): Promise<{ response: APIResponse; body?: SubscriptionV1 }> {
    const payload: SubscribeRequest = { quantity };
    const response = await this.api.post(API_PATHS.v1.subscribe(bondId), {
      userId,
      data: payload,
    });
    let body: SubscriptionV1 | undefined;
    try {
      body = (await response.json()) as SubscriptionV1;
    } catch {
      body = undefined;
    }
    return { response, body };
  }

  async subscribeExpectSuccess(
    bondId: number,
    quantity: number,
    userId: string,
  ): Promise<SubscriptionV1> {
    const { response, body } = await this.subscribe(bondId, quantity, userId);
    if (!response.ok() || !body) {
      const text = await response.text();
      throw new Error(`Subscribe failed (${response.status()}): ${text}`);
    }
    return body;
  }
}
