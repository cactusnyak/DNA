export const OTP_DELIVERY_PROVIDER = Symbol('OTP_DELIVERY_PROVIDER');

export type SendOtpCommand = {
  phone: string;
  code: string;
  clientIp?: string;
  expiresInSeconds: number;
};

export type SendOtpResult = {
  provider: 'sms_ru' | 'console';
  accepted: boolean;
  externalMessageId?: string;
  providerStatusCode?: number;
  balanceAfterSend?: number;
};

export interface OtpDeliveryProvider {
  sendOtp(command: SendOtpCommand): Promise<SendOtpResult>;
}
