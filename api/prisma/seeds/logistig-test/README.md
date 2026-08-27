# Logistics UI development seed

This development-only seed destructively replaces the local catalog and logistics reference data. Run it only against the guarded local database:

```bash
cd api
npm run seed:logistig-test
```

The seed creates one Yandex provider, one CDEK provider, three warehouses, and deterministic provider configurations. Every CDEK warehouse uses private metadata `{ "originMode": "DOOR" }`; no credentials or real office codes are stored. `YANDEX_RUSSIA_PICKUP` and inactive `CDEK_PICKUP` have no product mappings.

## Products

| Product | Slug                              | Warehouse      | Services                                   |
| ------- | --------------------------------- | -------------- | ------------------------------------------ |
| 1       | `logistics-ui-service-ab`         | Origin A       | Yandex Express, Yandex Cargo, CDEK Courier |
| 2       | `logistics-ui-service-b`          | Origin A       | Yandex Cargo                               |
| 3       | `logistics-ui-service-c`          | Origin A       | CDEK Courier only                          |
| 4       | `logistics-ui-origin-b-cargo`     | Origin B       | Yandex Cargo, CDEK Courier                 |
| 5       | `logistics-ui-origin-clone-cargo` | Origin A Clone | Yandex Cargo, CDEK Courier                 |
| 6       | `logistics-ui-oversized`          | Origin A       | manual KGT only                            |
| 7       | `logistics-ui-unavailable`        | Origin A       | none                                       |

## Manual scenarios

All scenarios are deterministic in `CDEK_DELIVERY_MODE=mock`. The same quote-only routes can be smoke-tested against the educational contour after configuring official shared test credentials.

1. **CDEK only:** Product 3. Expect two deterministic courier tariff variants and no technical identifiers.
2. **Provider choice:** Product 1. Expect Yandex and CDEK alternatives; selection survives reload.
3. **Provider intersection:** Products 1 + 3. The common capability is `CDEK_COURIER`.
4. **Preserved Yandex A/B intersection:** Products 1 + 2. `{EXPRESS, CARGO, CDEK} ∩ {CARGO} = {CARGO}`.
5. **Multipart mixed-provider:** Products 2 + 3. Expect one Yandex part and one CDEK part behind one plan selection.
6. **Provider fallback:** Product 1 with destination city `__cdek_unavailable__` in an automated test; valid Yandex quotes remain.
7. **CDEK with different warehouses:** Products 3 + 4 (or 3 + 5). Expect separate internal groups and hidden warehouse identity.
8. **Same service, different physical origins:** Products 4 + 5.
9. **Mixed CDEK + KGT:** Products 3 + 6. Expect universal delivery plus separate manual KGT calculation, with no double counting.
10. **KGT only:** Product 6. Expect only the manual oversized flow.
11. **Unavailable ordinary:** Product 7. Expect no ready plan and blocked payment.
12. **Destination invalidation:** select a CDEK-containing plan, change the destination, and verify quotes and selection are invalidated.
13. **Reopen:** select a CDEK-containing plan, reload checkout, then reopen the Order from the profile; the selected public plan should be restored.

The seed applies a deterministic 100 RUB provider markup per technical group. It never invokes OAuth, calculators, booking, orders, Shipments, payments, or external APIs.
