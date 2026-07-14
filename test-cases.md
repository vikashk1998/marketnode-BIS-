# Test Cases — Bond Issuance System

Priority legend: **H** = high (money / integrity), **M** = medium, **L** = low.

| ID | Title | Scenario | Expected | Priority | Spec |
|----|-------|----------|----------|----------|------|
| TC-SYS-01 | Get business date | Call GET `/api/system/date` | ISO `YYYY-MM-DD` returned | H | system-date.spec.ts |
| TC-SYS-02 | Advance date | POST advance-date | Date +1 day; lifecycle message | H | system-date.spec.ts |
| TC-SYS-03 | Reset date | Advance then reset | Business date = calendar today | M | system-date.spec.ts |
| TC-SYS-04 | UI system controls | Open System page; advance | UI date matches API after advance | M | system-date.spec.ts |
| TC-UPL-01 | Valid CSV upload | Upload valid bond CSV via SFTP | Bond appears in API list | H | bond-upload.spec.ts |
| TC-UPL-02 | Multi-row CSV | Upload file with 2 rows | Two distinct ISINs created | M | bond-upload.spec.ts |
| TC-UPL-03 | PENDING→OPEN | Upload future-open bond; advance to open | Status becomes OPEN | H | bond-upload.spec.ts |
| TC-UPL-04 | Duplicate filename | Re-upload same file name | No duplicate bond set | M | bond-upload.spec.ts |
| TC-NEG-01 | Invalid header | Upload wrong header row | No bond created for content | H | negative-upload.spec.ts |
| TC-NEG-02 | Malformed row | Incomplete CSV row | No bond created | H | negative-upload.spec.ts |
| TC-NEG-03 | Negative face value | faceValue < 0 | Rejected / no bond | H | negative-upload.spec.ts |
| TC-NEG-04 | Invalid currency | Non-ISO currency | Rejected / no bond | M | negative-upload.spec.ts |
| TC-NEG-05 | Invalid date format | Non-YYYY-MM-DD | Rejected / no bond | M | negative-upload.spec.ts |
| TC-NEG-06 | Zero size/value | totalSize=0, faceValue=0 | Rejected / no bond | M | negative-upload.spec.ts |
| TC-NEG-07 | Coupon rate out of range | couponRate ≥ 1 | Rejected / no bond | M | negative-upload.spec.ts |
| TC-NEG-08 | Duplicate ISIN in file | Two rows same ISIN | At most one bond for ISIN | H | negative-upload.spec.ts |
| TC-SUB-01 | Subscribe OPEN bond | v1 subscribe while OPEN | PENDING subscription; portfolio row | H | subscription.spec.ts |
| TC-SUB-02 | Multi-investor subscribe | Three investors subscribe | All accepted; count ≥ 3 | H | subscription.spec.ts |
| TC-SUB-03 | Available size tracking | Subscribe qty Q | available_size decreases by Q | H | subscription.spec.ts |
| TC-SUB-04 | Subscribe while PENDING | Subscribe before open | Rejected | H | negative-upload.spec.ts |
| TC-SUB-05 | Duplicate investor | Same investor twice | Second rejected | H | negative-upload.spec.ts |
| TC-SUB-06 | Zero quantity | quantity=0 | Rejected | H | negative-upload.spec.ts |
| TC-SUB-07 | Subscribe after close | After book closed | Rejected | H | negative-upload.spec.ts |
| TC-CON-01 | Concurrent oversubscribe | 5 parallel subs oversize | Accepted qty ≤ totalSize | H | concurrency.spec.ts |
| TC-ALL-01 | Undersubscribed allocation | Subs total ≤ size | Full quantities allocated | H | allocation.spec.ts |
| TC-ALL-02 | Oversubscribe proportional | Worked example ratios | floor allocations 33333/25000/41666 | H | allocation.spec.ts |
| TC-ALL-03 | Zero floor rejection | Tiny qty vs huge competing | Status REJECTED, alloc=0 | M | allocation.spec.ts |
| TC-CPN-01 | Daily coupon formula | Allocate 100 @ 1000×0.0005 | Daily amount 50.00 | H | coupon.spec.ts |
| TC-CPN-02 | Weekend skip | Advance across weekend | No Sat/Sun payment dates | H | coupon.spec.ts |
| TC-CPN-03 | Coupons until maturity | Advance to maturity | Payments on business days ≤ maturity | H | coupon.spec.ts |
| TC-MAT-01 | Principal return | Mature allocated bond | principal = face×alloc; status MATURED | H | maturity.spec.ts |
| TC-API-01 | v1 vs v2 shape | Compare same bond | snake_case flat vs camelCase nested | H | api-v1-v2.spec.ts |
| TC-API-02 | v2 subscribe → v1 portfolio | Subscribe via v2 | Visible in v1 portfolio | H | api-v1-v2.spec.ts |
| TC-API-03 | v2 portfolio wrapper | GET v2 portfolio | `{ data, total }` shape | M | api-v1-v2.spec.ts |
| TC-API-04 | Portfolio endpoints | After subscribe | Arrays for portfolio/coupons/maturities | M | portfolio.spec.ts |
| TC-FIN-01 | Float safety | 0.1+0.2 via Decimal | Equals 0.3 exactly | H | financial-calculation.spec.ts |
| TC-FIN-02 | Worked example math | PRODUCT.md numbers | Coupons & allocations match | H | api-v1-v2.spec.ts |
| TC-FIN-03 | Business day count | 2026-06-11…25 | 11 business days | M | financial-calculation.spec.ts |
| TC-UI-01 | Marketplace shows bond | Upload OPEN bond | ISIN visible in UI | H | marketplace-subscribe.spec.ts |
| TC-UI-02 | UI subscribe | Subscribe page flow | Success + API portfolio | H | marketplace-subscribe.spec.ts |
| TC-UI-03 | User switcher | Select every INV-001…INV-005 | Combobox value matches each id | H | marketplace-subscribe.spec.ts |
| TC-UI-04 | Portfolio UI | API subscribe then open UI | Row shows quantity | M | marketplace-subscribe.spec.ts |
| TC-E2E-01 | Full lifecycle | Upload→subscribe→alloc→coupon→mature | All financial checkpoints pass | H | lifecycle.spec.ts |
| TC-USR-01 | Investor catalog | Validate predefined users | Exactly 5 investors INV-001…005 | H | investors-coverage.spec.ts |
| TC-USR-02 | All users subscribe API | Each investor subscribes to one bond | 5 PENDING portfolios, isolated | H | investors-coverage.spec.ts |
| TC-USR-03 | Portfolio isolation | Each user sees only own row | Cross-user quantities absent | H | investors-coverage.spec.ts |
| TC-USR-04 | All users allocation | 5 equal under-subscribes | Each ALLOCATED for 5000 | H | investors-coverage.spec.ts |
| TC-USR-05 | UI switcher all users | Options + select each investor | All 5 labels and values work | H | all-investors.spec.ts |
| TC-USR-06 | UI subscribe all users | Each investor subscribes via UI | API + portfolio row per user | H | all-investors.spec.ts |
