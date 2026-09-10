const AWS_LINK_PATTERNS = [
  /only-doc\.com\/(.*?)\?/, // Custom domain: https://bucket.only-doc.com/key?signature
  /\.s3\.[^/]+\.amazonaws\.com\/(.*?)\?/, // S3 URL: https://bucket.s3.region.amazonaws.com/key?signature
  /s3\.[^/]+\.amazonaws\.com\/[^/]+\/(.*?)\?/, // Path-style: https://s3.region.amazonaws.com/bucket/key?signature
];

const normalizeKey = (key: string): string => {
  const normalized = decodeURIComponent(key).replace(/^\/+/, "");
  if (!normalized) {
    throw new Error("File key not found - empty key");
  }

  if (!normalized.includes("/")) {
    throw new Error(`Invalid S3 key format: ${normalized}`);
  }

  return normalized;
};

const parseUrl = (link: string): URL | null => {
  try {
    return new URL(link);
  } catch {
    try {
      return new URL(link, "http://localhost");
    } catch {
      return null;
    }
  }
};

export const getFileKeyFromAWSLink = (link: string): string => {
  if (!link) {
    throw new Error("File key not found - empty link");
  }

  const parsedUrl = parseUrl(link);
  if (parsedUrl) {
    const rawPath = parsedUrl.pathname;
    const normalizedPath = rawPath.replace(/^\/+/, "");
    if (normalizedPath) {
      const isS3PathStyle =
        parsedUrl.hostname.startsWith("s3.") ||
        parsedUrl.hostname.startsWith("s3-") ||
        parsedUrl.hostname === "s3.amazonaws.com";
      const key = isS3PathStyle
        ? normalizedPath.split("/").slice(1).join("/")
        : normalizedPath;
      if (key) {
        return normalizeKey(key);
      }
    }
  }

  for (const pattern of AWS_LINK_PATTERNS) {
    const match = link.match(pattern);
    if (match && match[1]) {
      return normalizeKey(match[1]);
    }
  }

  const fallbackMatch = link.match(/\/([^/?]+)\?/);
  if (fallbackMatch && fallbackMatch[1]) {
    return normalizeKey(fallbackMatch[1]);
  }

  throw new Error(
    `File key not found - URL format not recognized: ${link.substring(0, 100)}...`
  );
};
