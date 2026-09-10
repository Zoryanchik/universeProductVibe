import { MAIN_APP_BASE, ENVIRONMENT } from "astro:env/client";

const devContent = `User-agent: *
Disallow: /

Sitemap: ${MAIN_APP_BASE}/sitemap.xml`;

const prodContent = `User-agent: *

Sitemap: ${MAIN_APP_BASE}/sitemap.xml`;

export async function GET() {
  return new Response(ENVIRONMENT === "production" ? prodContent : devContent, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
