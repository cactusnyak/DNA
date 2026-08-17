import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import {
  EMAIL_DELIVERY_PROVIDER,
  type EmailDeliveryProvider,
} from './email-delivery-provider.interface';
import {
  buildEmailVerificationEmail,
  buildPasswordChangedEmail,
  buildPasswordResetEmail,
  buildOtpCodeEmail,
} from './templates/auth-email-templates';

@Injectable()
export class AuthEmailSenderService {
  constructor(
    @Inject(EMAIL_DELIVERY_PROVIDER)
    private readonly provider: EmailDeliveryProvider,
  ) {}

  async sendEmailVerification(to: string, verificationUrl: string) {
    const { subject, html, text } =
      buildEmailVerificationEmail(verificationUrl);

    return this.provider.sendEmail({
      to,
      subject,
      html,
      text,
      idempotencyKey: randomUUID(),
    });
  }

  async sendOtpCode(to: string, code: string, expiresInSeconds: number) {
    const { subject, html, text } = buildOtpCodeEmail(code, expiresInSeconds);

    return this.provider.sendEmail({
      to,
      subject,
      html,
      text,
      idempotencyKey: randomUUID(),
    });
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const { subject, html, text } = buildPasswordResetEmail(resetUrl);

    return this.provider.sendEmail({
      to,
      subject,
      html,
      text,
      idempotencyKey: randomUUID(),
    });
  }

  async sendPasswordChanged(to: string) {
    const { subject, html, text } = buildPasswordChangedEmail();

    return this.provider.sendEmail({
      to,
      subject,
      html,
      text,
      idempotencyKey: randomUUID(),
    });
  }
}
