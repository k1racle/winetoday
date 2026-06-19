const COOKIE_NAME = "viewer-id";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

function generateViewerId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function getViewerId(): string {
  if (typeof document === "undefined") {
    return "";
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${encodeURIComponent(COOKIE_NAME)}=([^;]*)`),
  );

  if (match) {
    return decodeURIComponent(match[1]);
  }

  const id = generateViewerId();
  document.cookie = `${encodeURIComponent(COOKIE_NAME)}=${encodeURIComponent(
    id,
  )}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;

  return id;
}
