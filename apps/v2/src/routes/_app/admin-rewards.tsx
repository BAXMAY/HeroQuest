import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createReward,
  deleteReward,
  listAllRewards,
  updateReward,
} from "@/server/fns/rewards";
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
import { useBrand } from "@/components/brand-provider";

/**
 * Admin → Rewards catalog. CRUD over the `reward` table so each
 * community can curate their own redeemable goodies.
 */
export const Route = createFileRoute("/_app/admin-rewards")({
  beforeLoad: ({ context }) => {
    const role = (context as { profile?: { role?: string } } | undefined)?.profile?.role;
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: AdminRewardsPage,
});

function AdminRewardsPage() {
  const brand = useBrand();
  const queryClient = useQueryClient();
  const rewards = useQuery({ queryKey: ["admin-rewards"], queryFn: () => listAllRewards() });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
    queryClient.invalidateQueries({ queryKey: ["rewards"] });
  };
  const create = useMutation({ mutationFn: createReward, onSuccess: invalidate });
  const update = useMutation({ mutationFn: updateReward, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: deleteReward, onSuccess: invalidate });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-3xl">Rewards catalog</h1>
        <p className="text-sm text-muted-foreground">
          What kids can buy with their {brand.currencyName}. New rewards appear in the shop
          immediately.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add a reward</CardTitle>
          <CardDescription>Image URL can be a public CDN or an R2 asset.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewRewardForm
            onSubmit={(data) => create.mutate({ data })}
            pending={create.isPending}
            currencyShort={brand.currencyShort}
          />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl">Existing ({rewards.data?.length ?? 0})</h2>
        {rewards.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          rewards.data?.map((r) => (
            <RewardRow
              key={r.id}
              reward={r}
              onSave={(patch) => update.mutate({ data: { id: r.id, ...patch } })}
              onDelete={() => remove.mutate({ data: { id: r.id } })}
              savePending={update.isPending}
              deletePending={remove.isPending}
            />
          ))
        )}
      </section>
    </div>
  );
}

function NewRewardForm({
  onSubmit,
  pending,
  currencyShort,
}: {
  onSubmit: (data: {
    name: string;
    description: string;
    cost: number;
    imageUrl: string;
    active: boolean;
  }) => void;
  pending: boolean;
  currencyShort: string;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(100);
  const [imageUrl, setImageUrl] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name || !description || !imageUrl) return;
    onSubmit({ name, description, cost, imageUrl, active: true });
    setName("");
    setDescription("");
    setCost(100);
    setImageUrl("");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="rname">Name</Label>
          <Input id="rname" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rcost">Cost ({currencyShort})</Label>
          <Input
            id="rcost"
            type="number"
            min={1}
            max={100_000}
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="rurl">Image URL</Label>
        <Input
          id="rurl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://placehold.co/240"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="rdesc">Description</Label>
        <Textarea
          id="rdesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        <Plus className="mr-1 h-4 w-4" /> Add reward
      </Button>
    </form>
  );
}

function RewardRow({
  reward,
  onSave,
  onDelete,
  savePending,
  deletePending,
}: {
  reward: {
    id: string;
    name: string;
    description: string;
    cost: number;
    imageUrl: string;
    active: boolean;
  };
  onSave: (patch: { name?: string; description?: string; cost?: number; imageUrl?: string; active?: boolean }) => void;
  onDelete: () => void;
  savePending: boolean;
  deletePending: boolean;
}) {
  const [name, setName] = useState(reward.name);
  const [description, setDescription] = useState(reward.description);
  const [cost, setCost] = useState(reward.cost);
  const [imageUrl, setImageUrl] = useState(reward.imageUrl);
  const dirty =
    name !== reward.name ||
    description !== reward.description ||
    cost !== reward.cost ||
    imageUrl !== reward.imageUrl;

  return (
    <Card className={!reward.active ? "opacity-50" : ""}>
      <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[6rem_1fr_auto]">
        <img
          src={imageUrl}
          alt={name}
          className="h-24 w-24 rounded-xl border border-border bg-muted object-cover"
        />
        <div className="flex flex-col gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={1}
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
            />
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[60px]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            disabled={!dirty || savePending}
            onClick={() => onSave({ name, description, cost, imageUrl })}
          >
            Save
          </Button>
          {reward.active ? (
            <Button size="sm" variant="outline" onClick={() => onSave({ active: false })}>
              Hide
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onSave({ active: true })}>
              Unhide
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={deletePending}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
