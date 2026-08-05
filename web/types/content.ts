export type ContentType = 'article' | 'news' | 'video' | 'gallery';

export type ContentStatus = 'draft' | 'in_review' | 'published' | 'rejected';

export type MediaAsset = {
  id: string;
  path: string;
  mime?: string | null;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
};

export type Author = {
  id: string;
  name: string;
  slug: string;
  position?: string | null;
  bio?: string | null;
  avatarMedia?: MediaAsset | null;
};

export type AuthorProfile = Author & {
  subscriberCount: number;
  isSubscribed: boolean;
  articlesCount: number;
  newsCount: number;
};

export type ContentItem = {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  excerpt?: string | null;
  status: ContentStatus;
  publishedAt?: string | null;
  createdAt?: string | null;
  coverMedia?: MediaAsset | null;
  coverSource?: string | null;
  archiveCoverMedia?: MediaAsset | null;
  author?: Author | null;
  categories?: { name: string; slug: string }[];
  tags?: { name: string; slug: string }[];
  personLinks?: Array<{
    person: {
      id: string;
      slug: string;
      name: string;
    };
  }>;
  terroirLinks?: Array<{
    terroir: {
      id: string;
      slug: string;
      name: string;
    };
  }>;
  videoUrl?: string | null;
  duration?: number | null;
  sources?: { name?: string | null; url?: string | null }[] | null;
  contentBlocks?: any[] | null;
  viewsTotal: number;
  homepageSpecialBlock?: boolean;
  homepageLead?: boolean;
  materialLabel?: string | null;
  pinned?: boolean;
};
