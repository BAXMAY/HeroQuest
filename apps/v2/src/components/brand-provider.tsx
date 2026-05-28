import { createContext, useContext, type ReactNode } from "react";
import type { BrandConfig } from "@heroquest/db";

/**
 * Active brand for the current request/render. The value is fetched once
 * server-side by __root.tsx's loader (via getBrandConfig) and threaded
 * into the React tree.
 *
 * Components call `useBrand()` to read app name / currency name / etc.
 * without each one importing the server fn directly.
 */
const Ctx = createContext<BrandConfig | null>(null);

export function BrandProvider({
  brand,
  children,
}: {
  brand: BrandConfig;
  children: ReactNode;
}) {
  return <Ctx.Provider value={brand}>{children}</Ctx.Provider>;
}

export function useBrand(): BrandConfig {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBrand must be used inside <BrandProvider>");
  return v;
}

/**
 * Renders the CSS-variable overrides for the active brand into <head>.
 * Mounted high in the layout so it precedes any component that depends on
 * the vars. The fallbacks in globals.css cover the no-provider case.
 */
export function BrandStyleTag({ brand }: { brand: BrandConfig }) {
  const t = brand.theme;
  const css = `:root {
    --brand-primary: ${t.primary};
    --brand-secondary: ${t.secondary};
    --brand-accent: ${t.accent};
    --brand-magic: ${t.magic};
    --brand-flame: ${t.flame};
    --background: ${t.background};
    --foreground: ${t.foreground};
    --font-heading: '${t.headingFont}';
    --font-body: '${t.bodyFont}';
  }`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
