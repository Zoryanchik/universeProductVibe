import { BACKEND_HOST } from "astro:env/client";
import axios from "axios";

// Normalize BACKEND_HOST by removing any protocol prefix
const normalizeHost = (host: string): string => {
  // Remove any protocol prefix (http://, https://, http//, https//, etc.)
  return host.replace(/^https?[:/]+/, "").trim();
};

// Determine protocol based on host (http for localhost, https otherwise)
const getProtocol = (normalizedHost: string): string => {
  return normalizedHost.includes("localhost") ||
    normalizedHost.startsWith("127.0.0.1")
    ? "http"
    : "https";
};

const normalizedHost = normalizeHost(BACKEND_HOST);
const protocol = getProtocol(normalizedHost);

const apiHttpClient = axios.create({
  baseURL: `${protocol}://${normalizedHost}/api/v1`,
  withCredentials: true,
  headers: {
    ["x-pdf-app"]: "PDFFLY",
    Accept: "application/json",
  },
});

export { apiHttpClient };
