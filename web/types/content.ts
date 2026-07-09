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
};

export type ContentItem = {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  excerpt?: string | null;
  status: ContentStatus;
  publishedAt?: string | null;
  coverMedia?: MediaAsset | null;
  author?: Author | null;
  categories?: { name: string; slug: string }[];
  tags?: { name: string; slug: string }[];
  videoUrl?: string | null;
  duration?: number | null;
  viewsTotal: number;
  homepageSpecialBlock?: boolean;
  homepageLead?: boolean;
  materialLabel?: string | null;
  pinned?: boolean;
};
