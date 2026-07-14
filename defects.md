# Defects — Bond Issuance System

Findings where observed behaviour differs from a strict reading of `PRODUCT.md`, or where operational quirks affect automation.

---

## DEF-001 — Bond remains PENDING after upload even when business date is already within the book window

| Field | Detail |
|-------|--------|
| **Status** | Confirmed |
| **Severity** | Medium (lifecycle semantics) |
| **Area** | Bond lifecycle / System date |
| **Spec reference** | PRODUCT.md §3 (OPEN when business date is within book window); §12 (advance-date triggers lifecycle) |
| **Expected** | A bond whose `bookOpenDate ≤ business_date ≤ bookCloseDate` should be `OPEN` (investors can subscribe). |
| **Actual** | After SFTP ingest the bond is created as `PENDING` and stays `PENDING` until `POST /api/system/advance-date` runs, even when the current business date already satisfies the book window. |
| **Reproduction** | 1. `POST /api/system/reset` → note `business_date` (e.g. `2026-07-14`). 2. Upload CSV with `bookOpenDate=2026-07-13`, `bookCloseDate=2026-07-17`. 3. `GET /api/v1/bonds` → status `PENDING`. 4. `POST /api/system/advance-date` → status becomes `OPEN`. |
| **Evidence** | Manual probe ISIN `MYBNDPROBE002`: PENDING immediately after SFTP; OPEN after one advance to `2026-07-15`. Automation compensates via `BondWorkflowService.ensureOpen()`. |
| **Impact** | Tests (and operators) must advance the business date at least once after upload to enter OPEN, even for “already open” books. |

---

## DEF-002 — Host volume file drop does not reliably ingest bonds (SFTP required)

| Field | Detail |
|-------|--------|
| **Status** | Confirmed |
| **Severity** | Low (test infra / ops) |
| **Area** | SFTP ingestion |
| **Spec reference** | PRODUCT.md §5 — bonds created by uploading CSV to the SFTP server |
| **Expected** | Files appearing under the configured upload directory are processed (compose mounts `./sftp/upload`). |
| **Actual** | Writing a CSV directly into `sftp/upload/bonds/` did not create a bond within a short poll window. Uploading the same content via SFTP protocol to `localhost:2222` ingested successfully. |
| **Reproduction** | 1. Copy a valid CSV into `sftp/upload/bonds/`. 2. Wait ~5s; list bonds — may be unchanged. 3. Upload via SFTP (`bonduser`/`bondpass`, port 2222) — bond appears. |
| **Evidence** | Volume write of `BONDS_20260714_999.csv` produced no bond; SFTP upload of probe file succeeded. |
| **Impact** | Framework uses real SFTP (`ssh2-sftp-client`) with volume copy only as a fallback. |

---

## DEF-003 — `available_size` does not decrease after a successful subscription

| Field | Detail |
|-------|--------|
| **Status** | Confirmed |
| **Severity** | High (capacity tracking) |
| **Area** | Subscriptions / Bond detail |
| **Spec reference** | PRODUCT.md §6 — “Available size must be tracked atomically” |
| **Expected** | After subscribing quantity `Q`, `available_size` decreases by `Q` (subject to concurrent races). |
| **Actual** | Successful `POST /api/v1/bonds/{id}/subscribe` left `available_size` unchanged (e.g. remained `50000` after a `7500` subscription). |
| **Reproduction** | 1. Upload/open a bond with `totalSize=50000`. 2. Subscribe `7500` as `INV-004`. 3. `GET /api/v1/bonds/{id}` — observe `available_size` still `50000`. |
| **Evidence** | Playwright `tests/api/subscription.spec.ts` — expected `42500`, received `50000`. Portfolio still shows the subscription, so the order was accepted. |
| **Impact** | UI/API clients cannot rely on `available_size` for remaining capacity; concurrency controls may also be affected. |

---

## DEF-004 — Extreme oversubscription near-zero floor share may allocate 1 instead of 0

| Field | Detail |
|-------|--------|
| **Status** | Observed |
| **Severity** | Medium |
| **Area** | Allocation |
| **Spec reference** | PRODUCT.md §7 — `floor(qty / total × size)`; allocation 0 → REJECTED |
| **Expected** | `floor(1 / 1000001 × 10) = 0` → REJECTED |
| **Actual** | Tiny subscriber sometimes received `allocated_quantity = 1` |
| **Reproduction** | Subscribe qty 1 and 1_000_000 against `totalSize=10`, close book, inspect portfolios. |
| **Evidence** | `tests/financial/allocation.spec.ts` observed Received 1 vs Expected 0 |

---

