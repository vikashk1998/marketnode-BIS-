import { APIRequestContext } from '@playwright/test';
import { API_PATHS } from '../../constants';
import {
  BondV2,
  BondV2ListResponse,
  SubscribeRequest,
  SubscriptionV2,
} from '../../types/domain';
import { ApiUtility } from '../../utilities/ApiUtility';
import { Logger } from '../../utilities/Logger';
import { APIResponse } from '@playwright/test';

/**
 * API v2 bond + subscription client (camelCase / nested payloads).
 */
export class BondApiV2 {
  private readonly api: ApiUtility;
  private readonly logger: Logger;

  constructor(request: APIRequestContext, logger?: Logger) {
    this.logger = logger ?? new Logger('BondApiV2');
    this.api = new ApiUtility(request, this.logger);
  }

  async listBonds(): Promise<BondV2ListResponse> {
    return this.api.getJson<BondV2ListResponse>(API_PATHS.v2.bonds);
  }

  async getBond(id: number): Promise<BondV2> {
    return this.api.getJson<BondV2>(API_PATHS.v2.bondById(id));
  }

  async findByIsin(isin: string): Promise<BondV2 | undefined> {
    const list = await this.listBonds();
    return list.data.find((b) => b.isin === isin);
  }

  async subscribe(
    bondId: number,
    quantity: number,
    userId: string,
  ): Promise<{ response: APIResponse; body?: SubscriptionV2 }> {
    const payload: SubscribeRequest = { quantity };
    const response = await this.api.post(API_PATHS.v2.subscribe(bondId), {
      userId,
      data: payload,
    });
    let body: SubscriptionV2 | undefined;
    try {
      body = (await response.json()) as SubscriptionV2;
    } catch {
      body = undefined;
    }
    return { response, body };
  }

  async subscribeExpectSuccess(
    bondId: number,
    quantity: number,
    userId: string,
  ): Promise<SubscriptionV2> {
    const { response, body } = await this.subscribe(bondId, quantity, userId);
    if (!response.ok() || !body) {
      throw new Error(`V2 subscribe failed (${response.status()}): ${await response.text()}`);
    }
    return body;
  }
}
