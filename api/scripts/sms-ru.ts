import { ConfigService } from '@nestjs/config';

import { SmsRuClient } from '../src/integrations/sms-ru/sms-ru.client';

function requireValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required SMS.RU configuration: ${name}`);
  return value;
}

async function main() {
  requireValue('SMS_RU_API_ID');
  const sender = requireValue('SMS_RU_SENDER_NAME');
  process.env.SMS_RU_BASE_URL ||= 'https://sms.ru';
  process.env.SMS_RU_REQUEST_TIMEOUT_MS ||= '10000';
  const config = new ConfigService();
  const client = new SmsRuClient(config);
  const action = process.argv[2] ?? 'check';

  if (action === 'check') {
    const [auth, senders, balance, limit] = await Promise.all([
      client.authCheck(),
      client.senders(),
      client.balance(),
      client.limit(),
    ]);
    const ok = (value: { status?: string; status_code?: number }) =>
      value.status === 'OK' && value.status_code === 100;
    console.log(`SMS.RU API credentials: ${ok(auth) ? 'OK' : 'FAILED'}`);
    console.log(`Configured sender: ${sender}`);
    console.log(
      `Sender exists in account: ${senders.senders?.includes(sender) ? 'OK' : 'NOT FOUND'}`,
    );
    console.log(`Balance request: ${ok(balance) ? 'OK' : 'FAILED'}`);
    console.log(`Daily limit request: ${ok(limit) ? 'OK' : 'FAILED'}`);
    console.log(
      `Test mode: ${process.env.SMS_RU_TEST_MODE === 'false' ? 'disabled' : 'enabled'}`,
    );
    console.log(
      `Webhook URL configured: ${process.env.SMS_RU_WEBHOOK_URL ? 'yes' : 'no'}`,
    );
    const template = process.env.SMS_RU_OTP_MESSAGE_TEMPLATE ?? '';
    console.log(
      `OTP template placeholder: ${template.split('{code}').length === 2 ? 'OK' : 'FAILED'}`,
    );
    return;
  }

  const url = requireValue('SMS_RU_WEBHOOK_URL');
  const response = await client.callback(
    action === 'callback:add'
      ? 'add'
      : action === 'callback:delete'
        ? 'del'
        : 'get',
    action === 'callback:list' ? undefined : url,
  );
  console.log(
    `SMS.RU callback ${action}: ${response.status === 'OK' && response.status_code === 100 ? 'OK' : 'FAILED'}`,
  );
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'SMS.RU command failed',
  );
  process.exitCode = 1;
});
