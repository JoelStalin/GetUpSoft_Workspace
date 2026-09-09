import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { PasswordLoginRequestDto, UserLoginRequestDto } from './dto/auth.dto';

@ApiTags('authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-password')
  @ApiOperation({ summary: 'Login with email and password' })
  loginWithPassword(@Body() request: PasswordLoginRequestDto, @Res({ passthrough: true }) response: Response) {
    const payload = this.authService.loginWithPassword(request.email, request.password);
    this.setSessionCookie(response, payload.session_id);
    return payload;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login or register user' })
  login(@Body() request: UserLoginRequestDto, @Res({ passthrough: true }) response: Response) {
    const payload = this.authService.loginOrRegister(request.email, request.name);
    this.setSessionCookie(response, payload.session_id);
    return payload;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout current session' })
  logout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const sessionId = this.readSessionCookie(req.headers.cookie);
    const result = this.authService.logout(sessionId);
    response.clearCookie('session_id');
    return result;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@Req() req: Request) {
    const sessionId = this.readSessionCookie(req.headers.cookie);
    return this.authService.me(sessionId);
  }

  @Get('verify-session')
  @ApiOperation({ summary: 'Verify current session' })
  verifySession(@Req() req: Request) {
    const sessionId = this.readSessionCookie(req.headers.cookie);
    return this.authService.verifySession(sessionId);
  }

  private setSessionCookie(response: Response, sessionId: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookie('session_id', sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: isProduction,
      httpOnly: true,
      sameSite: 'strict',
    });
  }

  private readSessionCookie(cookieHeader?: string) {
    if (!cookieHeader) return undefined;
    for (const part of cookieHeader.split(';')) {
      const [key, value] = part.trim().split('=');
      if (key === 'session_id') return value;
    }
    return undefined;
  }
}
