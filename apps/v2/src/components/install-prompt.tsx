import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Listens for `beforeinstallprompt` (Chrome / Edge / Android) and shows a
 * one-tap install button. iOS Safari doesn't support the API — see iOS
 * install instructions in the lorebook page (not built here yet).
 */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (installed || !evt) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={async () => {
        await evt.prompt();
        const choice = await evt.userChoice;
        if (choice.outcome === "accepted") setEvt(null);
      }}
    >
      <Download className="h-4 w-4" />
      Install HeroQuest
    </Button>
  );
}
