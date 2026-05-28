import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as Icons from "lucide-react";
import { listAllAchievements, updateAchievement } from "@/server/fns/achievements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Admin → Achievements. Edit the display copy + icon for the 12 baked-in
 * achievement IDs. Unlock rules stay in code (computeNewlyUnlocked).
 */
export const Route = createFileRoute("/_app/admin-achievements")({
  beforeLoad: ({ context }) => {
    const role = (context as { profile?: { role?: string } } | undefined)?.profile?.role;
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: AdminAchievementsPage,
});

function AdminAchievementsPage() {
  const queryClient = useQueryClient();
  const all = useQuery({ queryKey: ["admin-achievements"], queryFn: () => listAllAchievements() });
  const save = useMutation({
    mutationFn: updateAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-3xl">Achievements</h1>
        <p className="text-sm text-muted-foreground">
          Rename, retranslate, or change the icon. The 12 unlock rules (first quest, 5 quests,
          1000 XP, etc.) stay the same.
        </p>
      </header>
      {all.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {all.data?.map((a) => (
            <AchievementRow
              key={a.id}
              ach={a}
              onSave={(patch) => save.mutate({ data: { id: a.id, ...patch } })}
              pending={save.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AchievementRow({
  ach,
  onSave,
  pending,
}: {
  ach: {
    id: string;
    name: string;
    nameEn: string | null;
    description: string;
    descriptionEn: string | null;
    icon: string;
  };
  onSave: (patch: {
    name?: string;
    nameEn?: string;
    description?: string;
    descriptionEn?: string;
    icon?: string;
  }) => void;
  pending: boolean;
}) {
  const [name, setName] = useState(ach.name);
  const [nameEn, setNameEn] = useState(ach.nameEn ?? "");
  const [description, setDescription] = useState(ach.description);
  const [descriptionEn, setDescriptionEn] = useState(ach.descriptionEn ?? "");
  const [icon, setIcon] = useState(ach.icon);

  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] ?? Icons.Sparkles;

  const dirty =
    name !== ach.name ||
    nameEn !== (ach.nameEn ?? "") ||
    description !== ach.description ||
    descriptionEn !== (ach.descriptionEn ?? "") ||
    icon !== ach.icon;

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-magic/15 text-magic">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-base font-mono">{ach.id}</CardTitle>
          <CardDescription>Edit the kid-facing copy</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Labeled label="Name (TH)">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Labeled>
          <Labeled label="Name (EN)">
            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </Labeled>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Labeled label="Description (TH)">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px]"
            />
          </Labeled>
          <Labeled label="Description (EN)">
            <Textarea
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="min-h-[60px]"
            />
          </Labeled>
        </div>
        <Labeled label="Icon (lucide name)">
          <Input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Sparkles"
            list="lucide-icons"
          />
        </Labeled>
        <Button
          size="sm"
          disabled={!dirty || pending}
          onClick={() =>
            onSave({ name, nameEn, description, descriptionEn, icon })
          }
          className="w-fit"
        >
          Save
        </Button>
      </CardContent>
    </Card>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
