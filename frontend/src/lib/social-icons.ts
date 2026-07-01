const ICON_FILES: Record<string, string> = {
  youtube: "youtube-1.svg",
  vk: "vkontakte-1.svg",
  vkontakte: "vkontakte-1.svg",
  telegram: "telegram-1.svg",
  rutube: "rutube-1.svg",
  dzen: "dzen-1.svg",
  max: "max-1.svg",
  instagram: "instagram-1.svg",
};

export const SOCIAL_PLATFORMS = [
  { id: "vk", label: "ВКонтакте" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "telegram", label: "Telegram" },
  { id: "rutube", label: "Rutube" },
  { id: "dzen", label: "Дзен" },
  { id: "max", label: "MAX" },
] as const;

export function normalizeSocialIconInput(icon?: string | null): string | null {
  if (!icon) {
    return null;
  }
  const trimmed = icon.trim();
  if (!trimmed || trimmed === "link" || trimmed.includes("<svg")) {
    return null;
  }
  return trimmed;
}

export function resolveSocialIconKey(
  icon?: string | null,
  label?: string | null,
  href?: string | null,
): string | null {
  const normalizedIcon = normalizeSocialIconInput(icon)?.toLowerCase() ?? "";
  if (normalizedIcon && !normalizedIcon.includes("<svg")) {
    if (ICON_FILES[normalizedIcon]) {
      return normalizedIcon;
    }
    const withoutSuffix = normalizedIcon.replace(/-1$/, "");
    if (ICON_FILES[withoutSuffix]) {
      return withoutSuffix;
    }
  }

  const normalizedLabel = label?.trim().toLowerCase() ?? "";
  const normalizedHref = href?.trim().toLowerCase() ?? "";

  if (
    normalizedHref.includes("t.me") ||
    normalizedLabel.includes("telegram") ||
    normalizedLabel.includes("телеграм")
  ) {
    return "telegram";
  }

  if (
    normalizedHref.includes("vk.com") ||
    normalizedLabel.includes("vkontakte") ||
    normalizedLabel.includes("вконтакте") ||
    normalizedLabel === "vk" ||
    normalizedLabel === "вк"
  ) {
    return "vkontakte";
  }

  if (
    normalizedHref.includes("youtube.com") ||
    normalizedHref.includes("youtu.be") ||
    normalizedLabel.includes("youtube") ||
    normalizedLabel.includes("ютуб")
  ) {
    return "youtube";
  }

  if (
    normalizedHref.includes("rutube.ru") ||
    normalizedLabel.includes("rutube") ||
    normalizedLabel.includes("рутуб")
  ) {
    return "rutube";
  }

  if (
    normalizedHref.includes("dzen.ru") ||
    normalizedHref.includes("zen.yandex") ||
    normalizedLabel.includes("dzen") ||
    normalizedLabel.includes("дзен")
  ) {
    return "dzen";
  }

  if (
    normalizedHref.includes("max.ru") ||
    normalizedHref.includes("oneme.ru") ||
    normalizedLabel === "max" ||
    normalizedLabel === "макс" ||
    normalizedLabel.includes("мессенджер max")
  ) {
    return "max";
  }

  if (
    normalizedHref.includes("instagram.com") ||
    normalizedLabel.includes("instagram") ||
    normalizedLabel.includes("инстаграм") ||
    normalizedLabel.includes("инста")
  ) {
    return "instagram";
  }

  return null;
}

export function getSocialIconUrl(
  icon?: string | null,
  label?: string | null,
  href?: string | null,
): string | null {
  const key = resolveSocialIconKey(icon, label, href);
  if (!key) {
    return null;
  }
  const file = ICON_FILES[key];
  return file ? `/icons/${file}` : null;
}

export function resolveSavedSocialIcon(
  icon?: string | null,
  label?: string | null,
  href?: string | null,
  platform?: string | null,
): string {
  const normalizedPlatform = platform?.trim().toLowerCase();
  if (normalizedPlatform && ICON_FILES[normalizedPlatform]) {
    return normalizedPlatform;
  }

  const normalizedIcon = normalizeSocialIconInput(icon);
  if (normalizedIcon) {
    return normalizedIcon;
  }

  const detected = resolveSocialIconKey(null, label, href);
  return detected || "link";
}
