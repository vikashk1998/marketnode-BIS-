import { Page, Locator } from '@playwright/test';
import { NavigationLocators } from './navigation-locators';

export class CouponHistoryLocators extends NavigationLocators {
  constructor(page: Page) {
    super(page);
  }

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Coupon History', level: 1 });
  }

  get emptyState(): Locator {
    return this.page.getByText(/No coupon/i);
  }

  get couponsTable(): Locator {
    return this.page.locator('table');
  }

  getRowByBondName(bondName: string): Locator {
    return this.page.locator('tr', { hasText: bondName });
  }
}
