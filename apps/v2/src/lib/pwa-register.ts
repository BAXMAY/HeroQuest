/**
 * Service worker registration + offline-queue drain. Imported once from
 * the root layout's client-only effect.
 */
import { registerSW } from "virtual:pwa-register";
import { enqueuePending, listPending, removePending } from "./offline-queue";

let registered = false;

export function setupPwa(): void {
  if (registered || typeof window === "undefined") return;
  registered = true;

  const updateSW = registerSW({
    onNeedRefresh() {
      // Auto-update — fine for a kids' app; could surface a toast if we
      // wanted to give them a "reload now" choice.
      updateSW(true);
    },
  });

  // Foreground listener for the SW's drain message.
  navigator.serviceWorker?.addEventListener("message", (e) => {
    if (e.data?.type === "drain-pending-quests") {
      void drainPendingFromClient();
    }
  });

  // Also drain whenever the browser re-comes online (iOS fallback).
  window.addEventListener("online", () => {
    void drainPendingFromClient();
  });
}

export async function drainPendingFromClient(): Promise<void> {
  const pending = await listPending();
  for (const item of pending) {
    try {
      const intentRes = await fetch("/api/uploads/quest-photo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentType: item.contentType }),
      });
      if (!intentRes.ok) continue;
      const { uploadUrl, key } = (await intentRes.json()) as {
        uploadUrl: string;
        key: string;
      };
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "content-type": item.contentType },
        body: item.blob,
      });
      if (!put.ok) continue;
      // Then call the submitQuest server fn via a regular POST — the
      // generated client serializes to /api/.... For simplicity here we
      // do a manual fetch to the well-known server-fn endpoint shape.
      const submit = await fetch("/_serverFn/submitQuest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          data: {
            description: item.description,
            category: item.category,
            photoR2Key: key,
          },
        }),
      });
      if (submit.ok) await removePending(item.id);
    } catch {
      // Network still flaky — leave it queued for next try.
    }
  }
}

void enqueuePending;
