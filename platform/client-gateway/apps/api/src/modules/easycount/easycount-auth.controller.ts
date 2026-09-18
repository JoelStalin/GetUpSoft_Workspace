import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import {
  EasyCountLoginRequestDto,
  EasyCountMfaRequestDto,
  EasyCountSocialExchangeRequestDto,
} from './dto/easycount-auth.dto';
import { EasyCountAuthService } from './easycount-auth.service';

@ApiTags('easycount-auth')
@Controller('easycount')
export class EasyCountAuthController {
  constructor(private readonly authService: EasyCountAuthService) {}

  @Post('auth/login')
  @ApiOperation({ summary: 'Portal login endpoint' })
  login(@Body() payload: EasyCountLoginRequestDto) {
    return this.authService.login(payload.email, payload.password, payload.portal);
  }

  @Post('auth/mfa/verify')
  @ApiOperation({ summary: 'Verify MFA challenge' })
  verifyMfa(@Body() payload: EasyCountMfaRequestDto) {
    return this.authService.verifyMfa(payload.code, payload.challenge_id, payload.email);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current portal session user' })
  me(@Req() req: Request) {
    const authorization = req.headers.authorization ?? '';
    const accessToken = authorization.toLowerCase().startsWith('bearer ') ? authorization.split(' ', 2)[1] : undefined;
    return this.authService.me(accessToken);
  }

  @Get('auth/oauth/providers')
  @ApiOperation({ summary: 'List enabled social providers' })
  socialProviders() {
    return this.authService.listSocialProviders();
  }

  @Get('auth/oauth/:provider/start')
  @ApiOperation({ summary: 'Start social auth flow' })
  startSocial(
    @Param('provider') provider: string,
    @Query('portal') portal: 'admin' | 'client' | 'seller',
    @Query('return_to') returnTo?: string,
  ) {
    if (!portal) throw new UnauthorizedException('portal requerido');
    return this.authService.startSocialLogin(provider, portal, returnTo);
  }

  @Post('auth/oauth/exchange')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange social ticket for auth session' })
  socialExchange(@Body() payload: EasyCountSocialExchangeRequestDto) {
    return this.authService.exchangeSocialTicket(payload.ticket, payload.portal);
  }
}

