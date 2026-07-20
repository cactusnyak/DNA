import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import twilio from 'twilio';

@Injectable()
export class NotificationService {
  private emailTransporter?: Transporter;
  private twilioClient?: ReturnType<typeof twilio>;
  private twilioFrom?: string;

  constructor() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      this.emailTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort) || 587,
        secure: Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioFrom) {
      this.twilioClient = twilio(twilioAccountSid, twilioAuthToken);
      this.twilioFrom = twilioFrom;
    }
  }

  async sendOtpCode(type: 'email' | 'phone', to: string, code: string) {
    if (type === 'email') {
      await this.sendEmailOtp(to, code);
      return;
    }

    await this.sendSmsOtp(to, code);
  }

  private async sendEmailOtp(to: string, code: string) {
    const subject = 'Код подтверждения DNA';
    const text = `Ваш код подтверждения: ${code}\n\nКод действителен 10 минут.`;

    if (!this.emailTransporter) {
      console.log(`[EMAIL OTP] ${to}: ${code}`);
      return;
    }

    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM ?? 'noreply@dna.ru',
      to,
      subject,
      text,
    });
  }

  private async sendSmsOtp(phone: string, code: string) {
    const text = `DNA: код подтверждения ${code}`;

    if (!this.twilioClient || !this.twilioFrom) {
      console.log(`[SMS OTP] ${phone}: ${code}`);
      return;
    }

    await this.twilioClient.messages.create({
      body: text,
      from: this.twilioFrom,
      to: phone,
    });
  }
}
