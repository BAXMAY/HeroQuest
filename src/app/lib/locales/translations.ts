import { en } from './en';
import { th } from './th';

export const translations = {
  en,
  th,
};

// This type utility creates a union of all possible translation keys
// e.g., "pageTitles.dashboard" | "nav.dashboard"
type Paths<T> = T extends object ? { [K in keyof T]:
    `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}`
}[keyof T] : never;

export type TranslationKey = Paths<typeof en>;
