# Bond Issuance System — Automation Framework

Enterprise Playwright + TypeScript automation suite for the Bond Issuance System (BIS).

## Quick Start

```bash
# 1. Authenticate to the private registry (one-time)
docker login -u candidate -p ArnUqRw8VSj4xPnxLYDdjxcwVUAM4zHi9abxUJSbS3BjE05QQkVoJQQJ99CFACqBBLyEqg7NAAABAZCRAJpR interviewmarketnode.azurecr.io

# 2. Start the application stack
docker compose up -d

# 3. Verify
open http://localhost:5173
open http://localhost:8080/swagger-ui.html

# 4. Run the full suite (installs deps/browsers if needed)
./run-tests.sh
```

Reports are written to `reports/html/index.html`.

## GitHub Actions (CI)

The suite is GitHub-deployable via [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

### One-time setup

1. Push this repo to GitHub.
2. Add Actions secrets (see [`.github/SECRETS.md`](./.github/SECRETS.md)):
   - `ACR_USERNAME` — registry username (e.g. `candidate`)
   - `ACR_PASSWORD` — registry password/token from `TASKS.md`
3. Enable **Actions** on the repository.

### What happens on push / PR

GitHub runners will:

1. Authenticate to `interviewmarketnode.azurecr.io`
2. Start `docker compose` (postgres, sftp, backend, frontend)
3. Install dependencies + Playwright Chromium
4. Run `./run-tests.sh`
5. Upload HTML / JUnit / JSON reports as workflow artifacts

You can also trigger **Actions → BIS Automation CI → Run workflow** and optionally pass a Playwright `--grep` filter (e.g. `@smoke`).

### Download reports from CI

Open the workflow run → **Artifacts** → `playwright-html-report` / `playwright-results`.

## Architecture

See [Architecture.md](./Architecture.md) for the three-layer Page Object Model, API clients, fixtures, and directory map.

### Three-Layer POM (mandatory)

| Layer | Location | Responsibility |
|-------|----------|----------------|
| 1 — Object Repository | `src/common/object-repository/*-locators.ts` | Locators only |
| 2 — Page Classes | `src/common/pages/*-page.ts` | Business actions + sync |
| 3 — PageManager | `src/common/object-repository/page-manager.ts` | Lazy page access |

Tests never instantiate pages. They use `pageManager.onMarketplacePage()` etc.

### Fixtures

`src/fixtures/global-test-options.ts` injects:

- `pageManager`, `api` (Bond/System/Portfolio v1+v2), `bondWorkflow`
- `csvUtility`, `sftpUtility`, builders/assertions helpers
- `businessDate`, structured `logger`

## Project Layout

```
src/
  api/api-clients/          Domain API clients
  api/api-validators/       Response shape validators
  assertions/               Reusable domain assertions
  builders/                 Bond / CSV / Subscription / Investor builders
  common/object-repository/ Layer 1 locators + PageManager
  common/pages/             Layer 2 page classes
  config/                   Framework configuration
  constants/ enums/ types/  Shared contracts
  factories/                BondWorkflowService orchestration
  fixtures/                 Playwright fixtures
  utilities/                Sync, CSV, SFTP, finance, logging, …
tests/
  api/ ui/ e2e/ financial/ negative/ parallel/
reports/                    HTML / JSON / JUnit / logs
```

## Coding Standards

- Strict TypeScript — no `any`
- No `waitForTimeout` for readiness — use response/URL/locator waits
- Enums + interfaces for domain vocabulary
- Exact decimal math via `decimal.js` (`FinancialUtility`)
- Independent test data via builders (unique ISINs)

## Useful Commands

```bash
npx playwright test                       # full suite
npx playwright test --grep @smoke         # smoke only
npx playwright test tests/api             # API layer
npx playwright test tests/financial       # allocation/coupon/maturity
npx playwright show-report reports/html   # open HTML report
```

## Deliverables (TASKS.md)

| File | Purpose |
|------|---------|
| `run-tests.sh` | Single entry point |
| `test-plan.md` | Strategy & coverage |
| `test-cases.md` | Case catalogue with priorities |
| `defects.md` | Spec vs behaviour findings |
| `README.md` | This file |
| `ai-prompt.log` | AI interaction log |
| `Architecture.md` | Framework design |

## Environment Overrides

| Variable | Default |
|----------|---------|
| `BIS_FRONTEND_URL` | `http://localhost:5173` |
| `BIS_BACKEND_URL` | `http://localhost:8080` |
| `BIS_SFTP_HOST` | `localhost` |
| `BIS_SFTP_PORT` | `2222` |
| `BIS_LOG_CONSOLE` | unset (quiet console) — set `1` for full console logs |
| `BIS_LOG_CONSOLE_LEVEL` | `WARN` — console threshold: `DEBUG` / `INFO` / `WARN` / `ERROR` |

Framework logs are always written to `reports/logs/`. Console is quiet by default (WARN/ERROR only).
