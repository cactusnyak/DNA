import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private emailTransporter?: Transporter;

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.emailTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort ?? 587,
        secure: smtpPort === 465,
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
      this.logOtpCode('EMAIL', to, code);
      return;
    }

    await this.emailTransporter.sendMail({
      from: this.configService.getOrThrow<string>('SMTP_FROM'),
      to,
      subject,
      text,
    });
  }

  private sendSmsOtp(phone: string, code: string) {
    this.logOtpCode('SMS', phone, code);
  }

  private logOtpCode(channel: 'EMAIL' | 'SMS', recipient: string, code: string) {
    if (this.configService.get<boolean>('OTP_LOG_CODES')) {
      this.logger.debug(`[${channel} OTP] ${recipient}: ${code}`);
    }
  }
}
