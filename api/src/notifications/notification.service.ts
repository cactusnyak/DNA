import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class NotificationService {
  private emailTransporter?: Transporter;

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
  }

  async sendOtpCode(type: 'email' | 'phone', to: string, code: string) {
    if (type === 'email') {
      await this.sendEmailOtp(to, code);
      return;
    }

    this.sendSmsOtp(to, code);
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

  private sendSmsOtp(phone: string, code: string) {
    console.log(`[SMS OTP] ${phone}: ${code}`);
  }
}
