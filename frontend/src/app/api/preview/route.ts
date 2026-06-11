import { isEditorContentType, type EditorContentType } from "@/lib/editor-shared";
import { fetchStrapiPreview } from "@/lib/strapi";

const PREVIEW_SECRET = process.env.PREVIEW_SECRET;

const TYPE_TO_ENDPOINT: Record<EditorContentType, string> = {
  article: "/api/articles",
  news: "/api/news-entries",
  video: "/api/videos",
  gallery: "/api/galleries",
  homepage: "/api/homepage",
};

const TYPE_TO_FIELDS: Record<EditorContentType, string> = {
  article:
    "fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=materialLabel&fields[4]=readingTime&fields[5]=featured&fields[6]=pinned&fields[7]=homepageLead&fields[8]=homepageSpecialBlock&fields[9]=publishedAt&fields[10]=publishedAtCustom&fields[11]=coverSource",
  news:
    "fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=materialLabel&fields[4]=featured&fields[5]=pinned&fields[6]=homepageLead&fields[7]=sourceName&fields[8]=sourceUrl&fields[9]=publishedAt&fields[10]=publishedAtCustom&fields[11]=coverSource",
  video:
    "fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=materialLabel&fields[4]=videoUrl&fields[5]=duration&fields[6]=pinned&fields[7]=homepageLead&fields[8]=publishedAt&fields[9]=publishedAtCustom&fields[10]=coverSource",
  gallery:
    "fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publishedAt&fields[4]=publishedAtCustom&fields[5]=coverSource",
  homepage:
    "fields[0]=title&fields[1]=slug",
};

const COMMON_POPULATE =
  "populate[cover]=true&populate[archiveCover]=true&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[author][fields][2]=position&populate[categories][fields][0]=name&populate[categories][fields][1]=slug&populate[tags][fields][0]=name&populate[tags][fields][1]=slug&populate[seo][populate][metaImage]=true&populate[content][populate]=*&populate[content][on][blocks.archive-feed][populate][categories][fields][0]=name&populate[content][on][blocks.archive-feed][populate][categories][fields][1]=slug&populate[content][on][blocks.cta][populate][link]=true&populate[content][on][blocks.embed]=true&populate[content][on][blocks.hero][populate][backgroundImage]=true&populate[content][on][blocks.hero][populate][backgroundVideo]=true&populate[content][on][blocks.image-highlight][populate][image]=true&populate[content][on][blocks.image-gallery][populate][images]=true&populate[content][on][blocks.image-slider][populate][images]=true&populate[content][on][blocks.link-grid][populate][links]=true&populate[content][on][blocks.quote]=true";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const documentId = searchParams.get("documentId");
  const secret = searchParams.get("secret");

  if (!PREVIEW_SECRET || secret !== PREVIEW_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!type || !documentId || !isEditorContentType(type)) {
    return Response.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const endpoint = TYPE_TO_ENDPOINT[type];
  const fields = TYPE_TO_FIELDS[type];
  const path = `${endpoint}?filters[documentId][$eq]=${encodeURIComponent(documentId)}&${fields}&${COMMON_POPULATE}`;

  try {
    const response = await fetchStrapiPreview<unknown[]>(path);
    const item = response.data?.[0] ?? null;

    if (!item) {
      return Response.json({ error: "Материал не найден." }, { status: 404 });
    }

    return Response.json({ ok: true, item });
  } catch (error) {
    console.error("[preview api] error", error);
    return Response.json({ error: "Ошибка загрузки материала." }, { status: 500 });
  }
}
