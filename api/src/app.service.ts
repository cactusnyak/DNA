import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'DNA API',
      status: 'ok',
      docs: '/api/docs',
    };
  }
}
