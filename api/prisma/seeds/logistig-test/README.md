# Logistics UI development seed

This development-only seed destructively replaces the local catalog and logistics reference data. Run it only against the guarded local database:

```bash
cd api
npm run seed:logistig-test
```

All products are in the `Logistics UI Test` category (`logistics-ui-test`). `YANDEX_RUSSIA_PICKUP` is retained as reference data but deliberately has no product mapping.

## Products

| Product                      | Slug                              | Warehouse      | Services        |
| ---------------------------- | --------------------------------- | -------------- | --------------- |
| 1 — Express or Cargo         | `logistics-ui-service-ab`         | Origin A       | Express, Cargo  |
| 2 — Cargo only               | `logistics-ui-service-b`          | Origin A       | Cargo           |
| 3 — Russia Door only         | `logistics-ui-service-c`          | Origin A       | Russia Door     |
| 4 — Cargo, physical origin B | `logistics-ui-origin-b-cargo`     | Origin B       | Cargo           |
| 5 — Cargo, logical A clone   | `logistics-ui-origin-clone-cargo` | Origin A Clone | Cargo           |
| 6 — oversized/KGT            | `logistics-ui-oversized`          | Origin A       | manual KGT only |
| 7 — unavailable ordinary     | `logistics-ui-unavailable`        | Origin A       | none            |

## Manual scenarios

1. **Single ordinary part:** Product 1. Expect one plan and one public part, without a redundant “Shipment 1” label.
2. **Service intersection:** Products 1 + 2. `{EXPRESS, CARGO} ∩ {CARGO} = {CARGO}`; expect one technical group.
3. **Incompatible services in one warehouse:** Products 1 + 2 + 3. Expect Cargo and Russia Door groups in one public plan with two parts.
4. **Same provider/service, different physical origins:** Products 2 + 4. Expect two internal groups and two public parts, with no warehouse information.
5. **Identical physical settings, different warehouse IDs:** Products 2 + 5. Expect two groups under the current resolver, with the distinction hidden publicly.
6. **KGT only:** Product 6. Expect only the manual oversized flow and no universal widget.
7. **Mixed ordinary + KGT:** Products 1 + 6. Expect separate automated and oversized sections and combined pricing without double counting.
8. **Primary full scenario:** Products 1 + 2 + 3 + 4 + 5 + 6. Expect four ordinary technical parts behind one plan selection plus separate KGT calculation.
9. **Unavailable item:** Product 7. Expect `DELIVERY_SERVICE_MISSING`, no ready plan, and blocked payment.
10. **Mixed unavailable:** Products 1 + 7. Both products remain visible; the valid calculation is retained while payment remains blocked.

## Stateful checks

- **Plan selection and reload:** select a plan, reload checkout, then reopen it from the profile order card. The selected order-level plan should be restored.
- **Guest restore:** place the order while signed out, reload with the same browser session, and verify that the checkout state is restored. Do not hard-code or share guest session identifiers.
- **Destination invalidation:** select a plan, change the destination, and verify that the prior selection and quotes are invalidated before recalculation.
- **Expiry/recalculation:** allow the mock quote TTL to elapse (or temporarily use a short local TTL), then reload and verify recalculation and reselection behavior.
- **Profile order details:** complete an authenticated checkout and verify that delivery is projected as public parts without warehouse IDs, warehouse names, group keys, or quote IDs.

The primary scenario partitions internally as follows:

1. Products 1 + 2, Origin A, Cargo.
2. Product 3, Origin A, Russia Door.
3. Product 4, Origin B, Cargo.
4. Product 5, Origin A Clone, Cargo.

The seed sets a deterministic Yandex fixed markup of 100 RUB per technical group. The unavailable product must not be combined with the primary successful scenario because it intentionally prevents delivery readiness.
