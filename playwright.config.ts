import { defineConfig, devices } from '@playwright/test';
import { frameworkConfig } from './src/config/framework-config';

/**
 * Enterprise Playwright configuration for the Bond Issuance System.
 * Reports, artifacts, and retries are tuned for CI and local reliability.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 1,
  timeout: frameworkConfig.timeouts.test,
  expect: {
    timeout: frameworkConfig.timeouts.expect,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  outputDir: 'reports/test-results',
  use: {
    baseURL: frameworkConfig.urls.frontend,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: frameworkConfig.timeouts.action,
    navigationTimeout: frameworkConfig.timeouts.navigation,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
