import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllUsers, setUserRole } from "@/server/fns/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: ({ context }) => {
    const role = (context as { profile?: { role?: string } } | undefined)?.profile?.role;
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => listAllUsers() });
  const setRole = useMutation({
    mutationFn: setUserRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-3xl">Admin · Users</h1>
      {users.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All users ({users.data?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-border">
              {users.data?.map((row) => (
                <li
                  key={row.user.id}
                  className="flex flex-col items-start justify-between gap-3 py-3 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold">{row.profile?.username ?? row.user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.user.email} · {row.profile?.role ?? "no profile"} ·{" "}
                      {row.profile?.totalXp ?? 0} XP
                    </p>
                  </div>
                  {row.profile ? (
                    <div className="flex flex-wrap gap-2">
                      {(["student", "parent", "admin"] as const).map((r) => (
                        <Button
                          key={r}
                          size="sm"
                          variant={row.profile?.role === r ? "default" : "outline"}
                          disabled={row.profile?.role === r || setRole.isPending}
                          onClick={() =>
                            setRole.mutate({ data: { userId: row.user.id, role: r } })
                          }
                        >
                          {r}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
