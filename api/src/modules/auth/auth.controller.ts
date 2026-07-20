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
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    this.setCookies(res, tokens);
    return { ok: true };
  }

  @Post('refresh')
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  async refresh(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    const payload = this.verifyRefresh(refreshToken);
    if (!payload.jti) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refresh(payload.sub, payload.jti);
    this.setCookies(res, tokens);
    return { ok: true };
  }

  @Post('logout')
  logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    let jti: string | undefined;
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      jti = payload.jti;
    } catch {
      // ignore invalid token
    }
    this.authService.logout(jti);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req) {
    return this.authService.me(req.user.userId);
  }

  @Get('me/subscriptions')
  @UseGuards(JwtAuthGuard)
  async mySubscriptions(@Request() req) {
    return this.authService.getSubscriptions(req.user.userId);
  }

  @Get('me/likes')
  @UseGuards(JwtAuthGuard)
  async myLikes(@Request() req) {
    return this.authService.getLikedContent(req.user.userId);
  }

  @Get('me/comments')
  @UseGuards(JwtAuthGuard)
  async myComments(@Request() req) {
    return this.authService.getComments(req.user.userId);
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
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: this.config.get('COOKIE_DOMAIN') || undefined,
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
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
