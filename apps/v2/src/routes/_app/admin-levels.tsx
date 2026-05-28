import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LEVELS } from "@heroquest/db";
import { getBrandConfig, updateBrandConfig } from "@/server/fns/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Admin → Level titles. Edit any of the 100 level-up titles per community.
 * "Reset to defaults" clears tenant_settings.level_titles (null falls
 * through to packages/db/src/levels.ts).
 */
export const Route = createFileRoute("/_app/admin-levels")({
  beforeLoad: ({ context }) => {
    const role = (context as { profile?: { role?: string } } | undefined)?.profile?.role;
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: AdminLevelsPage,
});

function AdminLevelsPage() {
  const queryClient = useQueryClient();
  const brandQ = useQuery({ queryKey: ["brand-config"], queryFn: () => getBrandConfig() });
  const save = useMutation({
    mutationFn: updateBrandConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["brand-config"] }),
  });

  const [titles, setTitles] = useState<string[]>([]);

  // Seed from current brand (override or defaults) — only when brand loads.
  useEffect(() => {
    if (!brandQ.data) return;
    const initial = brandQ.data.levelTitles ?? LEVELS.map((l) => l.title);
    setTitles(initial.slice(0, 100));
  }, [brandQ.data]);

  if (!brandQ.data || titles.length === 0) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const overrideActive = brandQ.data.levelTitles !== null;
  const defaults = LEVELS.map((l) => l.title);
  const dirty = titles.some((t, i) => t !== (brandQ.data.levelTitles?.[i] ?? defaults[i]));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Level titles</h1>
          <p className="text-sm text-muted-foreground">
            Hero ranks shown on level up and in the XP bar. 100 levels total.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!overrideActive || save.isPending}
            onClick={() => save.mutate({ data: { levelTitles: null } })}
          >
            Reset to defaults
          </Button>
          <Button
            size="sm"
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate({ data: { levelTitles: titles } })}
          >
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>The 100 titles</CardTitle>
          <CardDescription>
            {overrideActive
              ? "Currently using your community's overrides."
              : "Currently using the built-in defaults."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {titles.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
                  Lv {i + 1}
                </span>
                <Input
                  value={t}
                  onChange={(e) => {
                    const next = titles.slice();
                    next[i] = e.target.value;
                    setTitles(next);
                  }}
                  className="h-9"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
