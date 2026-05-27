import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus, Repeat, Trash2 } from "lucide-react";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import {
  createRecurringChore,
  deleteRecurringChore,
  listChoresForToday,
  listFamilyChores,
  markChoreDone,
} from "@/server/fns/chores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCelebrate } from "@/components/game/celebrate";

export const Route = createFileRoute("/_app/chores")({
  loader: ({ context }) => context,
  component: ChoresPage,
});

function ChoresPage() {
  const { profile } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const celebrate = useCelebrate();
  const today = useQuery({
    queryKey: ["chores-today"],
    queryFn: () => listChoresForToday(),
  });
  const all = useQuery({
    queryKey: ["family-chores"],
    queryFn: () => listFamilyChores(),
  });

  const markDone = useMutation({
    mutationFn: markChoreDone,
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: ["chores-today"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      if (r.leveledUp && r.newLevel) celebrate.levelUp(r.newLevel);
      else celebrate.burst();
    },
  });

  const create = useMutation({
    mutationFn: createRecurringChore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["family-chores"] }),
  });
  const del = useMutation({
    mutationFn: deleteRecurringChore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["family-chores"] }),
  });

  const canManage =
    profile.role === "admin" ||
    profile.role === "parent" ||
    profile.familyRole === "parent" ||
    profile.familyRole === "guardian";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl">Chores</h1>

      <section>
        <h2 className="mb-3 font-heading text-xl">Today's list</h2>
        {today.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : today.data && today.data.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {today.data.map((row) => (
              <ChoreInstanceRow
                key={row.instance.id}
                title={row.chore.title}
                xp={row.chore.defaultXp}
                coins={row.chore.defaultCoins}
                status={row.instance.status}
                onComplete={async (file) => {
                  const compressed = await imageCompression(file, {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1280,
                  });
                  // Reuse the quest-photo upload intent.
                  const intent = await fetch("/api/uploads/quest-photo", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ contentType: compressed.type || "image/jpeg" }),
                  });
                  if (!intent.ok) throw new Error("Upload failed");
                  const { uploadUrl, key } = (await intent.json()) as {
                    uploadUrl: string;
                    key: string;
                  };
                  await fetch(uploadUrl, {
                    method: "PUT",
                    headers: { "content-type": compressed.type || "image/jpeg" },
                    body: compressed,
                  });
                  markDone.mutate({
                    data: { choreInstanceId: row.instance.id, photoR2Key: key },
                  });
                }}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No chores today — enjoy your day!</p>
        )}
      </section>

      {canManage ? (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-xl">
            <Repeat className="h-5 w-5" />
            Recurring chores
          </h2>
          <CreateChoreForm
            onCreate={(data) => create.mutate({ data })}
            pending={create.isPending}
          />
          <ul className="mt-4 flex flex-col gap-2">
            {all.data?.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
              >
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.frequency}
                    {c.daysOfWeek ? ` (${c.daysOfWeek})` : ""} · +{c.defaultXp} XP · +
                    {c.defaultCoins} coins
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => del.mutate({ data: { id: c.id } })}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ChoreInstanceRow({
  title,
  xp,
  coins,
  status,
  onComplete,
}: {
  title: string;
  xp: number;
  coins: number;
  status: "open" | "completed" | "skipped";
  onComplete: (file: File) => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">
            +{xp} XP · +{coins} coins
          </p>
        </div>
        {status === "completed" ? (
          <CheckCircle2 className="h-6 w-6 text-magic" />
        ) : (
          <label className="cursor-pointer rounded-xl border border-primary bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
            <span>Done</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onComplete(f);
              }}
            />
          </label>
        )}
      </CardContent>
    </Card>
  );
}

function CreateChoreForm({
  onCreate,
  pending,
}: {
  onCreate: (data: {
    title: string;
    frequency: "daily" | "weekdays" | "weekly" | "custom";
    defaultXp: number;
    defaultCoins: number;
  }) => void;
  pending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekdays" | "weekly" | "custom">(
    "daily",
  );
  const [defaultXp, setDefaultXp] = useState(25);
  const [defaultCoins, setDefaultCoins] = useState(3);
  return (
    <form
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title) return;
        onCreate({ title, frequency, defaultXp, defaultCoins });
        setTitle("");
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="ctitle">Title</Label>
        <Input
          id="ctitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Feed the dog"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-2">
          <Label>Frequency</Label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as typeof frequency)}
            className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>XP</Label>
          <Input
            type="number"
            value={defaultXp}
            onChange={(e) => setDefaultXp(Number(e.target.value))}
            min={1}
            max={500}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Coins</Label>
          <Input
            type="number"
            value={defaultCoins}
            onChange={(e) => setDefaultCoins(Number(e.target.value))}
            min={0}
            max={50}
          />
        </div>
      </div>
      <Button type="submit" disabled={!title || pending} className="w-fit">
        <Plus className="mr-1 h-4 w-4" /> Add chore
      </Button>
    </form>
  );
}
