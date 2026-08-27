import 'dotenv/config';

const TEST_BASE_URL = 'https://api.edu.cdek.ru';

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(`${name} is required for the CDEK test smoke check`);
  return value;
}

async function main() {
  const mode = process.env.CDEK_DELIVERY_MODE?.trim() || 'mock';
  const baseUrl =
    process.env.CDEK_DELIVERY_TEST_BASE_URL?.replace(/\/+$/, '') ||
    TEST_BASE_URL;
  const mutations =
    process.env.CDEK_DELIVERY_LIVE_MUTATIONS_ENABLED?.toLowerCase() === 'true';
  if (!process.argv.includes('--mode=test') || mode !== 'test')
    throw new Error(
      'Smoke preflight requires --mode=test and CDEK_DELIVERY_MODE=test',
    );
  if (baseUrl !== TEST_BASE_URL)
    throw new Error('Smoke preflight permits only https://api.edu.cdek.ru');
  if (mutations)
    throw new Error('Smoke preflight requires live mutations to be disabled');

  const query = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: required('CDEK_DELIVERY_ACCOUNT'),
    client_secret: required('CDEK_DELIVERY_SECURE_PASSWORD'),
  });
  const tokenResponse = await fetch(`${baseUrl}/v2/oauth/token?${query}`, {
    method: 'POST',
  });
  if (!tokenResponse.ok)
    throw new Error(`CDEK OAuth failed (${tokenResponse.status})`);
  const tokenBody = (await tokenResponse.json()) as Record<string, unknown>;
  if (typeof tokenBody.access_token !== 'string')
    throw new Error('CDEK OAuth returned no access token');
  const response = await fetch(`${baseUrl}/v2/calculator/tarifflist`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenBody.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 1,
      currency: 1,
      lang: 'rus',
      from_location: { code: 44 },
      to_location: { code: 137 },
      packages: [
        {
          number: 'synthetic-1',
          weight: 1000,
          length: 20,
          width: 15,
          height: 10,
        },
      ],
    }),
  });
  if (!response.ok)
    throw new Error(`CDEK calculator failed (${response.status})`);
  const body = (await response.json()) as Record<string, unknown>;
  if (!Array.isArray(body.tariff_codes))
    throw new Error('Malformed tariff-list response');
  const tariffs = body.tariff_codes.map((value) => {
    const tariff = value as Record<string, unknown>;
    return {
      tariffCode: tariff.tariff_code,
      name: tariff.tariff_name,
      deliveryMode: tariff.delivery_mode,
      price: tariff.delivery_sum,
      currency: tariff.currency ?? 'RUB',
      periodMin: tariff.period_min,
      periodMax: tariff.period_max,
    };
  });
  console.log(JSON.stringify({ contour: 'CDEK test', tariffs }, null, 2));
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'CDEK smoke check failed',
  );
  process.exitCode = 1;
});
