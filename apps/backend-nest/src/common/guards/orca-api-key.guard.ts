import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class OrcaApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expectedKey = this.config.get<string>('ORCA_API_KEY') ?? 'orca-secret-key-2026';
    const providedKey = request.header('api-key');

    if (providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid ORCA_API_KEY');
    }

    return true;
  }
}
