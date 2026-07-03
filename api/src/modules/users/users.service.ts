import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

export type AdminUserOutput = {
  id: string;
  email: string;
  username: string | null;
  role: Role;
  createdAt: Date;
  displayName: string | null;
  authorId: string | null;
  authorName: string | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AdminUserOutput[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        memberProfile: {
          select: {
            displayName: true,
            authorId: true,
            author: {
              select: { name: true },
            },
          },
        },
      },
    });
    return users.map((u) => ({
      ...u,
      displayName: u.memberProfile?.displayName ?? null,
      authorId: u.memberProfile?.authorId ?? null,
      authorName: u.memberProfile?.author?.name ?? null,
    }));
  }

  async findById(id: string): Promise<AdminUserOutput> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        memberProfile: {
          select: {
            displayName: true,
            authorId: true,
            author: {
              select: { name: true },
            },
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      ...user,
      displayName: user.memberProfile?.displayName ?? null,
      authorId: user.memberProfile?.authorId ?? null,
      authorName: user.memberProfile?.author?.name ?? null,
    };
  }

  async create(data: {
    email: string;
    username?: string;
    password: string;
    role?: Role;
    displayName?: string;
  }): Promise<AdminUserOutput> {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    if (data.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username || null,
        passwordHash,
        role: data.role ?? Role.member,
        memberProfile: {
          create: {
            displayName: data.displayName || data.username || data.email.split('@')[0],
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
            authorId: true,
          },
        },
      },
    });

    return {
      ...user,
      displayName: user.memberProfile?.displayName ?? null,
      authorId: user.memberProfile?.authorId ?? null,
      authorName: null,
    };
  }

  async update(
    id: string,
    data: {
      email?: string;
      username?: string | null;
      role?: Role;
      displayName?: string;
      password?: string;
    },
  ): Promise<AdminUserOutput> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new ConflictException('Email already registered');
      }
    }

    if (data.username && data.username !== user.username) {
      const existing = await this.prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existing) {
        throw new ConflictException('Username already taken');
      }
    }

    const updateData: Parameters<typeof this.prisma.user.update>[0]['data'] = {
      email: data.email,
      username: data.username === null ? null : data.username ?? user.username,
      role: data.role,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        memberProfile: {
          upsert: {
            create: {
              displayName:
                data.displayName || data.username || user.email.split('@')[0],
            },
            update: {
              displayName: data.displayName,
            },
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
            authorId: true,
          },
        },
      },
    });

    return {
      ...updated,
      displayName: updated.memberProfile?.displayName ?? null,
      authorId: updated.memberProfile?.authorId ?? null,
      authorName: null,
    };
  }

  async delete(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({ where: { id } });
  }

  async updateRole(userId: string, role: Role): Promise<AdminUserOutput> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        memberProfile: {
          select: {
            displayName: true,
            authorId: true,
          },
        },
      },
    });
    return {
      ...updated,
      displayName: updated.memberProfile?.displayName ?? null,
      authorId: updated.memberProfile?.authorId ?? null,
      authorName: null,
    };
  }
}
