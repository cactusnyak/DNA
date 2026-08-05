export const EMAIL_DELIVERY_PROVIDER = Symbol('EMAIL_DELIVERY_PROVIDER');

export type SendEmailCommand = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
  logContext?: { deliveryRequestId?: string };
};

export type SendEmailResult = {
  provider: 'resend' | 'console';
  externalMessageId?: string;
};

export interface EmailDeliveryProvider {
  sendEmail(command: SendEmailCommand): Promise<SendEmailResult>;
}
