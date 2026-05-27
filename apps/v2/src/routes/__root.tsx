import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  ScrollRestoration,
  Scripts,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import type { RouterContext } from "@/router";
import globalsCss from "@/styles/globals.css?url";
import { SoundProvider } from "@/components/game/sound-provider";
import { CelebrateProvider } from "@/components/game/celebrate";
import { LanguageProvider } from "@/i18n";
import { BrandProvider, BrandStyleTag } from "@/components/brand-provider";
import { getBrandConfig } from "@/server/fns/brand";
import { BRAND_DEFAULT, type BrandConfig } from "@heroquest/db";

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    let brand: BrandConfig;
    try {
      brand = await getBrandConfig();
    } catch {
      // First-paint before migrations / env not bound — use defaults so the
      // shell still renders.
      brand = BRAND_DEFAULT;
    }
    return { brand };
  },
  head: (ctx) => {
    const brand = (ctx.match.context as { brand?: BrandConfig } | undefined)?.brand ?? BRAND_DEFAULT;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { name: "theme-color", content: `hsl(${brand.theme.primary})` },
        { title: brand.appName },
      ],
      links: [
        { rel: "stylesheet", href: globalsCss },
        { rel: "manifest", href: "/api/manifest" },
        { rel: "icon", type: "image/svg+xml", href: "/api/favicon.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "stylesheet",
          href: buildFontsHref(brand),
        },
      ],
    };
  },
  component: RootComponent,
});

function buildFontsHref(brand: BrandConfig): string {
  const heading = encodeURIComponent(brand.theme.headingFont);
  const body = encodeURIComponent(brand.theme.bodyFont);
  const families = [
    `${heading}`,
    `${body}:wght@400;600;700;800`,
    "Chonburi",
    "Maitree:wght@400;500;600;700",
  ].join("&family=");
  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}

function RootComponent() {
  const { brand } = Route.useRouteContext();
  return (
    <RootDocument brand={brand}>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ brand, children }: { brand: BrandConfig; children: ReactNode }) {
  return (
    <html lang="th" className="dark">
      <head>
        <HeadContent />
        <BrandStyleTag brand={brand} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <QueryClientShell brand={brand}>{children}</QueryClientShell>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function QueryClientShell({ brand, children }: { brand: BrandConfig; children: ReactNode }) {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    if (typeof window === "undefined") return;
    void import("@/lib/pwa-register").then(({ setupPwa }) => setupPwa());
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <BrandProvider brand={brand}>
        <LanguageProvider>
          <SoundProvider>
            <CelebrateProvider>{children}</CelebrateProvider>
          </SoundProvider>
        </LanguageProvider>
      </BrandProvider>
    </QueryClientProvider>
  );
}
