import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Shared Tailwind preset for the HeroQuest v2 "hybrid bright + RPG" theme.
 *
 * Palette uses HSL CSS vars defined in apps/v2/src/styles/globals.css so
 * dark mode and theme tweaks live in one place.
 */
const preset = {
  darkMode: ["class"],
  content: [],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--brand-primary))",
          foreground: "hsl(var(--brand-primary-fg))",
        },
        secondary: {
          DEFAULT: "hsl(var(--brand-secondary))",
          foreground: "hsl(var(--brand-secondary-fg))",
        },
        accent: {
          DEFAULT: "hsl(var(--brand-accent))",
          foreground: "hsl(var(--brand-accent-fg))",
        },
        magic: {
          DEFAULT: "hsl(var(--brand-magic))",
          foreground: "hsl(var(--brand-magic-fg))",
        },
        flame: {
          DEFAULT: "hsl(var(--brand-flame))",
          foreground: "hsl(var(--brand-flame-fg))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        rarity: {
          common: "hsl(var(--rarity-common))",
          rare: "hsl(var(--rarity-rare))",
          epic: "hsl(var(--rarity-epic))",
          legendary: "hsl(var(--rarity-legendary))",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "MedievalSharp", "serif"],
        body: ["var(--font-body)", "Nunito", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        quest: "0 4px 18px -2px hsl(var(--brand-primary) / 0.25)",
        coin: "0 0 24px hsl(var(--brand-accent) / 0.55)",
        flame: "0 0 20px hsl(var(--brand-flame) / 0.6)",
        magic: "0 0 28px hsl(var(--brand-magic) / 0.5)",
      },
      backgroundImage: {
        "rarity-rare":
          "linear-gradient(135deg, hsl(var(--rarity-rare)) 0%, hsl(var(--brand-secondary)) 100%)",
        "rarity-epic":
          "linear-gradient(135deg, hsl(var(--rarity-epic)) 0%, hsl(var(--brand-magic)) 100%)",
        "rarity-legendary":
          "linear-gradient(135deg, hsl(var(--rarity-legendary)) 0%, hsl(var(--brand-accent)) 50%, hsl(var(--brand-flame)) 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "coin-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-6px) scale(1.1)" },
        },
        "xp-pop": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "mascot-breathe": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-2px) scale(1.02)" },
        },
        "rarity-shimmer": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "coin-bounce": "coin-bounce 0.6s ease-out",
        "xp-pop": "xp-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "mascot-breathe": "mascot-breathe 4s ease-in-out infinite",
        "rarity-shimmer": "rarity-shimmer 3s linear infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;

export default preset;
