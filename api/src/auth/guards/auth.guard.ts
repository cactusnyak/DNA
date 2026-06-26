import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from '../auth.service';

type AuthenticatedRequest = Request & {
  user?: Awaited<ReturnType<AuthService['getMeFromAuthorizationHeader']>>;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const authorizationHeader = Array.isArray(request.headers.authorization)
      ? request.headers.authorization[0]
      : request.headers.authorization;

    const user = await this.authService.getMeFromAuthorizationHeader(
      authorizationHeader,
    );

    request.user = user;

    return true;
  }
}