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

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#7c3aed" },
      { title: "HeroQuest" },
    ],
    links: [
      { rel: "stylesheet", href: globalsCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=MedievalSharp&family=Nunito:wght@400;600;700;800&family=Chonburi&family=Maitree:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <QueryClientShell>{children}</QueryClientShell>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function QueryClientShell({ children }: { children: ReactNode }) {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    if (typeof window === "undefined") return;
    void import("@/lib/pwa-register").then(({ setupPwa }) => setupPwa());
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SoundProvider>
          <CelebrateProvider>{children}</CelebrateProvider>
        </SoundProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
