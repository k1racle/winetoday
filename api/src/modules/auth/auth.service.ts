import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ReactionType, Role } from '@prisma/client';

export type TokenPair = {
  access_token: string;
  refresh_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        role: Role.member,
        memberProfile: {
          create: {
            displayName: dto.displayName || dto.username,
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        memberProfile: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return user;
  }

  async login(dto: LoginDto) {
    const isEmail = dto.login.includes('@');
    const user = await this.prisma.user.findUnique({
      where: isEmail ? { email: dto.login } : { username: dto.login },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(userId: string, tokenJti: string) {
    if (!tokenJti) {
      throw new UnauthorizedException();
    }
    const stored = await this.prisma.refreshToken.findUnique({
      where: { jti: tokenJti },
    });

    if (!stored || stored.userId !== userId || stored.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }

    await this.prisma.refreshToken.delete({ where: { jti: tokenJti } });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return await this.generateTokens(user.id, user.email, user.role);
  }

  async logout(tokenJti?: string) {
    if (tokenJti) {
      await this.prisma.refreshToken.deleteMany({ where: { jti: tokenJti } });
    }
  }

  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberProfile: {
          include: {
            author: {
              include: { avatarMedia: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      displayName: user.memberProfile?.displayName,
      avatarMedia: user.memberProfile?.author?.avatarMedia || null,
    };
  }

  async getSubscriptions(userId: string) {
    return this.prisma.authorSubscription.findMany({
      where: { userId },
      include: {
        author: {
          include: { avatarMedia: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLikedContent(userId: string) {
    const reactions = await this.prisma.reaction.findMany({
      where: { userId, type: ReactionType.like },
      include: {
        contentItem: {
          include: {
            author: { include: { avatarMedia: true } },
            coverMedia: true,
            archiveCoverMedia: true,
            categories: true,
            tags: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reactions.map((r) => r.contentItem).filter(Boolean);
  }

  async getComments(userId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { userId },
      include: {
        contentItem: {
          select: {
            id: true,
            type: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      status: c.status,
      contentItem: c.contentItem,
    }));
  }

  async oauthLoginOrRegister(input: {
    provider: 'vk' | 'yandex';
    providerAccountId: string;
    email?: string | null;
    name?: string;
  }): Promise<TokenPair> {
    let user = await this.prisma.user.findFirst({
      where: {
        oauthAccounts: {
          some: {
            provider: input.provider,
            providerAccountId: input.providerAccountId,
          },
        },
      },
    });

    if (!user && input.email) {
      user = await this.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (user) {
        await this.prisma.oAuthAccount.create({
          data: {
            provider: input.provider,
            providerAccountId: input.providerAccountId,
            userId: user.id,
          },
        });
      }
    }

    if (!user) {
      const username = `${input.provider}_${input.providerAccountId.slice(0, 16)}_${Date.now().toString(36)}`;
      const displayName = input.name || username;
      const email = input.email || `${input.provider}_${input.providerAccountId}@social.local`;
      user = await this.prisma.user.create({
        data: {
          email,
          username,
          passwordHash: null,
          role: Role.member,
          memberProfile: {
            create: {
              displayName,
            },
          },
          oauthAccounts: {
            create: {
              provider: input.provider,
              providerAccountId: input.providerAccountId,
            },
          },
        },
      });
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  private async generateTokens(userId: string, email: string, role: Role): Promise<TokenPair> {
    const payload = { sub: userId, email, role };

    const access_token = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    const jti = uuidv4();
    const refreshExpiresInSeconds = 30 * 24 * 60 * 60;

    const refresh_token = this.jwt.sign(
      { sub: userId, jti },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresInSeconds,
      },
    );

    const expiresAt = new Date(Date.now() + refreshExpiresInSeconds * 1000);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        jti,
        expiresAt,
      },
    });

    return { access_token, refresh_token };
  }
}
