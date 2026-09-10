export const getCmsMediaUrl = (
  url: string | null | undefined,
  cmsHost: string
): string | undefined => {
  if (!url) return undefined;

  if (/^https?:\/\//.test(url)) return url;

  const protocol =
    cmsHost.startsWith("localhost") || cmsHost.startsWith("127.0.0.1")
      ? "http"
      : "https";

  return `${protocol}://${cmsHost}${url.startsWith("/") ? url : `/${url}`}`;
};