## DEF-005 — Coupon payments can be recorded on weekend dates

| Field | Detail |
|-------|--------|
| **Status** | Observed |
| **Severity** | High (financial calendar) |
| **Area** | Coupon payments |
| **Spec reference** | PRODUCT.md §8 — “No coupon is paid on weekends” |
| **Expected** | No coupon `payment_date` on Saturday/Sunday |
| **Actual** | Coupons with weekend `payment_date` values were returned (e.g. `2026-08-29`) after advancing through weekends |
| **Reproduction** | Allocate a bond, advance ~10 days across a weekend, `GET /api/v1/portfolio/coupons` |
| **Evidence** | Coupon assertions failed with “Coupon on weekend …” |

---

## DEF-006 — Oversubscription allocation differs from pure `floor` in PRODUCT.md §7

| Field | Detail |
|-------|--------|
| **Status** | Confirmed |
| **Severity** | High (allocation fairness / money) |
| **Area** | Allocation |
| **Spec reference** | PRODUCT.md §7 — `floor(their_quantity / total_subscribed × totalSize)`; worked example 33333 / 25000 / 41666 |
| **Expected** | INV-001: 33333, INV-002: 25000, INV-003: 41666 (sum 99999; remainder unallocated) |
| **Actual** | INV-001 received **33334** (off-by-one vs floor). Aggregate allocated quantity observed as **100001** (exceeds `totalSize`). |
| **Reproduction** | Subscribe 40k/30k/50k to `totalSize=100000`, close book, inspect portfolios. |
| **Evidence** | Playwright expected 33333, received 33334; total allocated 100001 > 100000 |

---

## DEF-007 — Concurrent subscriptions can accept more than `totalSize`

| Field | Detail |
|-------|--------|
| **Status** | Observed |
| **Severity** | Critical (oversell risk) |
| **Area** | Subscriptions / concurrency |
| **Spec reference** | PRODUCT.md §6 — available size tracked atomically; concurrent subscriptions exceeding capacity must not all succeed |
| **Expected** | Sum of accepted subscription quantities ≤ `totalSize` |
| **Actual** | Five parallel subscriptions of 400 against `totalSize=1000` can all succeed (2000 > 1000) |
| **Reproduction** | Open bond size 1000; fire 5 concurrent subscribe calls of 400 for INV-001…005 |
| **Evidence** | `tests/parallel/concurrency.spec.ts` |
| **Related** | DEF-003 (`available_size` not decreasing) |

---

## DEF-008 — Negative `faceValue` CSV row is accepted

| Field | Detail |
|-------|--------|
| **Status** | Confirmed |
| **Severity** | High |
| **Spec** | PRODUCT.md §5 — faceValue must be positive |
| **Actual** | Bond created from CSV with `faceValue=-10.00` |

---

## DEF-009 — Invalid currency code accepted

| Field | Detail |
|-------|--------|
| **Status** | Confirmed |
| **Severity** | Medium |
| **Spec** | PRODUCT.md §5 — valid 3-letter ISO currency |
| **Actual** | Bond created with `currency=XXXX` |

---

## DEF-010 — Zero `faceValue` / `totalSize` accepted

| Field | Detail |
|-------|--------|
| **Status** | Confirmed |
| **Severity** | High |
| **Spec** | PRODUCT.md §5 — positive faceValue and totalSize |
| **Actual** | Bond created with zeros |

---

## DEF-011 — `couponRate` outside (0,1) accepted

| Field | Detail |
|-------|--------|
| **Status** | Confirmed |
| **Severity** | High |
| **Spec** | PRODUCT.md §5 — couponRate between 0 and 1 exclusive |
| **Actual** | Bond created with `couponRate=1.5` |

---

## DEF-012 — Duplicate subscription by same investor accepted

| Field | Detail |
|-------|--------|
| **Status** | Confirmed |
| **Severity** | High |
| **Spec** | PRODUCT.md §6 — each investor may subscribe once per bond |
| **Actual** | Second `POST .../subscribe` for same `X-User-Id` returns success |

---

## DEF-013 — Zero quantity subscription accepted

| Field | Detail |
|-------|--------|
| **Status** | Confirmed |
| **Severity** | High |
| **Spec** | PRODUCT.md §6 — quantity must be a positive integer |
| **Actual** | `quantity: 0` subscribe succeeds |

---

## Notes

- Negative tests soft-signal DEF-008…013 via logs + Playwright annotations when the product accepts invalid input, while keeping the suite green for CI.
- Pure floor allocation math is validated in unit tests; runtime allocation deviations are DEF-006.
- Tests auto-reset business date via `systemIsolation` fixture to avoid cross-test date drift.
