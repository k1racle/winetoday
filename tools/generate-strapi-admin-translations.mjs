import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const packageJsonPath = path.join(backendDir, 'package.json');
const translationsDir = path.join(backendDir, 'src', 'admin', 'translations');
const apiDir = path.join(backendDir, 'src', 'api');

const locales = ['en', 'ru'];

const bundleDefinitions = [
  { prefix: null, source: 'packages/core/admin/admin/src/translations/{locale}.json' },
  { prefix: 'content-manager', source: 'packages/core/content-manager/admin/src/translations/{locale}.json' },
  { prefix: 'content-type-builder', source: 'packages/core/content-type-builder/admin/src/translations/{locale}.json' },
  { prefix: 'upload', source: 'packages/core/upload/admin/src/translations/{locale}.json' },
  { prefix: 'users-permissions', source: 'packages/plugins/users-permissions/admin/src/translations/{locale}.json' },
  { prefix: 'cloud', source: 'packages/plugins/cloud/admin/src/translations/{locale}.json' },
];

function prefixTranslations(translations, prefix) {
  if (!prefix) {
    return translations;
  }

  return Object.fromEntries(Object.entries(translations).map(([key, value]) => [`${prefix}.${key}`, value]));
}

function titleCaseFromKey(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildProjectSpecificTranslations() {
  return {
    en: {
      'Archive settings': 'Archive settings',
      'Articles': 'Articles',
      'Authors': 'Authors',
      'Categories': 'Categories',
      'Events': 'Events',
      'Global settings': 'Global settings',
      'SEO': 'SEO',
      'Grapes': 'Grapes',
      'Homepage': 'Homepage',
      'News': 'News',
      'Pages': 'Pages',
      'Regions': 'Regions',
      'Sidebar': 'Sidebar',
      'Footer': 'Footer',
      'Header': 'Header',
      'Tags': 'Tags',
      'Videos': 'Videos',
      'enableCardEffects': 'Card effects',
      'mobileBottomNav': 'Mobile bottom menu',
      'defaultSeo': 'Default SEO',
      'siteUrl': 'Site URL',
      'openGraphImage': 'Open Graph image',
      'twitterImage': 'Twitter image',
      'robotsEnabled': 'Enable robots.txt',
      'robotsRules': 'Robots rules',
      'robotsHost': 'Robots host',
      'robotsAdditionalSitemaps': 'Additional sitemaps',
      'userAgent': 'User agent',
      'allow': 'Allow paths',
      'disallow': 'Disallow paths',
      'crawlDelay': 'Crawl delay',
      'sitemapEnabled': 'Enable sitemap.xml',
      'sitemapIncludeArticles': 'Include articles in sitemap',
      'sitemapIncludeNews': 'Include news in sitemap',
      'sitemapIncludeEvents': 'Include events in sitemap',
      'sitemapIncludeVideos': 'Include videos in sitemap',
      'sitemapIncludePages': 'Include pages in sitemap',
      'sitemapExcludePaths': 'Exclude paths from sitemap',
      'icon': 'Icon',
      'opensSidebar': 'Open sidebar',
      'vino.color.label': 'Color',
      'vino.color.description': 'Pick a color from the palette or enter a HEX/RGBA value manually.',
    },
    ru: {
      'Archive settings': 'Настройки архивов',
      'Articles': 'Статьи',
      'Authors': 'Авторы',
      'Categories': 'Категории',
      'Events': 'События',
      'Global settings': 'Глобальные настройки',
      'SEO': 'SEO',
      'Grapes': 'Сорта винограда',
      'Homepage': 'Главная страница',
      'News': 'Новости',
      'Pages': 'Страницы',
      'Regions': 'Регионы',
      'Sidebar': 'Сайдбар',
      'Footer': 'Футер',
      'Header': 'Хедер',
      'Tags': 'Теги',
      'Videos': 'Видео',
      'enableCardEffects': 'Эффекты карточек',
      'mobileBottomNav': 'Нижнее мобильное меню',
      'defaultSeo': 'SEO по умолчанию',
      'siteUrl': 'Адрес сайта',
      'openGraphImage': 'Изображение Open Graph',
      'twitterImage': 'Изображение Twitter',
      'robotsEnabled': 'Включить robots.txt',
      'robotsRules': 'Правила robots',
      'robotsHost': 'Host для robots',
      'robotsAdditionalSitemaps': 'Дополнительные sitemap',
      'userAgent': 'User-agent',
      'allow': 'Разрешённые пути',
      'disallow': 'Запрещённые пути',
      'crawlDelay': 'Задержка обхода',
      'sitemapEnabled': 'Включить sitemap.xml',
      'sitemapIncludeArticles': 'Включать статьи в sitemap',
      'sitemapIncludeNews': 'Включать новости в sitemap',
      'sitemapIncludeEvents': 'Включать события в sitemap',
      'sitemapIncludeVideos': 'Включать видео в sitemap',
      'sitemapIncludePages': 'Включать страницы в sitemap',
      'sitemapExcludePaths': 'Исключить пути из sitemap',
      'icon': 'Иконка',
      'opensSidebar': 'Открывать сайдбар',
      'vino.color.label': 'Цвет',
      'vino.color.description': 'Выберите цвет из палитры или введите HEX/RGBA вручную.',
    },
  };
}

async function readJsonSafe(targetPath) {
  try {
    return JSON.parse(await readFile(targetPath, 'utf8'));
  } catch {
    return null;
  }
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function buildApiTranslations(locale) {
  const translations = {};
  const apiEntries = await readdir(apiDir);
  const projectTranslations = buildProjectSpecificTranslations()[locale];

  for (const entry of apiEntries) {
    const schemaPath = path.join(apiDir, entry, 'content-types', entry, 'schema.json');
    const schema = await readJsonSafe(schemaPath);

    if (!schema) {
      continue;
    }

    const uid = `api::${entry}.${entry}`;
    const singularName = schema.info?.singularName ?? entry;
    const displayName = schema.info?.displayName;

    if (displayName) {
      translations[displayName] = projectTranslations[displayName] ?? displayName;
    }

    for (const [attributeName, attribute] of Object.entries(schema.attributes ?? {})) {
      const defaultLabel = attribute?.displayName ?? titleCaseFromKey(attributeName);
      const translationKey = `content-manager.content-types.${uid}.${singularName}.${attributeName}`;
      translations[translationKey] = projectTranslations[attributeName] ?? projectTranslations[defaultLabel] ?? defaultLabel;
    }
  }

  return translations;
}

async function buildLocaleTranslations(locale, ref) {
  const bundles = await Promise.all(
    bundleDefinitions.map(async ({ prefix, source }) => {
      const url = `https://raw.githubusercontent.com/strapi/strapi/${ref}/${source.replace('{locale}', locale)}`;
      const translations = await fetchJson(url);
      return prefixTranslations(translations, prefix);
    }),
  );

  const projectTranslations = buildProjectSpecificTranslations()[locale];
  const apiTranslations = await buildApiTranslations(locale);

  return Object.assign({}, ...bundles, projectTranslations, apiTranslations);
}

async function main() {
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const strapiVersion = packageJson.dependencies['@strapi/strapi'];
  const ref = `v${strapiVersion}`;

  await mkdir(translationsDir, { recursive: true });

  for (const locale of locales) {
    const translations = await buildLocaleTranslations(locale, ref);
    const outputPath = path.join(translationsDir, `${locale}.json`);
    await writeFile(outputPath, `${JSON.stringify(translations, null, 2)}\n`, 'utf8');
    console.log(`Generated ${outputPath}`);
    console.log(`${locale} keys: ${Object.keys(translations).length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
