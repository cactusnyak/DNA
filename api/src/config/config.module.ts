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
        DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
        JWT_SECRET: Joi.string().min(16).required(),
        WEB_APP_URL: Joi.string().uri().default('http://localhost:5173'),
        STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
        S3_ENDPOINT: Joi.string().uri().when('STORAGE_DRIVER', {
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
        S3_PUBLIC_URL: Joi.string().uri().when('STORAGE_DRIVER', {
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
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class ConfigModule {}
