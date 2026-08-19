# Yandex Delivery environments

## Cargo billing price

The Cargo `offers/calculate` response exposes `price` as a structured object.
DNA uses `price.total_price_with_vat` as the billing price and rounds it up to a
whole ruble for `DeliveryQuote.providerCost`. It deliberately does not fall back
to `total_price` or `base_price`, because those values may understate the amount
actually billed by Yandex and therefore consume the configured margin.

The saved quote provider payload records `basePrice`, `totalPrice`,
`totalPriceWithVat`, `surgeRatio`, `currency`, `billingPriceField`, the selected
`billingPrice`, and `roundedBillingPrice` separately for billing auditability.

The integration is quote-only. It never creates, confirms, accepts or cancels a
provider order. `YANDEX_DELIVERY_LIVE_MUTATIONS_ENABLED` must remain `false` for
this stage. Tokens are backend-only and must not be committed or logged.

## Configuration matrix

| File/environment   | Express/Cargo          | Russia Platform                                       | Secrets                   |
| ------------------ | ---------------------- | ----------------------------------------------------- | ------------------------- |
| `api/.env.example` | `mock`                 | `mock`                                                | Empty placeholders        |
| `api/.env`         | `mock`                 | `mock` by default; `sandbox` for a manual Moscow test | Local untracked file      |
| `.env.staging`     | `mock` or manager test | `sandbox`                                             | Server/CI secret storage  |
| `.env.production`  | `production`           | `production`                                          | Production secret storage |

## Local development

Add the variables from `api/.env.example` to the existing untracked `api/.env`.
Set `YANDEX_DELIVERY_ENABLED=true` and keep both modes at `mock`. For a Russia
sandbox quote, switch only `YANDEX_RUSSIA_MODE=sandbox`, retain
`https://b2b.taxi.tst.yandex.net`, and insert the current test token/station ID
from the official Yandex access documentation. Sandbox addresses must be in
Moscow. Cargo remains mock unless Yandex supplied a manager-test account.

## Staging

Use Russia `sandbox`. Keep Cargo `mock`, or set `manager_test` with the exact
host and token issued by the account manager. Never point ordinary staging at
Cargo production. Keep live mutations disabled.

## Production

Enable the provider only after product packages, warehouse address/coordinates,
services, and warehouse provider configuration are complete. Use:

- Express base URL: `https://b2b.taxi.yandex.net`;
- Russia base URL: `https://b2b-authproxy.taxi.yandex.net`;
- real backend Bearer credentials;
- the real station ID in `WarehouseProviderConfig.externalLocationId`.

For Russia, an enabled warehouse-specific `externalLocationId` has priority.
`YANDEX_RUSSIA_STATION_ID` is a fallback only for mock/sandbox smoke checks and
is deliberately ignored as a production source of truth.

Current test credentials may change. Retrieve them from the official Yandex
documentation instead of copying permanent values into this repository.
