import { HomepageNewsSidebarStrip } from "@/components/homepage-news-sidebar-strip.client";

export type HomepageNewsSidebarItem = {
  documentId: string;
  slug: string;
  title: string;
  publishedLabel: string;
  materialLabel?: string | null;
  popularityCount: number;
  href: string;
};

type HomepageNewsSidebarProps = {
  latest: HomepageNewsSidebarItem[];
  popular: HomepageNewsSidebarItem[];
  className?: string;
};

export function HomepageNewsSidebar({ latest, popular, className }: HomepageNewsSidebarProps) {
  return (
    <section className={className}>
      <HomepageNewsSidebarStrip latest={latest} popular={popular} />
    </section>
  );
}
