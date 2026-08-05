import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ResendEmailProvider } from './resend-email.provider';

describe('ResendEmailProvider', () => {
  const command = {
    to: 'manager@example.com',
    subject: 'Subject',
    html: '<p>Body</p>',
    text: 'Body',
    idempotencyKey: 'delivery-quote-quote-123',
    logContext: { deliveryRequestId: 'quote-123' },
  };

  const build = (response: unknown) => {
    const config = {
      getOrThrow: jest.fn().mockReturnValue('DNA <mail@example.com>'),
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    const send = jest.fn().mockResolvedValue(response);
    const provider = new ResendEmailProvider(config);
    Object.assign(provider, { client: { emails: { send } } });
    return { provider, send };
  };

  it('returns and captures the Resend message ID', async () => {
    const { provider, send } = build({
      data: { id: 'email-789' },
      error: null,
    });

    await expect(provider.sendEmail(command)).resolves.toEqual({
      provider: 'resend',
      externalMessageId: 'email-789',
    });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ to: command.to }),
      { idempotencyKey: command.idempotencyKey },
    );
  });

  it('rejects a returned Resend API error', async () => {
    const { provider } = build({
      data: null,
      error: {
        name: 'validation_error',
        message: 'Invalid from',
        statusCode: 422,
      },
    });
    await expect(provider.sendEmail(command)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('rejects a response that has neither an error nor a message ID', async () => {
    const { provider } = build({ data: null, error: null });
    await expect(provider.sendEmail(command)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('does not swallow a thrown provider error', async () => {
    const { provider, send } = build(undefined);
    send.mockRejectedValueOnce(
      Object.assign(new Error('network unavailable'), { status: 503 }),
    );
    await expect(provider.sendEmail(command)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
