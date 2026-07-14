import { expect, Locator, Page } from '@playwright/test';
import { FinancialUtility } from './FinancialUtility';
import { Logger } from './Logger';

/**
 * Shared assertion primitives used by domain assertion classes.
 */
export class AssertionUtility {
  private readonly logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger ?? new Logger('AssertionUtility');
  }

  async assertVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
  }

  async assertText(locator: Locator, expected: string | RegExp, message?: string): Promise<void> {
    await expect(locator, message).toContainText(expected);
  }

  assertEqual<T>(actual: T, expected: T, message?: string): void {
    expect(actual, message).toBe(expected);
  }

  assertTrue(condition: boolean, message?: string): void {
    expect(condition, message).toBeTruthy();
  }

  assertMoneyEquals(
    actual: number | string,
    expected: number | string,
    message = 'Monetary values must match exactly',
  ): void {
    const ok = FinancialUtility.equals(actual, expected);
    if (!ok) {
      this.logger.failure(message, { actual, expected });
    }
    expect(FinancialUtility.formatMoney(actual), message).toBe(
      FinancialUtility.formatMoney(expected),
    );
  }

  assertStatusCode(actual: number, expected: number): void {
    expect(actual).toBe(expected);
  }

  async assertPageTitle(page: Page, title: string | RegExp): Promise<void> {
    await expect(page).toHaveTitle(title);
  }
}
