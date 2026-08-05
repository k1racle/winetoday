import type {
  WinemakersHomeConfig,
  WinemakersHomeSectionConfig,
  WinemakersHomeSectionEntity,
} from '~/types/winemakers';

const defaultSections: WinemakersHomeSectionConfig[] = [
  {
    entity: 'person',
    title: 'Виноделы',
    description: 'Новые карточки людей, которые формируют современное российское виноделие.',
    buttonLabel: 'Все виноделы',
    limit: 4,
    enabled: true,
  },
  {
    entity: 'terroir',
    title: 'Терруары',
    description: 'Последние добавленные терруары и территории с собственным винным характером.',
    buttonLabel: 'Все терруары',
    limit: 4,
    enabled: true,
  },
  {
    entity: 'wine',
    title: 'Вина',
    description: 'Последние карточки вин из каталога проекта.',
    buttonLabel: 'Все вина',
    limit: 4,
    enabled: true,
  },
  {
    entity: 'winery',
    title: 'Винодельни',
    description: 'Недавно обновленные винодельни проекта.',
    buttonLabel: 'Все винодельни',
    limit: 4,
    enabled: true,
  },
  {
    entity: 'region',
    title: 'Регионы',
    description: 'Свежие карточки регионов и субрегионов виноделия.',
    buttonLabel: 'Все регионы',
    limit: 4,
    enabled: true,
  },
];

export const defaultWinemakersHomeConfig: WinemakersHomeConfig = {
  intro: {
    eyebrow: 'Спецпроект',
    title: 'Виноделы России',
    description:
      'Каталог людей, хозяйств, регионов и вин, которые формируют современное российское виноделие.',
  },
  sections: defaultSections,
};

const validEntities = new Set<WinemakersHomeSectionEntity>([
  'person',
  'terroir',
  'wine',
  'winery',
  'region',
]);

function cloneSection(section: WinemakersHomeSectionConfig): WinemakersHomeSectionConfig {
  return {
    entity: section.entity,
    title: section.title,
    description: section.description || '',
    buttonLabel: section.buttonLabel,
    limit: section.limit,
    enabled: section.enabled,
  };
}

export function cloneWinemakersHomeConfig(config: WinemakersHomeConfig): WinemakersHomeConfig {
  return {
    intro: {
      eyebrow: config.intro.eyebrow,
      title: config.intro.title,
      description: config.intro.description,
    },
    sections: config.sections.map(cloneSection),
  };
}

export function normalizeWinemakersHomeConfig(input?: unknown): WinemakersHomeConfig {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, any>;
  const intro = raw.intro && typeof raw.intro === 'object' ? raw.intro : {};
  const rawSections = Array.isArray(raw.sections) ? raw.sections : [];

  const normalizedSections = rawSections
    .map((section): WinemakersHomeSectionConfig | null => {
      if (!section || typeof section !== 'object' || !validEntities.has(section.entity)) {
        return null;
      }

      const fallback = defaultSections.find((item) => item.entity === section.entity);
      return {
        entity: section.entity,
        title: typeof section.title === 'string' && section.title.trim()
          ? section.title.trim()
          : fallback?.title || '',
        description: typeof section.description === 'string'
          ? section.description
          : fallback?.description || '',
        buttonLabel: typeof section.buttonLabel === 'string' && section.buttonLabel.trim()
          ? section.buttonLabel.trim()
          : fallback?.buttonLabel || '',
        limit: typeof section.limit === 'number' && Number.isFinite(section.limit)
          ? Math.min(Math.max(Math.round(section.limit), 1), 12)
          : fallback?.limit || 4,
        enabled: section.enabled !== false,
      };
    })
    .filter(Boolean) as WinemakersHomeSectionConfig[];

  const usedEntities = new Set(normalizedSections.map((section) => section.entity));
  const missingSections = defaultSections
    .filter((section) => !usedEntities.has(section.entity))
    .map(cloneSection);

  return {
    intro: {
      eyebrow:
        typeof intro.eyebrow === 'string' && intro.eyebrow.trim()
          ? intro.eyebrow.trim()
          : defaultWinemakersHomeConfig.intro.eyebrow,
      title:
        typeof intro.title === 'string' && intro.title.trim()
          ? intro.title.trim()
          : defaultWinemakersHomeConfig.intro.title,
      description:
        typeof intro.description === 'string' && intro.description.trim()
          ? intro.description.trim()
          : defaultWinemakersHomeConfig.intro.description,
    },
    sections: [...normalizedSections, ...missingSections],
  };
}

export function winemakersSectionPath(entity: WinemakersHomeSectionEntity) {
  if (entity === 'person') return '/winemakers/persons';
  if (entity === 'wine') return '/wines';
  if (entity === 'winery') return '/wineries';
  if (entity === 'terroir') return '/terroirs';
  return '/regions';
}
