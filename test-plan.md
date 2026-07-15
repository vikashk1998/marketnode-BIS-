# Test Plan — Bond Issuance System

## 1. Objectives

Validate that BIS behaves according to `PRODUCT.md` across SFTP ingestion, API v1/v2, UI, lifecycle transitions, and exact financial calculations.

## 2. Scope

| In scope | Out of scope |
|----------|--------------|
| Bond CSV upload via SFTP | Real authentication / SSO |
| Lifecycle PENDING→OPEN→CLOSED→ALLOCATED→MATURED | Performance/load beyond concurrency smoke |
| Subscriptions, duplicates, capacity races | Mobile browsers |
| Proportional allocation & rejection at zero | Visual design regression |
| Daily coupons (business days only) | Non-Chromium browsers in CI baseline |
| Maturity principal | |
| API v1 snake_case vs v2 camelCase | |
| UI marketplace / subscribe / portfolio / system | |
| Negative CSV validation | |

## 3. Strategy

### Risk-based priorities

1. **Money correctness** — coupon, allocation floor, maturity (exact decimal)
2. **Capacity integrity** — concurrent subscribe must not oversell
3. **Lifecycle correctness** — date-driven transitions
4. **Ingestion validation** — bad files must not silently create bonds
5. **Cross-layer consistency** — API ↔ UI ↔ portfolio

### Layers

| Layer | Approach |
|-------|----------|
| Pure finance | Unit-style tests on `FinancialUtility` / `DateUtility` |
| API | Playwright `APIRequestContext` via domain clients |
| UI | Three-layer POM + fixtures |
| Integration | `BondWorkflowService` (CSV→SFTP→wait→lifecycle) |
| E2E | Full worked-example path |

### Isolation

- Each test generates unique ISINs via `BondBuilder` / `RandomDataUtility`
- `./run-tests.sh` resets business date before the suite
- Workers set to 1 locally to avoid date-advance collisions (financial systems are date-global)

## 4. Environments

- Frontend `http://localhost:5173`
- Backend `http://localhost:8080`
- SFTP `localhost:2222` (`bonduser` / `bondpass`)
- Timezone: Asia/Kuala_Lumpur

## 5. Tooling

- Playwright Test + TypeScript
- `decimal.js` for money
- `ssh2-sftp-client` for uploads (volume copy fallback)
- HTML / JSON / JUnit reporters under `reports/`

## 6. Coverage Map

| PRODUCT.md section | Specs |
|--------------------|-------|
| §5 SFTP / CSV | `tests/api/bond-upload.spec.ts`, `tests/negative/negative-upload.spec.ts` |
| §6 Subscriptions | `tests/api/subscription.spec.ts`, negative + concurrency |
| §7 Allocation | `tests/financial/allocation.spec.ts` |
| §8 Coupons | `tests/financial/coupon.spec.ts` |
| §9 Maturity | `tests/financial/maturity.spec.ts` |
| §9A Worked example | `tests/e2e/lifecycle.spec.ts`, financial unit checks |
| §11 API v1/v2 | `tests/api/api-v1-v2.spec.ts` |
| §12 Business date | `tests/api/system-date.spec.ts` |
| UI | `tests/ui/marketplace-subscribe.spec.ts` |

## 7. Trade-offs

- **Serial execution** preferred over aggressive parallelism because business date is process-global.
- Negative upload tests use a bounded poll wait after upload because the system does not expose a file-reject API.
- UI coverage focuses on critical investor journeys rather than exhaustive table column assertions.
- Chromium-only project keeps the assessment runnable within the expected effort window; the POM is browser-agnostic.

## 8. Entry / Exit

**Entry:** `docker compose up -d`, backend `/api/system/date` reachable, frontend HTTP 200.

**Exit:** `./run-tests.sh` completes; HTML report generated; defects logged in `defects.md`.
