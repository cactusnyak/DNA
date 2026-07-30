import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().port().default(3000),
        DATABASE_URL: Joi.string()
          .uri({ scheme: ['postgresql', 'postgres'] })
          .required(),
        JWT_SECRET: Joi.string().min(16).required(),
        WEB_APP_URL: Joi.string().uri().default('http://localhost:5173'),
        STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
        S3_ENDPOINT: Joi.string()
          .uri()
          .when('STORAGE_DRIVER', {
            is: 's3',
            then: Joi.required(),
            otherwise: Joi.string().allow('').optional(),
          }),
        S3_REGION: Joi.string().when('STORAGE_DRIVER', {
          is: 's3',
          then: Joi.required(),
          otherwise: Joi.string().allow('').optional(),
        }),
        S3_BUCKET: Joi.string().when('STORAGE_DRIVER', {
          is: 's3',
          then: Joi.required(),
          otherwise: Joi.string().allow('').optional(),
        }),
        S3_ACCESS_KEY_ID: Joi.string().when('STORAGE_DRIVER', {
          is: 's3',
          then: Joi.required(),
          otherwise: Joi.string().allow('').optional(),
        }),
        S3_SECRET_ACCESS_KEY: Joi.string().when('STORAGE_DRIVER', {
          is: 's3',
          then: Joi.required(),
          otherwise: Joi.string().allow('').optional(),
        }),
        S3_PUBLIC_URL: Joi.string()
          .uri()
          .when('STORAGE_DRIVER', {
            is: 's3',
            then: Joi.required(),
            otherwise: Joi.string().allow('').optional(),
          }),
        S3_FORCE_PATH_STYLE: Joi.boolean().default(false),
        YOOKASSA_SHOP_ID: Joi.string().allow('').optional(),
        YOOKASSA_SECRET_KEY: Joi.string().allow('').optional(),
        YANDEX_CLIENT_ID: Joi.string().allow('').optional(),
        YANDEX_CLIENT_SECRET: Joi.string().allow('').optional(),
        YANDEX_REDIRECT_URI: Joi.string().uri().allow('').optional(),
        SMTP_HOST: Joi.string().allow('').optional(),
        SMTP_PORT: Joi.number().port().default(587),
        SMTP_USER: Joi.string().allow('').optional(),
        SMTP_PASS: Joi.string().allow('').optional(),
        SMTP_FROM: Joi.string().email().default('noreply@dna.ru'),
        OTP_LOG_CODES: Joi.boolean().default(false),
        OTP_DELIVERY_PROVIDER: Joi.string()
          .valid('console', 'sms_ru')
          .default('console'),
        OTP_CODE_TTL_SECONDS: Joi.number()
          .integer()
          .min(60)
          .max(86400)
          .default(300),
        OTP_RESEND_COOLDOWN_SECONDS: Joi.number()
          .integer()
          .min(1)
          .max(3600)
          .default(60),
        OTP_MAX_VERIFY_ATTEMPTS: Joi.number()
          .integer()
          .min(1)
          .max(20)
          .default(5),
        OTP_MAX_SENDS_PER_PHONE_PER_HOUR: Joi.number()
          .integer()
          .min(1)
          .max(100)
          .default(5),
        OTP_MAX_SENDS_PER_IP_PER_HOUR: Joi.number()
          .integer()
          .min(1)
          .max(1000)
          .default(15),
        OTP_HASH_SECRET: Joi.string().min(32).required(),
        SMS_RU_API_ID: Joi.string().when('OTP_DELIVERY_PROVIDER', {
          is: 'sms_ru',
          then: Joi.required(),
          otherwise: Joi.string().allow('').optional(),
        }),
        SMS_RU_BASE_URL: Joi.string()
          .uri({ scheme: ['https'] })
          .default('https://sms.ru'),
        SMS_RU_SENDER_NAME: Joi.string().when('OTP_DELIVERY_PROVIDER', {
          is: 'sms_ru',
          then: Joi.required(),
          otherwise: Joi.string().allow('').optional(),
        }),
        SMS_RU_OTP_MESSAGE_TEMPLATE: Joi.string()
          .custom((value: string, helpers) => {
            return value.split('{code}').length === 2
              ? value
              : helpers.error('string.otpTemplate');
          })
          .default('Код для входа в DNA: {code}'),
        SMS_RU_TEST_MODE: Joi.boolean().default(true),
        SMS_RU_REQUEST_TIMEOUT_MS: Joi.number()
          .integer()
          .min(100)
          .max(30000)
          .default(10000),
        SMS_RU_WEBHOOK_TOKEN: Joi.string().allow('').optional(),
        SMS_RU_WEBHOOK_URL: Joi.string()
          .uri({ scheme: ['https'] })
          .allow('')
          .optional(),
        TRUST_PROXY: Joi.boolean().default(false),
        HARD_DELETE_ORDERS_ENABLED: Joi.boolean().default(false),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class ConfigModule {}
