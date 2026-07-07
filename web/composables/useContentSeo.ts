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

  const coverUrl = item.coverMedia?.path ? useMediaUrl(item.coverMedia.path) : '';
  const ogImageUrl = useOgImageUrl(coverUrl);

  useSeoMeta({
    title,
    description,
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

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
  });
}
