export type YookassaAmount = {
  value: string;
  currency: 'RUB';
};

export type YookassaConfirmationRedirect = {
  type: 'redirect';
  confirmation_url: string;
};

export type YookassaConfirmationEmbedded = {
  type: 'embedded';
  confirmation_token: string;
};

export type YookassaPaymentStatus =
  | 'pending'
  | 'waiting_for_capture'
  | 'succeeded'
  | 'canceled';

export type YookassaPayment = {
  id: string;
  status: YookassaPaymentStatus;
  amount: YookassaAmount;
  confirmation: YookassaConfirmationRedirect | YookassaConfirmationEmbedded;
  description?: string;
  metadata?: Record<string, string>;
  created_at: string;
};

export type YookassaWebhookEvent =
  | 'payment.succeeded'
  | 'payment.waiting_for_capture'
  | 'payment.canceled'
  | 'refund.succeeded';

export type YookassaWebhookPayload = {
  type: 'notification';
  event: YookassaWebhookEvent;
  object: YookassaPayment;
};
