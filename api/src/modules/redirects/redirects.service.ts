import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RedirectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const redirects = await this.prisma.slugRedirect.findMany({
      select: { fromPath: true, toPath: true },
      orderBy: { createdAt: 'asc' },
    });
    return redirects;
  }

  async createIfChanged(fromPath: string, toPath: string) {
    if (!fromPath || !toPath || fromPath === toPath) {
      return null;
    }
    return this.prisma.slugRedirect.upsert({
      where: { fromPath },
      update: { toPath },
      create: { fromPath, toPath },
    });
  }
}
