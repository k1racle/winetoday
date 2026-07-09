import { a as useRuntimeConfig } from './server.mjs';

function useMediaUrl(path) {
  const config = useRuntimeConfig();
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const base = config.public.mediaBaseUrl?.replace(/\/$/, "") || "";
  return `${base}${path}`;
}

export { useMediaUrl as u };
//# sourceMappingURL=useMediaUrl-DKS3WinY.mjs.map
