import { Page } from '@playwright/test';
import { MarketplacePage } from '../pages/marketplace-page';
import { SubscribePage } from '../pages/subscribe-page';
import { PortfolioPage } from '../pages/portfolio-page';
import { CouponHistoryPage } from '../pages/coupon-history-page';
import { PayoutHistoryPage } from '../pages/payout-history-page';
import { SystemPage } from '../pages/system-page';
import { BondDetailPage } from '../pages/bond-detail-page';
import { TestUtility } from '../../utilities/TestUtility';

/**
 * Layer 3 — PageManager with lazy initialization only.
 * Tests MUST obtain pages exclusively through this manager.
 */
export class PageManager {
  private readonly page: Page;
  private readonly testUtility: TestUtility;

  private marketplacePage?: MarketplacePage;
  private subscribePage?: SubscribePage;
  private portfolioPage?: PortfolioPage;
  private couponHistoryPage?: CouponHistoryPage;
  private payoutHistoryPage?: PayoutHistoryPage;
  private systemPage?: SystemPage;
  private bondDetailPage?: BondDetailPage;

  constructor(page: Page, testUtility?: TestUtility) {
    this.page = page;
    this.testUtility = testUtility ?? new TestUtility(page);
  }

  onMarketplacePage(): MarketplacePage {
    this.marketplacePage ??= new MarketplacePage(this.page, this, this.testUtility);
    return this.marketplacePage;
  }

  onSubscribePage(): SubscribePage {
    this.subscribePage ??= new SubscribePage(this.page, this, this.testUtility);
    return this.subscribePage;
  }

  onPortfolioPage(): PortfolioPage {
    this.portfolioPage ??= new PortfolioPage(this.page, this, this.testUtility);
    return this.portfolioPage;
  }

  onCouponHistoryPage(): CouponHistoryPage {
    this.couponHistoryPage ??= new CouponHistoryPage(this.page, this, this.testUtility);
    return this.couponHistoryPage;
  }

  onPayoutHistoryPage(): PayoutHistoryPage {
    this.payoutHistoryPage ??= new PayoutHistoryPage(this.page, this, this.testUtility);
    return this.payoutHistoryPage;
  }

  onSystemPage(): SystemPage {
    this.systemPage ??= new SystemPage(this.page, this, this.testUtility);
    return this.systemPage;
  }

  onBondDetailPage(): BondDetailPage {
    this.bondDetailPage ??= new BondDetailPage(this.page, this, this.testUtility);
    return this.bondDetailPage;
  }

  getPage(): Page {
    return this.page;
  }

  getTestUtility(): TestUtility {
    return this.testUtility;
  }
}
