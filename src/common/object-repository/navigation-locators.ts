import { Page, Locator } from '@playwright/test';

/**
 * Layer 1 — Object Repository: locators only. No waits, assertions, or business logic.
 * Locators are exposed as getters so `page` is always initialized first.
 */
export class NavigationLocators {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get brandHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Bond Issuance', level: 2 });
  }

  get marketplaceNav(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'Bond Marketplace' });
  }

  get subscribeNav(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: /^Subscribe$/ });
  }

  get portfolioNav(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'My Portfolio' });
  }

  get couponHistoryNav(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'Coupon History' });
  }

  get payoutHistoryNav(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'Payout History' });
  }

  get systemNav(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'System' });
  }

  get userSwitcher(): Locator {
    return this.page.getByTestId('user-switcher');
  }
}
