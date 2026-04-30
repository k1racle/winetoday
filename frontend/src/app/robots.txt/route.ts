import { NextResponse } from "next/server";

import { SITE_URL, getSiteSeo, withLoggedFallback } from "@/lib/strapi";

const DEFAULT_SITE_URL = SITE_URL;

function normalizeSiteUrl(value?: string | null) {
  return (value?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

function splitRuleLines(value?: string | null) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET() {
  const siteSeo = await withLoggedFallback("robots site seo", () => getSiteSeo(), null);

  if (siteSeo?.robotsEnabled === false) {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const siteUrl = normalizeSiteUrl(siteSeo?.siteUrl);
  const rules = siteSeo?.robotsRules?.length
    ? siteSeo.robotsRules
    : [{ userAgent: "*", allow: "/", disallow: "/admin/" }];
  const lines = rules.flatMap((rule) => {
    const block = [`User-agent: ${rule.userAgent || "*"}`];

    splitRuleLines(rule.allow).forEach((item) => block.push(`Allow: ${item}`));
    splitRuleLines(rule.disallow).forEach((item) => block.push(`Disallow: ${item}`));

    if (typeof rule.crawlDelay === "number") {
      block.push(`Crawl-delay: ${rule.crawlDelay}`);
    }

    block.push("");
    return block;
  });

  const host = siteSeo?.robotsHost?.trim() || siteUrl;

  if (!lines.some((line) => /^Host:/i.test(line))) {
    lines.push(`Host: ${host}`);
  }

  if (siteSeo?.sitemapEnabled !== false && !lines.some((line) => /^Sitemap:/i.test(line))) {
    lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
  }

  splitRuleLines(siteSeo?.robotsAdditionalSitemaps).forEach((item) => {
    lines.push(`Sitemap: ${item}`);
  });

  return new NextResponse(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
