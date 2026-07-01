import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    this.setCookies(res, tokens);
    return { ok: true };
  }

  @Post('refresh')
  async refresh(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    const payload = this.verifyRefresh(refreshToken);
    const tokens = await this.authService.refresh(payload.sub);
    this.setCookies(res, tokens);
    return { ok: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req) {
    return this.authService.me(req.user.userId);
  }

  private setCookies(
    res: Response,
    tokens: { access_token: string; refresh_token: string },
  ) {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    const secure = this.config.get('COOKIE_SECURE') !== undefined
      ? this.config.get('COOKIE_SECURE') === 'true'
      : isProduction;
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      domain: this.config.get('COOKIE_DOMAIN') || undefined,
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: this.config.get('COOKIE_DOMAIN') || undefined,
    });
  }

  private verifyRefresh(token: string) {
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      return this.jwtService.verify(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }
  }
}
