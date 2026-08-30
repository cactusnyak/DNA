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
        YOOKASSA_VAT_CODE: Joi.number().integer().min(1).max(12).default(1),
        YOOKASSA_EXPECTED_TEST_MODE: Joi.boolean().optional(),
        YOOKASSA_REQUEST_TIMEOUT_MS: Joi.number()
          .integer()
          .min(1000)
          .max(60000)
          .default(10000),
        YANDEX_CLIENT_ID: Joi.string().allow('').optional(),
        YANDEX_CLIENT_SECRET: Joi.string().allow('').optional(),
        YANDEX_REDIRECT_URI: Joi.string().uri().allow('').optional(),
        SMTP_HOST: Joi.string().allow('').optional(),
        SMTP_PORT: Joi.number().port().default(587),
        SMTP_USER: Joi.string().allow('').optional(),
        SMTP_PASS: Joi.string().allow('').optional(),
        SMTP_FROM: Joi.string().email().default('noreply@dna.ru'),
        MANAGER_EMAIL: Joi.string()
          .email()
          .when('EMAIL_DELIVERY_PROVIDER', {
            is: 'resend',
            then: Joi.required(),
            otherwise: Joi.string().allow('').optional(),
          }),
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
        YANDEX_DELIVERY_ENABLED: Joi.boolean().default(false),
        YANDEX_DELIVERY_TIMEOUT_MS: Joi.number()
          .integer()
          .min(500)
          .max(30000)
          .default(5000),
        YANDEX_DELIVERY_QUOTE_TTL_SECONDS: Joi.number()
          .integer()
          .min(60)
          .max(3600)
          .default(600),
        YANDEX_DELIVERY_LIVE_MUTATIONS_ENABLED: Joi.boolean().default(false),
        YANDEX_DELIVERY_TOKEN: Joi.string().allow('').optional(),
        YANDEX_EXPRESS_ENABLED: Joi.boolean().default(true),
        YANDEX_EXPRESS_MODE: Joi.string()
          .valid('mock', 'manager_test', 'production')
          .default('mock'),
        YANDEX_EXPRESS_BASE_URL: Joi.string()
          .uri({ scheme: ['https'] })
          .default('https://b2b.taxi.yandex.net'),
        YANDEX_EXPRESS_TOKEN: Joi.string().allow('').optional(),
        YANDEX_RUSSIA_ENABLED: Joi.boolean().default(true),
        YANDEX_RUSSIA_MODE: Joi.string()
          .valid('mock', 'sandbox', 'production')
          .default('mock'),
        YANDEX_RUSSIA_BASE_URL: Joi.string()
          .uri({ scheme: ['https'] })
          .default('https://b2b.taxi.tst.yandex.net'),
        YANDEX_RUSSIA_TOKEN: Joi.string().allow('').optional(),
        YANDEX_RUSSIA_STATION_ID: Joi.string().allow('').optional(),
        CDEK_DELIVERY_ENABLED: Joi.boolean().default(false),
        CDEK_DELIVERY_MODE: Joi.string()
          .valid('mock', 'test', 'live')
          .default('mock'),
        CDEK_DELIVERY_TIMEOUT_MS: Joi.number()
          .integer()
          .min(500)
          .max(30000)
          .default(10000),
        CDEK_DELIVERY_TOKEN_REFRESH_SKEW_SECONDS: Joi.number()
          .integer()
          .min(0)
          .max(900)
          .default(60),
        CDEK_DELIVERY_QUOTE_TTL_SECONDS: Joi.number()
          .integer()
          .min(60)
          .max(3600)
          .default(600),
        CDEK_DELIVERY_TEST_BASE_URL: Joi.string()
          .uri({ scheme: ['https'] })
          .default('https://api.edu.cdek.ru'),
        CDEK_DELIVERY_PRODUCTION_BASE_URL: Joi.string()
          .uri({ scheme: ['https'] })
          .default('https://api.cdek.ru'),
        CDEK_DELIVERY_ACCOUNT: Joi.string().allow('').optional(),
        CDEK_DELIVERY_SECURE_PASSWORD: Joi.string().allow('').optional(),
        CDEK_DELIVERY_LIVE_MUTATIONS_ENABLED: Joi.boolean().default(false),
        DADATA_API_KEY: Joi.string().allow('').optional(),

        AUTH_LOGIN_METHODS: Joi.string().default('email_otp,otp,yandex'),
        AUTH_REGISTRATION_METHODS: Joi.string().default('email_otp,yandex'),
        AUTH_PRIMARY_LOGIN_METHOD: Joi.string().default('email_otp'),
        AUTH_PRIMARY_REGISTRATION_METHOD: Joi.string().default('email_otp'),

        PASSWORD_HASH_SECRET_PEPPER: Joi.string().allow('').optional(),
        EMAIL_VERIFICATION_TOKEN_TTL_SECONDS: Joi.number()
          .integer()
          .min(60)
          .max(7 * 86400)
          .default(86400),
        PASSWORD_RESET_TOKEN_TTL_SECONDS: Joi.number()
          .integer()
          .min(60)
          .max(86400)
          .default(1800),
        PASSWORD_RESET_REQUEST_COOLDOWN_SECONDS: Joi.number()
          .integer()
          .min(1)
          .max(3600)
          .default(60),
        PASSWORD_RESET_MAX_REQUESTS_PER_EMAIL_PER_HOUR: Joi.number()
          .integer()
          .min(1)
          .max(100)
          .default(5),
        PASSWORD_RESET_MAX_REQUESTS_PER_IP_PER_HOUR: Joi.number()
          .integer()
          .min(1)
          .max(1000)
          .default(15),
        EMAIL_VERIFICATION_REQUEST_COOLDOWN_SECONDS: Joi.number()
          .integer()
          .min(1)
          .max(3600)
          .default(60),
        EMAIL_VERIFICATION_MAX_REQUESTS_PER_EMAIL_PER_HOUR: Joi.number()
          .integer()
          .min(1)
          .max(100)
          .default(5),

        EMAIL_DELIVERY_PROVIDER: Joi.string()
          .valid('console', 'resend')
          .default('console'),
        RESEND_API_KEY: Joi.string().when('EMAIL_DELIVERY_PROVIDER', {
          is: 'resend',
          then: Joi.required(),
          otherwise: Joi.string().allow('').optional(),
        }),
        RESEND_FROM_EMAIL: Joi.string().when('EMAIL_DELIVERY_PROVIDER', {
          is: 'resend',
          then: Joi.required(),
          otherwise: Joi.string().allow('').optional(),
        }),
        RESEND_REPLY_TO_EMAIL: Joi.string().allow('').optional(),
        RESEND_WEBHOOK_SECRET: Joi.string().allow('').optional(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class ConfigModule {}
