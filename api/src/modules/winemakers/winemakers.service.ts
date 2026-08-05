import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentStatus,
  PersonRelationType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListWinemakersDto } from './dto/list-winemakers.dto';
import { ListWinesDto } from './dto/list-wines.dto';
import { ListWineriesDto } from './dto/list-wineries.dto';
import { ListRegionsDto } from './dto/list-regions.dto';
import { ListTerroirsDto } from './dto/list-terroirs.dto';
import { SearchWinepediaDto } from './dto/search-winepedia.dto';
import { SavePersonDto } from './dto/save-person.dto';
import { SaveWineDto } from './dto/save-wine.dto';
import { SaveRegionDto } from './dto/save-region.dto';
import { SaveTerroirDto } from './dto/save-terroir.dto';
import { SaveWineryDto } from './dto/save-winery.dto';

const publishedStatus = ContentStatus.published;
const contentStatuses = new Set(Object.values(ContentStatus));
const relationTypes = new Set(Object.values(PersonRelationType));

const personCardSelect = Prisma.validator<Prisma.PersonSelect>()({
  id: true,
  slug: true,
  name: true,
  summary: true,
  birthYear: true,
  deathYear: true,
  featured: true,
  updatedAt: true,
  photo: true,
  winery: {
    select: {
      id: true,
      slug: true,
      name: true,
      region: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  },
});

const wineCardSelect = Prisma.validator<Prisma.WineSelect>()({
  id: true,
  slug: true,
  name: true,
  summary: true,
  type: true,
  style: true,
  vintage: true,
  updatedAt: true,
  winery: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  region: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  terroir: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
});

const mapPersonSelect = Prisma.validator<Prisma.PersonSelect>()({
  id: true,
  slug: true,
  name: true,
});

const adminOptionSelect = {
  id: true,
  slug: true,
  name: true,
  status: true,
} as const;

const adminPersonListSelect = Prisma.validator<Prisma.PersonSelect>()({
  id: true,
  slug: true,
  name: true,
  summary: true,
  birthYear: true,
  deathYear: true,
  featured: true,
  sortOrder: true,
  status: true,
  updatedAt: true,
  photo: true,
  winery: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
});

const adminWineListSelect = Prisma.validator<Prisma.WineSelect>()({
  id: true,
  slug: true,
  name: true,
  summary: true,
  type: true,
  style: true,
  vintage: true,
  status: true,
  updatedAt: true,
  winery: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  region: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  terroir: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
});

const adminRegionListSelect = Prisma.validator<Prisma.RegionSelect>()({
  id: true,
  slug: true,
  name: true,
  summary: true,
  climate: true,
  soil: true,
  lat: true,
  lng: true,
  status: true,
  updatedAt: true,
  parentId: true,
  parent: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
});

const adminTerroirListSelect = Prisma.validator<Prisma.TerroirSelect>()({
  id: true,
  slug: true,
  name: true,
  summary: true,
  exposition: true,
  elevationM: true,
  soil: true,
  lat: true,
  lng: true,
  status: true,
  updatedAt: true,
  region: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
});

const adminWineryListSelect = Prisma.validator<Prisma.WinerySelect>()({
  id: true,
  slug: true,
  name: true,
  summary: true,
  foundedYear: true,
  lat: true,
  lng: true,
  status: true,
  updatedAt: true,
  logo: true,
  region: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
});

@Injectable()
export class WinemakersService {
  constructor(private readonly prisma: PrismaService) {}

  async listPersons(dto: ListWinemakersDto) {
    const where: Prisma.PersonWhereInput = {
      status: publishedStatus,
    };
    const wineryWhere: Prisma.WineryWhereInput = {
      status: publishedStatus,
    };

    if (dto.featured !== undefined) {
      where.featured = dto.featured;
    }

    if (dto.winerySlug) {
      wineryWhere.slug = dto.winerySlug;
    }

    if (dto.regionSlug) {
      wineryWhere.region = { is: { slug: dto.regionSlug, status: publishedStatus } };
    }

    if (dto.winerySlug || dto.regionSlug) {
      where.winery = { is: wineryWhere };
    }

    if (dto.q?.trim()) {
      const term = dto.q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { summary: { contains: term, mode: 'insensitive' } },
        { winery: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const orderBy =
      dto.sort === 'latest'
        ? [{ updatedAt: 'desc' as const }, { name: 'asc' as const }]
        : [
            { featured: 'desc' as const },
            { sortOrder: 'asc' as const },
            { updatedAt: 'desc' as const },
            { name: 'asc' as const },
          ];

    const [items, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        select: personCardSelect,
        orderBy,
        skip: dto.offset,
        take: dto.limit,
      }),
      this.prisma.person.count({ where }),
    ]);

    return { items, total, limit: dto.limit, offset: dto.offset };
  }

  async personBySlug(slug: string) {
    const item = await this.prisma.person.findUnique({
      where: { slug },
      include: {
        photo: true,
        winery: {
          include: {
            logo: true,
            region: true,
          },
        },
        relationsFrom: {
          include: {
            related: {
              select: personCardSelect,
            },
          },
          orderBy: [{ type: 'asc' }, { related: { name: 'asc' } }],
        },
        relationsTo: {
          include: {
            person: {
              select: personCardSelect,
            },
          },
          orderBy: [{ type: 'asc' }, { person: { name: 'asc' } }],
        },
        wines: {
          include: {
            wine: {
              select: wineCardSelect,
            },
          },
          orderBy: { wine: { updatedAt: 'desc' } },
        },
      },
    });

    if (!item || item.status !== publishedStatus) {
      throw new NotFoundException('Winemaker not found');
    }

    return item;
  }

  async listWines(dto: ListWinesDto) {
    const where: Prisma.WineWhereInput = {
      status: publishedStatus,
    };

    if (dto.type) {
      where.type = dto.type;
    }

    if (dto.style) {
      where.style = dto.style;
    }

    if (dto.winerySlug) {
      where.winery = { slug: dto.winerySlug, status: publishedStatus };
    }

    if (dto.regionSlug) {
      where.region = { slug: dto.regionSlug, status: publishedStatus };
    }

    if (dto.personSlug) {
      where.winemakers = {
        some: {
          person: {
            slug: dto.personSlug,
            status: publishedStatus,
          },
        },
      };
    }

    if (typeof dto.vintage === 'number' && !Number.isNaN(dto.vintage)) {
      where.vintage = dto.vintage;
    }

    if (dto.q?.trim()) {
      const term = dto.q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { summary: { contains: term, mode: 'insensitive' } },
        { winery: { name: { contains: term, mode: 'insensitive' } } },
        { region: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.wine.findMany({
        where,
        select: wineCardSelect,
        orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
        skip: dto.offset,
        take: dto.limit,
      }),
      this.prisma.wine.count({ where }),
    ]);

    return { items, total, limit: dto.limit, offset: dto.offset };
  }

  async wineBySlug(slug: string) {
    const item = await this.prisma.wine.findUnique({
      where: { slug },
      include: {
        winery: {
          include: {
            logo: true,
            region: true,
          },
        },
        region: true,
        terroir: true,
        winemakers: {
          include: {
            person: {
              select: personCardSelect,
            },
          },
          orderBy: { person: { name: 'asc' } },
        },
      },
    });

    if (!item || item.status !== publishedStatus) {
      throw new NotFoundException('Wine not found');
    }

    return item;
  }

  async listRegions(dto: ListRegionsDto) {
    const where: Prisma.RegionWhereInput = {
      status: publishedStatus,
    };

    if (dto.q?.trim()) {
      const term = dto.q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { summary: { contains: term, mode: 'insensitive' } },
      ];
    }

    return this.prisma.region.findMany({
      where,
      take: dto.limit,
      orderBy:
        dto.sort === 'latest'
          ? [{ updatedAt: 'desc' }, { name: 'asc' }]
          : [{ parentId: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        summary: true,
        parentId: true,
        updatedAt: true,
        _count: {
          select: {
            wineries: {
              where: { status: publishedStatus },
            },
            wines: {
              where: { status: publishedStatus },
            },
            terroirs: {
              where: { status: publishedStatus },
            },
          },
        },
      },
    });
  }

  async regionBySlug(slug: string) {
    const item = await this.prisma.region.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { status: publishedStatus },
          orderBy: { name: 'asc' },
        },
        wineries: {
          where: { status: publishedStatus },
          include: {
            logo: true,
            persons: {
              where: { status: publishedStatus },
              select: personCardSelect,
              take: 6,
            },
          },
          orderBy: { name: 'asc' },
        },
        wines: {
          where: { status: publishedStatus },
          select: wineCardSelect,
          take: 12,
          orderBy: { updatedAt: 'desc' },
        },
        terroirs: {
          where: { status: publishedStatus },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!item || item.status !== publishedStatus) {
      throw new NotFoundException('Region not found');
    }

    return item;
  }

  async regionsMap() {
    const [regions, terroirs] = await Promise.all([
      this.prisma.region.findMany({
        where: {
          status: publishedStatus,
          lat: { not: null },
          lng: { not: null },
        },
        orderBy: [{ name: 'asc' }],
        select: {
          id: true,
          slug: true,
          name: true,
          summary: true,
          lat: true,
          lng: true,
          _count: {
            select: {
              wineries: {
                where: { status: publishedStatus },
              },
              wines: {
                where: { status: publishedStatus },
              },
              terroirs: {
                where: { status: publishedStatus },
              },
            },
          },
          wineries: {
            where: { status: publishedStatus },
            take: 6,
            orderBy: [{ name: 'asc' }],
            select: {
              persons: {
                where: { status: publishedStatus },
                take: 3,
                orderBy: [{ featured: 'desc' }, { name: 'asc' }],
                select: mapPersonSelect,
              },
            },
          },
        },
      }),
      this.prisma.terroir.findMany({
        where: {
          status: publishedStatus,
          lat: { not: null },
          lng: { not: null },
        },
        orderBy: [{ name: 'asc' }],
        select: {
          id: true,
          slug: true,
          name: true,
          summary: true,
          lat: true,
          lng: true,
          region: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
          _count: {
            select: {
              wines: {
                where: { status: publishedStatus },
              },
            },
          },
          wines: {
            where: { status: publishedStatus },
            take: 6,
            orderBy: [{ updatedAt: 'desc' }],
            select: {
              winemakers: {
                take: 3,
                orderBy: [{ person: { featured: 'desc' } }, { person: { name: 'asc' } }],
                select: {
                  person: {
                    select: mapPersonSelect,
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      regions: regions.map((region) => ({
        id: region.id,
        slug: region.slug,
        name: region.name,
        summary: region.summary,
        lat: region.lat,
        lng: region.lng,
        wineryCount: region._count.wineries,
        wineCount: region._count.wines,
        terroirCount: region._count.terroirs,
        persons: this.uniqueMapPersons(
          region.wineries.flatMap((winery) => winery.persons),
        ),
      })),
      terroirs: terroirs.map((terroir) => ({
        id: terroir.id,
        slug: terroir.slug,
        name: terroir.name,
        summary: terroir.summary,
        lat: terroir.lat,
        lng: terroir.lng,
        region: terroir.region,
        wineCount: terroir._count.wines,
        persons: this.uniqueMapPersons(
          terroir.wines.flatMap((wine) =>
            wine.winemakers.map((entry) => entry.person),
          ),
        ),
      })),
    };
  }

  async listWineries(dto: ListWineriesDto) {
    const where: Prisma.WineryWhereInput = {
      status: publishedStatus,
    };

    if (dto.regionSlug) {
      where.region = { slug: dto.regionSlug, status: publishedStatus };
    }

    if (dto.q?.trim()) {
      const term = dto.q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { summary: { contains: term, mode: 'insensitive' } },
        { region: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.winery.findMany({
        where,
        include: {
          logo: true,
          region: true,
          _count: {
            select: {
              persons: { where: { status: publishedStatus } },
              wines: { where: { status: publishedStatus } },
            },
          },
        },
        orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
        skip: dto.offset,
        take: dto.limit,
      }),
      this.prisma.winery.count({ where }),
    ]);

    return { items, total, limit: dto.limit, offset: dto.offset };
  }

  async wineryBySlug(slug: string) {
    const item = await this.prisma.winery.findUnique({
      where: { slug },
      include: {
        logo: true,
        region: true,
        persons: {
          where: { status: publishedStatus },
          select: personCardSelect,
          orderBy: [{ featured: 'desc' }, { name: 'asc' }],
        },
        wines: {
          where: { status: publishedStatus },
          select: wineCardSelect,
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!item || item.status !== publishedStatus) {
      throw new NotFoundException('Winery not found');
    }

    return item;
  }

  async terroirBySlug(slug: string) {
    const item = await this.prisma.terroir.findUnique({
      where: { slug },
      include: {
        region: true,
        wines: {
          where: { status: publishedStatus },
          select: wineCardSelect,
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!item || item.status !== publishedStatus) {
      throw new NotFoundException('Terroir not found');
    }

    return item;
  }

  async listTerroirs(dto: ListTerroirsDto) {
    const where: Prisma.TerroirWhereInput = {
      status: publishedStatus,
    };

    if (dto.regionSlug) {
      where.region = { slug: dto.regionSlug, status: publishedStatus };
    }

    if (dto.q?.trim()) {
      const term = dto.q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { summary: { contains: term, mode: 'insensitive' } },
        { region: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.terroir.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          summary: true,
          exposition: true,
          elevationM: true,
          soil: true,
          updatedAt: true,
          region: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
        },
        orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
        skip: dto.offset,
        take: dto.limit,
      }),
      this.prisma.terroir.count({ where }),
    ]);

    return { items, total, limit: dto.limit, offset: dto.offset };
  }

  async search(dto: SearchWinepediaDto) {
    const q = dto.q?.trim();
    if (!q || q.length < 2) {
      return {
        q: q || '',
        persons: [],
        wines: [],
        regions: [],
        wineries: [],
      };
    }

    const [persons, wines, regions, wineries] = await Promise.all([
      this.prisma.person.findMany({
        where: {
          status: publishedStatus,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: personCardSelect,
        take: dto.limit,
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.wine.findMany({
        where: {
          status: publishedStatus,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: wineCardSelect,
        take: dto.limit,
        orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.region.findMany({
        where: {
          status: publishedStatus,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: dto.limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          summary: true,
          parentId: true,
        },
      }),
      this.prisma.winery.findMany({
        where: {
          status: publishedStatus,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: dto.limit,
        orderBy: { name: 'asc' },
        include: {
          logo: true,
          region: true,
        },
      }),
    ]);

    return { q, persons, wines, regions, wineries };
  }

  async listAdminOptions() {
    const [persons, wines, regions, terroirs, wineries] = await Promise.all([
      this.prisma.person.findMany({
        select: adminOptionSelect,
        orderBy: [{ name: 'asc' }],
      }),
      this.prisma.wine.findMany({
        select: adminOptionSelect,
        orderBy: [{ name: 'asc' }],
      }),
      this.prisma.region.findMany({
        select: adminOptionSelect,
        orderBy: [{ name: 'asc' }],
      }),
      this.prisma.terroir.findMany({
        select: adminOptionSelect,
        orderBy: [{ name: 'asc' }],
      }),
      this.prisma.winery.findMany({
        select: adminOptionSelect,
        orderBy: [{ name: 'asc' }],
      }),
    ]);

    return { persons, wines, regions, terroirs, wineries };
  }

  async listAdminPersons() {
    return this.prisma.person.findMany({
      select: adminPersonListSelect,
      orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
    });
  }

  async personById(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        photo: true,
        winery: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        relationsFrom: {
          include: {
            related: {
              select: adminOptionSelect,
            },
          },
          orderBy: [{ type: 'asc' }, { related: { name: 'asc' } }],
        },
        wines: {
          include: {
            wine: {
              select: adminOptionSelect,
            },
          },
          orderBy: { wine: { name: 'asc' } },
        },
      },
    });

    if (!person) {
      throw new NotFoundException('Winemaker not found');
    }

    return person;
  }

  async createPerson(dto: SavePersonDto) {
    await this.ensureUniqueSlug('person', dto.slug);
    const created = await this.prisma.person.create({
      data: this.buildPersonCreateData(dto),
    });

    await this.syncPersonRelations(created.id, dto.relations || []);
    return this.personById(created.id);
  }

  async updatePerson(id: string, dto: SavePersonDto) {
    await this.ensureEntityExists('person', id);
    await this.ensureUniqueSlug('person', dto.slug, id);
    await this.prisma.person.update({
      where: { id },
      data: this.buildPersonUpdateData(dto),
    });
    await this.syncPersonRelations(id, dto.relations || []);
    return this.personById(id);
  }

  async deletePerson(id: string) {
    await this.ensureEntityExists('person', id);
    await this.prisma.person.delete({ where: { id } });
    return { success: true };
  }

  async listAdminWines() {
    return this.prisma.wine.findMany({
      select: adminWineListSelect,
      orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
    });
  }

  async wineById(id: string) {
    const wine = await this.prisma.wine.findUnique({
      where: { id },
      include: {
        winery: {
          select: adminOptionSelect,
        },
        region: {
          select: adminOptionSelect,
        },
        terroir: {
          select: adminOptionSelect,
        },
        winemakers: {
          include: {
            person: {
              select: adminOptionSelect,
            },
          },
          orderBy: { person: { name: 'asc' } },
        },
      },
    });

    if (!wine) {
      throw new NotFoundException('Wine not found');
    }

    return wine;
  }

  async createWine(dto: SaveWineDto) {
    await this.ensureUniqueSlug('wine', dto.slug);
    const created = await this.prisma.wine.create({
      data: this.buildWineCreateData(dto),
    });
    await this.syncWineWinemakers(created.id, dto.winemakers || []);
    return this.wineById(created.id);
  }

  async updateWine(id: string, dto: SaveWineDto) {
    await this.ensureEntityExists('wine', id);
    await this.ensureUniqueSlug('wine', dto.slug, id);
    await this.prisma.wine.update({
      where: { id },
      data: this.buildWineUpdateData(dto),
    });
    await this.syncWineWinemakers(id, dto.winemakers || []);
    return this.wineById(id);
  }

  async deleteWine(id: string) {
    await this.ensureEntityExists('wine', id);
    await this.prisma.wine.delete({ where: { id } });
    return { success: true };
  }

  async listAdminRegions() {
    return this.prisma.region.findMany({
      select: adminRegionListSelect,
      orderBy: [{ name: 'asc' }],
    });
  }

  async regionById(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: {
        parent: {
          select: adminOptionSelect,
        },
        children: {
          select: adminOptionSelect,
          orderBy: { name: 'asc' },
        },
        terroirs: {
          select: adminOptionSelect,
          orderBy: { name: 'asc' },
        },
        wineries: {
          select: adminOptionSelect,
          orderBy: { name: 'asc' },
        },
        wines: {
          select: adminOptionSelect,
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    return region;
  }

  async createRegion(dto: SaveRegionDto) {
    await this.ensureUniqueSlug('region', dto.slug);
    const created = await this.prisma.region.create({
      data: this.buildRegionCreateData(dto),
    });
    return this.regionById(created.id);
  }

  async updateRegion(id: string, dto: SaveRegionDto) {
    await this.ensureEntityExists('region', id);
    await this.ensureUniqueSlug('region', dto.slug, id);
    await this.prisma.region.update({
      where: { id },
      data: this.buildRegionUpdateData(dto, id),
    });
    return this.regionById(id);
  }

  async deleteRegion(id: string) {
    await this.ensureEntityExists('region', id);
    const counts = await this.prisma.region.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            children: true,
            terroirs: true,
            wineries: true,
            wines: true,
          },
        },
      },
    });

    if (
      !counts ||
      counts._count.children > 0 ||
      counts._count.terroirs > 0 ||
      counts._count.wineries > 0 ||
      counts._count.wines > 0
    ) {
      throw new BadRequestException(
        'Region has linked subregions, terroirs, wineries or wines',
      );
    }

    await this.prisma.region.delete({ where: { id } });
    return { success: true };
  }

  async listAdminTerroirs() {
    return this.prisma.terroir.findMany({
      select: adminTerroirListSelect,
      orderBy: [{ name: 'asc' }],
    });
  }

  async terroirById(id: string) {
    const terroir = await this.prisma.terroir.findUnique({
      where: { id },
      include: {
        region: {
          select: adminOptionSelect,
        },
        wines: {
          select: adminOptionSelect,
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!terroir) {
      throw new NotFoundException('Terroir not found');
    }

    return terroir;
  }

  async createTerroir(dto: SaveTerroirDto) {
    await this.ensureUniqueSlug('terroir', dto.slug);
    const created = await this.prisma.terroir.create({
      data: this.buildTerroirCreateData(dto),
    });
    return this.terroirById(created.id);
  }

  async updateTerroir(id: string, dto: SaveTerroirDto) {
    await this.ensureEntityExists('terroir', id);
    await this.ensureUniqueSlug('terroir', dto.slug, id);
    await this.prisma.terroir.update({
      where: { id },
      data: this.buildTerroirUpdateData(dto),
    });
    return this.terroirById(id);
  }

  async deleteTerroir(id: string) {
    await this.ensureEntityExists('terroir', id);
    const counts = await this.prisma.terroir.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            wines: true,
          },
        },
      },
    });

    if (!counts || counts._count.wines > 0) {
      throw new BadRequestException('Terroir has linked wines');
    }

    await this.prisma.terroir.delete({ where: { id } });
    return { success: true };
  }

  async listAdminWineries() {
    return this.prisma.winery.findMany({
      select: adminWineryListSelect,
      orderBy: [{ name: 'asc' }],
    });
  }

  async wineryById(id: string) {
    const winery = await this.prisma.winery.findUnique({
      where: { id },
      include: {
        logo: true,
        region: {
          select: adminOptionSelect,
        },
        persons: {
          select: adminOptionSelect,
          orderBy: { name: 'asc' },
        },
        wines: {
          select: adminOptionSelect,
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!winery) {
      throw new NotFoundException('Winery not found');
    }

    return winery;
  }

  async createWinery(dto: SaveWineryDto) {
    await this.ensureUniqueSlug('winery', dto.slug);
    const created = await this.prisma.winery.create({
      data: this.buildWineryCreateData(dto),
    });
    return this.wineryById(created.id);
  }

  async updateWinery(id: string, dto: SaveWineryDto) {
    await this.ensureEntityExists('winery', id);
    await this.ensureUniqueSlug('winery', dto.slug, id);
    await this.prisma.winery.update({
      where: { id },
      data: this.buildWineryUpdateData(dto),
    });
    return this.wineryById(id);
  }

  async deleteWinery(id: string) {
    await this.ensureEntityExists('winery', id);
    const counts = await this.prisma.winery.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            persons: true,
            wines: true,
          },
        },
      },
    });

    if (!counts || counts._count.persons > 0 || counts._count.wines > 0) {
      throw new BadRequestException('Winery has linked winemakers or wines');
    }

    await this.prisma.winery.delete({ where: { id } });
    return { success: true };
  }

  private sanitizeStatus(status?: string): ContentStatus {
    if (status && contentStatuses.has(status as ContentStatus)) {
      return status as ContentStatus;
    }
    return ContentStatus.draft;
  }

  private sanitizeRelationType(type: string): PersonRelationType {
    if (relationTypes.has(type as PersonRelationType)) {
      return type as PersonRelationType;
    }
    return PersonRelationType.founder;
  }

  private normalizeString(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeUuid(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeBlocks(value?: any[]) {
    return Array.isArray(value) ? value : [];
  }

  private normalizeSeo(value?: Record<string, any>) {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const title = this.normalizeString(value.title);
    const description = this.normalizeString(value.description);
    const keywords = this.normalizeString(value.keywords);

    if (!title && !description && !keywords) {
      return Prisma.JsonNull;
    }

    return {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(keywords ? { keywords } : {}),
    };
  }

  private buildPersonBaseData(dto: SavePersonDto) {
    return {
      name: dto.name.trim(),
      slug: dto.slug.trim(),
      summary: this.normalizeString(dto.summary),
      birthYear: dto.birthYear ?? null,
      deathYear: dto.deathYear ?? null,
      photoId: this.normalizeUuid(dto.photoId),
      wineryId: this.normalizeUuid(dto.wineryId),
      featured: Boolean(dto.featured),
      sortOrder: dto.sortOrder ?? 0,
      bioBlocks: this.normalizeBlocks(dto.bioBlocks),
      career: (Array.isArray(dto.career) ? dto.career : []) as unknown as Prisma.InputJsonValue,
      seo: this.normalizeSeo(dto.seo),
      status: this.sanitizeStatus(dto.status),
    };
  }

  private buildPersonCreateData(dto: SavePersonDto): Prisma.PersonUncheckedCreateInput {
    return this.buildPersonBaseData(dto) as Prisma.PersonUncheckedCreateInput;
  }

  private buildPersonUpdateData(dto: SavePersonDto): Prisma.PersonUncheckedUpdateInput {
    return this.buildPersonBaseData(dto) as Prisma.PersonUncheckedUpdateInput;
  }

  private buildWineBaseData(dto: SaveWineDto) {
    return {
      name: dto.name.trim(),
      slug: dto.slug.trim(),
      summary: this.normalizeString(dto.summary),
      type: this.normalizeString(dto.type),
      style: this.normalizeString(dto.style),
      vintage: dto.vintage ?? null,
      grapes: Array.isArray(dto.grapes)
        ? dto.grapes.map((item) => item?.trim()).filter(Boolean)
        : [],
      wineryId: this.normalizeUuid(dto.wineryId),
      regionId: this.normalizeUuid(dto.regionId),
      terroirId: this.normalizeUuid(dto.terroirId),
      description: this.normalizeBlocks(dto.description),
      seo: this.normalizeSeo(dto.seo),
      status: this.sanitizeStatus(dto.status),
    };
  }

  private buildWineCreateData(dto: SaveWineDto): Prisma.WineUncheckedCreateInput {
    return this.buildWineBaseData(dto) as Prisma.WineUncheckedCreateInput;
  }

  private buildWineUpdateData(dto: SaveWineDto): Prisma.WineUncheckedUpdateInput {
    return this.buildWineBaseData(dto) as Prisma.WineUncheckedUpdateInput;
  }

  private buildRegionBaseData(dto: SaveRegionDto, currentId?: string) {
    const parentId = this.normalizeUuid(dto.parentId);
    return {
      name: dto.name.trim(),
      slug: dto.slug.trim(),
      summary: this.normalizeString(dto.summary),
      parentId: parentId && parentId !== currentId ? parentId : null,
      description: this.normalizeBlocks(dto.description),
      climate: this.normalizeString(dto.climate),
      soil: this.normalizeString(dto.soil),
      lat: typeof dto.lat === 'number' ? dto.lat : null,
      lng: typeof dto.lng === 'number' ? dto.lng : null,
      seo: this.normalizeSeo(dto.seo),
      status: this.sanitizeStatus(dto.status),
    };
  }

  private buildRegionCreateData(dto: SaveRegionDto): Prisma.RegionUncheckedCreateInput {
    return this.buildRegionBaseData(dto) as Prisma.RegionUncheckedCreateInput;
  }

  private buildRegionUpdateData(dto: SaveRegionDto, currentId?: string): Prisma.RegionUncheckedUpdateInput {
    return this.buildRegionBaseData(dto, currentId) as Prisma.RegionUncheckedUpdateInput;
  }

  private buildTerroirBaseData(dto: SaveTerroirDto) {
    return {
      name: dto.name.trim(),
      slug: dto.slug.trim(),
      regionId: dto.regionId,
      summary: this.normalizeString(dto.summary),
      exposition: this.normalizeString(dto.exposition),
      elevationM: dto.elevationM ?? null,
      soil: this.normalizeString(dto.soil),
      description: this.normalizeBlocks(dto.description),
      lat: typeof dto.lat === 'number' ? dto.lat : null,
      lng: typeof dto.lng === 'number' ? dto.lng : null,
      seo: this.normalizeSeo(dto.seo),
      status: this.sanitizeStatus(dto.status),
    };
  }

  private buildTerroirCreateData(dto: SaveTerroirDto): Prisma.TerroirUncheckedCreateInput {
    return this.buildTerroirBaseData(dto) as Prisma.TerroirUncheckedCreateInput;
  }

  private buildTerroirUpdateData(dto: SaveTerroirDto): Prisma.TerroirUncheckedUpdateInput {
    return this.buildTerroirBaseData(dto) as Prisma.TerroirUncheckedUpdateInput;
  }

  private buildWineryBaseData(dto: SaveWineryDto) {
    return {
      name: dto.name.trim(),
      slug: dto.slug.trim(),
      summary: this.normalizeString(dto.summary),
      foundedYear: dto.foundedYear ?? null,
      regionId: this.normalizeUuid(dto.regionId),
      logoId: this.normalizeUuid(dto.logoId),
      description: this.normalizeBlocks(dto.description),
      lat: typeof dto.lat === 'number' ? dto.lat : null,
      lng: typeof dto.lng === 'number' ? dto.lng : null,
      seo: this.normalizeSeo(dto.seo),
      status: this.sanitizeStatus(dto.status),
    };
  }

  private buildWineryCreateData(dto: SaveWineryDto): Prisma.WineryUncheckedCreateInput {
    return this.buildWineryBaseData(dto) as Prisma.WineryUncheckedCreateInput;
  }

  private buildWineryUpdateData(dto: SaveWineryDto): Prisma.WineryUncheckedUpdateInput {
    return this.buildWineryBaseData(dto) as Prisma.WineryUncheckedUpdateInput;
  }

  private async syncPersonRelations(
    personId: string,
    relations: Array<{ relatedId: string; type: string }>,
  ) {
    await this.prisma.personRelation.deleteMany({
      where: { personId },
    });

    const payload = relations
      .filter((item) => item?.relatedId && item.relatedId !== personId)
      .map((item) => ({
        personId,
        relatedId: item.relatedId,
        type: this.sanitizeRelationType(item.type),
      }));

    if (payload.length) {
      await this.prisma.personRelation.createMany({
        data: payload,
        skipDuplicates: true,
      });
    }
  }

  private async syncWineWinemakers(
    wineId: string,
    winemakers: Array<{ personId: string; role?: string }>,
  ) {
    await this.prisma.winePerson.deleteMany({
      where: { wineId },
    });

    const payload = winemakers
      .filter((item) => item?.personId)
      .map((item) => ({
        wineId,
        personId: item.personId,
        role: this.normalizeString(item.role),
      }));

    if (payload.length) {
      await this.prisma.winePerson.createMany({
        data: payload,
        skipDuplicates: true,
      });
    }
  }

  private async ensureEntityExists(
    entity: 'person' | 'wine' | 'region' | 'terroir' | 'winery',
    id: string,
  ) {
    let record: { id: string } | null = null;
    if (entity === 'person') {
      record = await this.prisma.person.findUnique({ where: { id }, select: { id: true } });
    } else if (entity === 'wine') {
      record = await this.prisma.wine.findUnique({ where: { id }, select: { id: true } });
    } else if (entity === 'region') {
      record = await this.prisma.region.findUnique({ where: { id }, select: { id: true } });
    } else if (entity === 'terroir') {
      record = await this.prisma.terroir.findUnique({ where: { id }, select: { id: true } });
    } else {
      record = await this.prisma.winery.findUnique({ where: { id }, select: { id: true } });
    }

    if (!record) {
      throw new NotFoundException(`${entity} not found`);
    }
  }

  private async ensureUniqueSlug(
    entity: 'person' | 'wine' | 'region' | 'terroir' | 'winery',
    slug: string,
    currentId?: string,
  ) {
    const normalizedSlug = slug.trim();
    let existing: { id: string } | null = null;
    if (entity === 'person') {
      existing = await this.prisma.person.findUnique({ where: { slug: normalizedSlug }, select: { id: true } });
    } else if (entity === 'wine') {
      existing = await this.prisma.wine.findUnique({ where: { slug: normalizedSlug }, select: { id: true } });
    } else if (entity === 'region') {
      existing = await this.prisma.region.findUnique({ where: { slug: normalizedSlug }, select: { id: true } });
    } else if (entity === 'terroir') {
      existing = await this.prisma.terroir.findUnique({ where: { slug: normalizedSlug }, select: { id: true } });
    } else {
      existing = await this.prisma.winery.findUnique({ where: { slug: normalizedSlug }, select: { id: true } });
    }

    if (existing && existing.id !== currentId) {
      throw new BadRequestException('Slug already exists');
    }
  }

  private uniqueMapPersons(
    persons: Array<{ id: string; slug: string; name: string }>,
  ) {
    const seen = new Set<string>();
    return persons
      .filter((person) => {
        if (!person?.id || seen.has(person.id)) {
          return false;
        }
        seen.add(person.id);
        return true;
      })
      .slice(0, 3);
  }
}
