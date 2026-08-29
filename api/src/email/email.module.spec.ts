import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { DeliveryQuoteEmailService } from '../delivery-quotes/delivery-quote-email.service';
import {
  EMAIL_DELIVERY_PROVIDER,
  type EmailDeliveryProvider,
} from './email-delivery-provider.interface';
import { EmailModule } from './email.module';
import { ConsoleEmailProvider } from './providers/console-email.provider';

describe('EmailModule wiring', () => {
  it('provides one local-safe implementation to DeliveryQuoteEmailService', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          validate: (config) => ({
            ...config,
            EMAIL_DELIVERY_PROVIDER: 'console',
          }),
        }),
        EmailModule,
      ],
      providers: [DeliveryQuoteEmailService],
    }).compile();

    const provider = module.get<EmailDeliveryProvider>(EMAIL_DELIVERY_PROVIDER);
    const service = module.get(DeliveryQuoteEmailService);

    expect(provider).toBeInstanceOf(ConsoleEmailProvider);
    expect(
      (service as unknown as { emailProvider: EmailDeliveryProvider })
        .emailProvider,
    ).toBe(provider);

    await module.close();
  });

  it('rejects an unsupported provider instead of leaving the token unbound', async () => {
    await expect(
      Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            validate: (config) => ({
              ...config,
              EMAIL_DELIVERY_PROVIDER: 'unsupported',
            }),
          }),
          EmailModule,
        ],
      }).compile(),
    ).rejects.toThrow('Unsupported email delivery provider');
  });

  it('uses no network-capable provider in local console mode', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          validate: (config) => ({
            ...config,
            EMAIL_DELIVERY_PROVIDER: 'console',
          }),
        }),
        EmailModule,
      ],
    }).compile();
    const provider = module.get<EmailDeliveryProvider>(EMAIL_DELIVERY_PROVIDER);
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    await expect(
      provider.sendEmail({
        to: 'local@example.test',
        subject: 'Local wiring test',
        html: '<p>Local wiring test</p>',
        text: 'Local wiring test',
      }),
    ).resolves.toEqual({ provider: 'console' });
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
    await module.close();
  });
});
