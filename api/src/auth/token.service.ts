import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
  exp: number;
};

type AccessTokenInput = Omit<AccessTokenPayload, 'exp'>;

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function encodeBase64Url(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decodeBase64Url<TValue>(value: string): TValue {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf-8')) as TValue;
}

@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  signAccessToken(payload: AccessTokenInput) {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const body: AccessTokenPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
    };

    const encodedHeader = encodeBase64Url(header);
    const encodedBody = encodeBase64Url(body);
    const signature = this.createSignature(encodedHeader, encodedBody);

    return `${encodedHeader}.${encodedBody}.${signature}`;
  }

  verifyAccessToken(token: string) {
    const [encodedHeader, encodedBody, signature] = token.split('.');

    if (!encodedHeader || !encodedBody || !signature) {
      throw new UnauthorizedException('Invalid token');
    }

    const expectedSignature = this.createSignature(encodedHeader, encodedBody);

    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      throw new UnauthorizedException('Invalid token');
    }

    const payload = decodeBase64Url<AccessTokenPayload>(encodedBody);

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private createSignature(encodedHeader: string, encodedBody: string) {
    return createHmac('sha256', this.getSecret())
      .update(`${encodedHeader}.${encodedBody}`)
      .digest('base64url');
  }

  private getSecret() {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }
}