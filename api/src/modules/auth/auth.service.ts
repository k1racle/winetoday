import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
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

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
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

  private generateTokens(userId: string, email: string, role: Role): TokenPair {
    const payload = { sub: userId, email, role };

    const access_token = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refresh_token = this.jwt.sign(
      { sub: userId },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    return { access_token, refresh_token };
  }
}
