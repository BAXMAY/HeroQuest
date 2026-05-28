import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Crown, Copy, Sparkles, Trophy } from "lucide-react";
import {
  createFamily,
  getMyFamily,
  joinFamilyByCode,
  leaveFamily,
  listFamilyMembers,
  regenerateInviteCode,
} from "@/server/fns/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/family")({
  loader: ({ context }) => context,
  component: FamilyPage,
});

function FamilyPage() {
  const { profile } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const fam = useQuery({ queryKey: ["my-family"], queryFn: () => getMyFamily() });
  const members = useQuery({
    queryKey: ["family-members"],
    queryFn: () => listFamilyMembers(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["my-family"] });
    queryClient.invalidateQueries({ queryKey: ["family-members"] });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  };
  const create = useMutation({ mutationFn: createFamily, onSuccess: invalidate });
  const join = useMutation({ mutationFn: joinFamilyByCode, onSuccess: invalidate });
  const leave = useMutation({ mutationFn: leaveFamily, onSuccess: invalidate });
  const regen = useMutation({ mutationFn: regenerateInviteCode, onSuccess: invalidate });

  if (!profile.familyId || !fam.data) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <h1 className="font-heading text-3xl">Your family</h1>
        <NoFamilyState
          onCreate={(name) => create.mutate({ data: { name } })}
          onJoin={(code) => join.mutate({ data: { code } })}
          createPending={create.isPending}
          joinPending={join.isPending}
          createError={create.error?.message}
          joinError={join.error?.message}
        />
      </div>
    );
  }

  const sortedMembers = [...(members.data ?? [])].sort((a, b) => b.totalXp - a.totalXp);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{fam.data.name}</CardTitle>
          <CardDescription>
            Invite code:{" "}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(fam.data!.inviteCode);
              }}
              className="ml-1 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-sm font-bold hover:bg-muted/70"
              title="Copy to clipboard"
            >
              {fam.data.inviteCode}
              <Copy className="h-3 w-3" />
            </button>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {profile.familyRole === "parent" || profile.role === "admin" ? (
            <Button size="sm" variant="outline" onClick={() => regen.mutate({})}>
              Regenerate code
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => leave.mutate({})}
            disabled={leave.isPending}
          >
            Leave family
          </Button>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-xl">
          <Trophy className="h-5 w-5 text-accent" />
          Family leaderboard
        </h2>
        <ol className="flex flex-col gap-2">
          {sortedMembers.map((m, idx) => (
            <li
              key={m.userId}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                {idx === 0 ? (
                  <Crown className="h-5 w-5 text-accent" />
                ) : (
                  <span className="inline-flex h-5 w-5 items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                )}
                <span className="font-semibold">
                  {m.firstName ?? m.username}
                  {m.userId === profile.userId ? (
                    <span className="ml-1 text-primary">(you)</span>
                  ) : null}
                </span>
                {m.familyRole ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {m.familyRole}
                  </span>
                ) : null}
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-magic">
                <Sparkles className="h-4 w-4" />
                {m.totalXp.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function NoFamilyState({
  onCreate,
  onJoin,
  createPending,
  joinPending,
  createError,
  joinError,
}: {
  onCreate: (name: string) => void;
  onJoin: (code: string) => void;
  createPending: boolean;
  joinPending: boolean;
  createError?: string;
  joinError?: string;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Create a family</CardTitle>
          <CardDescription>
            Start a family group so siblings can compete on their own leaderboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="fname">Family name</Label>
          <Input
            id="fname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="The Smith Family"
          />
          {createError ? <p className="text-sm text-destructive">{createError}</p> : null}
          <Button
            onClick={() => onCreate(name)}
            disabled={!name || createPending}
            className="mt-2"
          >
            {createPending ? "Creating…" : "Create family"}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Or join with a code</CardTitle>
          <CardDescription>Ask a parent for the family invite code.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="code">Invite code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCD2345"
            maxLength={8}
            className="font-mono uppercase tracking-widest"
          />
          {joinError ? <p className="text-sm text-destructive">{joinError}</p> : null}
          <Button
            onClick={() => onJoin(code)}
            disabled={code.length !== 8 || joinPending}
            className="mt-2"
            variant="outline"
          >
            {joinPending ? "Joining…" : "Join family"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
