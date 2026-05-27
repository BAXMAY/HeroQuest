import { Languages } from "lucide-react";
import { useT } from "@/i18n";
import { setLocale as setLocaleServer } from "@/server/fns/profile";

/**
 * Compact language toggle for the topbar. Updates the local context
 * immediately AND persists to user_profile.locale.
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useT();
  return (
    <button
      type="button"
      onClick={() => {
        const next = locale === "th" ? "en" : "th";
        setLocale(next);
        void setLocaleServer({ data: { locale: next } }).catch(() => {
          /* non-fatal — still updated locally */
        });
      }}
      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
      aria-label="Change language"
    >
      <Languages className="h-3.5 w-3.5" />
      {locale === "th" ? "TH" : "EN"}
    </button>
  );
}
