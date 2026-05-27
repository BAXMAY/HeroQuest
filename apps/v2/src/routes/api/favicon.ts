import { createFileRoute } from "@tanstack/react-router";
import { getBrandConfig } from "@/server/fns/brand";

/**
 * Brand-colored favicon. Templated from the active brand's primary +
 * accent HSL components so each community's tab gets their own tint.
 */
export const Route = createFileRoute("/api/favicon")({
  server: {
    handlers: {
      GET: async () => {
        const brand = await getBrandConfig();
        const p = `hsl(${brand.theme.primary})`;
        const a = `hsl(${brand.theme.accent})`;
        const m = `hsl(${brand.theme.magic})`;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p}"/>
      <stop offset="100%" stop-color="${m}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <path d="M22 18 L42 18 L36 46 L28 46 Z" fill="${a}"/>
  <circle cx="32" cy="30" r="6" fill="${m}"/>
</svg>`;
        return new Response(svg, {
          headers: {
            "content-type": "image/svg+xml",
            "cache-control": "public, max-age=60",
          },
        });
      },
    },
  },
});
