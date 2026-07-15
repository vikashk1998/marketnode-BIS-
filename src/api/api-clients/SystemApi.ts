import { APIRequestContext, APIResponse } from '@playwright/test';
import { API_PATHS } from '../../constants';
import { BusinessDateResponse } from '../../types/domain';
import { ApiUtility } from '../../utilities/ApiUtility';
import { Logger } from '../../utilities/Logger';
import { DateUtility } from '../../utilities/DateUtility';
import { frameworkConfig } from '../../config/framework-config';
import { RetryUtility } from '../../utilities/RetryUtility';

/**
 * System control API — business date, advance, reset.
 */
export class SystemApi {
  private readonly api: ApiUtility;
  private readonly logger: Logger;
  private readonly retry: RetryUtility;

  constructor(request: APIRequestContext, logger?: Logger) {
    this.logger = logger ?? new Logger('SystemApi');
    this.api = new ApiUtility(request, this.logger);
    this.retry = new RetryUtility(this.logger);
  }

  async getBusinessDate(): Promise<string> {
    const body = await this.api.getJson<BusinessDateResponse>(API_PATHS.system.date);
    this.logger.businessDate(body.business_date);
    return body.business_date;
  }

  async advanceDate(): Promise<BusinessDateResponse> {
    const body = await this.api.postJson<BusinessDateResponse>(API_PATHS.system.advanceDate);
    this.logger.businessDate(body.business_date);
    return body;
  }

  async reset(): Promise<BusinessDateResponse> {
    const body = await this.api.postJson<BusinessDateResponse>(API_PATHS.system.reset);
    this.logger.cleanup(`System reset → ${body.business_date}`);
    return body;
  }

  /**
   * Advances the business date until targetDate (inclusive of all intervening days).
   */
  async advanceTo(targetDate: string): Promise<string> {
    let current = await this.getBusinessDate();
    let guard = 0;
    while (DateUtility.compare(current, targetDate) < 0) {
      const result = await this.advanceDate();
      current = result.business_date;
      guard += 1;
      if (guard > 400) {
        throw new Error(`advanceTo exceeded safety limit; stuck at ${current}, target ${targetDate}`);
      }
    }
    return current;
  }

  /**
   * Advances exactly N calendar days.
   */
  async advanceByDays(days: number): Promise<string> {
    let current = await this.getBusinessDate();
    for (let i = 0; i < days; i += 1) {
      const result = await this.advanceDate();
      current = result.business_date;
    }
    return current;
  }

  async waitUntilBusinessDate(expected: string): Promise<string> {
    return this.retry.until(
      async () => {
        const date = await this.getBusinessDate();
        return date === expected ? date : null;
      },
      {
        timeoutMs: frameworkConfig.timeouts.api,
        description: `business date = ${expected}`,
      },
    );
  }
}
