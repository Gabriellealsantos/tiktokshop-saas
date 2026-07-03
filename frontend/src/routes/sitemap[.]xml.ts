import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
const BASE_URL = "";
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = ["/login", "/cadastro"];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map(
            (path) =>
              `  <url>\n    <loc>${BASE_URL}${path}</loc>\n    <changefreq>monthly</changefreq>\n  </url>`,
          ),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
