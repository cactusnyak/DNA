import { HttpException, HttpStatus } from '@nestjs/common';

export class DeliveryProviderError extends HttpException {
  constructor(
    readonly code: string,
    message: string,
    readonly retriable = false,
    status = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message, retriable }, status);
  }
}

export function toUnavailableReason(error: unknown) {
  if (error instanceof DeliveryProviderError) {
    return {
      code: error.code,
      message: error.message,
      retriable: error.retriable,
    };
  }
  return {
    code: 'PROVIDER_UNAVAILABLE',
    message: 'Сервис доставки временно недоступен.',
    retriable: true,
  };
}
