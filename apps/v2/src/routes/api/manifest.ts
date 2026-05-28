import { createFileRoute } from "@tanstack/react-router";
import { getBrandConfig } from "@/server/fns/brand";

/**
 * Dynamic PWA manifest — keyed off the active brand so each community
 * gets their own installable identity.
 *
 * Browsers fetch /manifest.webmanifest via the <link rel="manifest"> in
 * __root.tsx, but we serve it from this route so the response can read
 * brand from D1.
 */
export const Route = createFileRoute("/api/manifest")({
  server: {
    handlers: {
      GET: async () => {
        const brand = await getBrandConfig();
        const manifest = {
          name: brand.appName,
          short_name: brand.appShortName,
          description: `${brand.appName} — real-world good deeds, heroic rewards.`,
          start_url: "/dashboard",
          scope: "/",
          display: "standalone",
          orientation: "portrait-primary",
          theme_color: `hsl(${brand.theme.primary})`,
          background_color: `hsl(${brand.theme.background})`,
          categories: ["kids", "education", "games"],
          icons: brand.logoUrl
            ? [
                {
                  src: brand.logoUrl,
                  sizes: "any",
                  purpose: "any",
                },
              ]
            : [
                { src: "/icons/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
                { src: "/icons/icon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
                { src: "/icons/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
                { src: "/icons/icon-maskable-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
              ],
        };
        return new Response(JSON.stringify(manifest), {
          headers: {
            "content-type": "application/manifest+json",
            "cache-control": "public, max-age=60",
          },
        });
      },
    },
  },
});
