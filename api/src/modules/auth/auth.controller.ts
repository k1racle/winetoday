import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  Request,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import * as crypto from 'crypto';
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

  // ─── VK OAuth ───
  @Get('vk')
  vkAuth(@Request() req, @Res() res: Response) {
    const clientId = this.config.get<string>('VK_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('VK authorization is not configured');
    }
    const state = this.randomState();
    const redirectUri = this.redirectUri(req, 'vk');
    const redirectAfter = req.query.redirect as string | undefined;

    res.cookie('oauth_vk_state', state, this.oauthCookieOptions());
    res.cookie('oauth_vk_redirect', redirectAfter || '', this.oauthCookieOptions());

    const url = new URL('https://oauth.vk.com/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'email');
    url.searchParams.set('state', state);
    url.searchParams.set('v', '5.199');
    res.redirect(url.toString());
  }

  @Get('vk/callback')
  async vkCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Request() req,
    @Res() res: Response,
  ) {
    const clientId = this.config.get<string>('VK_CLIENT_ID');
    const clientSecret = this.config.get<string>('VK_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      return this.oauthErrorRedirect(res, 'VK is not configured');
    }

    const cookieState = req.cookies?.oauth_vk_state as string | undefined;
    res.clearCookie('oauth_vk_state', this.oauthCookieOptions());
    const redirectAfter = req.cookies?.oauth_vk_redirect as string | undefined;
    res.clearCookie('oauth_vk_redirect', this.oauthCookieOptions());

    if (error || !code || !cookieState || cookieState !== state) {
      return this.oauthErrorRedirect(res, errorDescription || 'VK authorization failed');
    }

    const redirectUri = this.redirectUri(req, 'vk');

    try {
      const tokenRes = await fetch(
        `https://oauth.vk.com/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(code)}`,
        { method: 'POST' },
      );
      const tokenData = (await tokenRes.json()) as any;
      if (!tokenData.access_token) {
        return this.oauthErrorRedirect(res, tokenData.error_description || 'VK token exchange failed');
      }

      const userRes = await fetch(
        `https://api.vk.com/method/users.get?user_ids=${tokenData.user_id}&fields=photo_200,first_name,last_name&access_token=${tokenData.access_token}&v=5.199`,
      );
      const userData = (await userRes.json()) as any;
      const vkUser = userData?.response?.[0];
      if (!vkUser) {
        return this.oauthErrorRedirect(res, 'VK user info unavailable');
      }

      const tokens = await this.authService.oauthLoginOrRegister({
        provider: 'vk',
        providerAccountId: String(tokenData.user_id),
        email: tokenData.email || null,
        name: `${vkUser.first_name || ''} ${vkUser.last_name || ''}`.trim() || undefined,
      });
      this.setCookies(res, tokens);
      return res.redirect(redirectAfter || this.config.get('FRONTEND_URL') || '/');
    } catch (err: any) {
      return this.oauthErrorRedirect(res, err.message || 'VK authorization failed');
    }
  }

  // ─── Yandex OAuth ───
  @Get('yandex')
  yandexAuth(@Request() req, @Res() res: Response) {
    const clientId = this.config.get<string>('YANDEX_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Yandex authorization is not configured');
    }
    const state = this.randomState();
    const redirectUri = this.redirectUri(req, 'yandex');
    const redirectAfter = req.query.redirect as string | undefined;

    res.cookie('oauth_yandex_state', state, this.oauthCookieOptions());
    res.cookie('oauth_yandex_redirect', redirectAfter || '', this.oauthCookieOptions());

    const url = new URL('https://oauth.yandex.com/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    res.redirect(url.toString());
  }

  @Get('yandex/callback')
  async yandexCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Request() req,
    @Res() res: Response,
  ) {
    const clientId = this.config.get<string>('YANDEX_CLIENT_ID');
    const clientSecret = this.config.get<string>('YANDEX_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      return this.oauthErrorRedirect(res, 'Yandex is not configured');
    }

    const cookieState = req.cookies?.oauth_yandex_state as string | undefined;
    res.clearCookie('oauth_yandex_state', this.oauthCookieOptions());
    const redirectAfter = req.cookies?.oauth_yandex_redirect as string | undefined;
    res.clearCookie('oauth_yandex_redirect', this.oauthCookieOptions());

    if (error || !code || !cookieState || cookieState !== state) {
      return this.oauthErrorRedirect(res, errorDescription || 'Yandex authorization failed');
    }

    const redirectUri = this.redirectUri(req, 'yandex');

    try {
      const tokenRes = await fetch('https://oauth.yandex.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });
      const tokenData = (await tokenRes.json()) as any;
      if (!tokenData.access_token) {
        return this.oauthErrorRedirect(res, tokenData.error_description || 'Yandex token exchange failed');
      }

      const userRes = await fetch('https://login.yandex.ru/info?format=json', {
        headers: { Authorization: `OAuth ${tokenData.access_token}` },
      });
      const userData = (await userRes.json()) as any;
      if (!userData || !userData.id) {
        return this.oauthErrorRedirect(res, 'Yandex user info unavailable');
      }

      const tokens = await this.authService.oauthLoginOrRegister({
        provider: 'yandex',
        providerAccountId: String(userData.id),
        email: userData.default_email || null,
        name: userData.display_name || userData.real_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined,
      });
      this.setCookies(res, tokens);
      return res.redirect(redirectAfter || this.config.get('FRONTEND_URL') || '/');
    } catch (err: any) {
      return this.oauthErrorRedirect(res, err.message || 'Yandex authorization failed');
    }
  }

  private randomState(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private redirectUri(req: any, provider: 'vk' | 'yandex'): string {
    const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = req.get('host') || 'localhost';
    return `${protocol}://${host}/api/auth/${provider}/callback`;
  }

  private oauthCookieOptions() {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    const secure = this.config.get('COOKIE_SECURE') !== undefined
      ? this.config.get('COOKIE_SECURE') === 'true'
      : isProduction;
    return {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      maxAge: 10 * 60 * 1000,
      domain: this.config.get('COOKIE_DOMAIN') || undefined,
    };
  }

  private oauthErrorRedirect(res: Response, message: string) {
    const frontend = this.config.get('FRONTEND_URL') || '/';
    return res.redirect(`${frontend}?oauth_error=${encodeURIComponent(message)}`);
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
