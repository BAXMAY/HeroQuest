import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@heroquest/db/types";
import { en, type TranslationDict } from "./en";
import { th } from "./th";

type DotKeys<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? `${Prefix}${K}`
        : DotKeys<T[K], `${Prefix}${K}.`>;
    }[keyof T & string]
  : never;

export type TranslationKey = DotKeys<TranslationDict>;

const DICTS: Record<Locale, TranslationDict> = { en, th };

function lookup(dict: TranslationDict, key: string): string | undefined {
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LanguageCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "hq:locale";

export function LanguageProvider({
  initialLocale = "th",
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  // Seed from localStorage on first render — survives across logged-out
  // pages where we don't have the profile yet.
  const seeded =
    typeof window !== "undefined"
      ? (window.localStorage.getItem(STORAGE_KEY) as Locale | null)
      : null;
  const [locale, setLocale] = useState<Locale>(seeded ?? initialLocale);

  const update = useCallback((l: Locale) => {
    setLocale(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) =>
      lookup(DICTS[locale], key) ?? lookup(en, key) ?? key,
    [locale],
  );

  const ctx = useMemo<Ctx>(() => ({ locale, setLocale: update, t }), [locale, update, t]);

  return <LanguageCtx.Provider value={ctx}>{children}</LanguageCtx.Provider>;
}

export function useT(): Ctx {
  const ctx = useContext(LanguageCtx);
  if (!ctx) throw new Error("useT must be used inside <LanguageProvider>");
  return ctx;
}
