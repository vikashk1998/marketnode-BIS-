import { APIRequestContext } from '@playwright/test';
import { BondApi } from './BondApi';
import { BondApiV2 } from './BondApiV2';
import { PortfolioApi } from './PortfolioApi';
import { SystemApi } from './SystemApi';
import { Logger } from '../../utilities/Logger';

/**
 * Facade aggregating all domain API clients for fixture injection.
 */
export class ApiClientFacade {
  readonly system: SystemApi;
  readonly bonds: BondApi;
  readonly bondsV2: BondApiV2;
  readonly portfolio: PortfolioApi;

  constructor(request: APIRequestContext, logger?: Logger) {
    const log = logger ?? new Logger('ApiClientFacade');
    this.system = new SystemApi(request, log);
    this.bonds = new BondApi(request, log);
    this.bondsV2 = new BondApiV2(request, log);
    this.portfolio = new PortfolioApi(request, log);
  }
}
