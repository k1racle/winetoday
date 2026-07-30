import type { ContentItem } from '~/types/content';

interface ContentSeo extends ContentItem {
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  } | null;
}

const SITE_DESCRIPTION =
  'Федеральное отраслевое медиа о виноделии, виноградарстве и винной культуре в России и мире.';

export function useContentSeo(item: ContentItem | ContentSeo | null | undefined) {
  const route = useRoute();
  const config = useRuntimeConfig();

  if (!item) return;

  const extended = item as ContentSeo;
  const title = extended.seo?.metaTitle || item.title;
  const description = extended.seo?.metaDescription || item.excerpt || SITE_DESCRIPTION;
  const siteUrl = (config.public.siteUrl as string)?.replace(/\/$/, '') || '';
  const canonicalUrl = `${siteUrl}${route.path}`;

  const isPreview = route.query.preview === '1' || route.query.preview === 'true';

  const coverUrl = item.coverMedia?.path ? useMediaUrl(item.coverMedia.path) : '';
  const ogImageUrl = useOgImageUrl(coverUrl);

  useSeoMeta({
    title,
    description,
    robots: isPreview ? 'noindex' : undefined,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalUrl,
    ogType: 'article',
    ogImage: ogImageUrl,
    ogImageWidth: ogImageUrl ? 1200 : undefined,
    ogImageHeight: ogImageUrl ? 630 : undefined,
    ogImageType: ogImageUrl ? 'image/jpeg' : undefined,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImageUrl,
  });

  const dateModified =
    (item as unknown as { updatedAt?: string | null }).updatedAt || item.publishedAt || undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    datePublished: item.publishedAt || undefined,
    dateModified,
    author: item.author?.name
      ? { '@type': 'Person', name: item.author.name }
      : undefined,
    image: coverUrl || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'ВИНОДЕЛИЕ СЕГОДНЯ',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd),
      },
    ],
  });
}
