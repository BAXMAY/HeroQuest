import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { completeOnboarding } from "@/server/fns/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export const Route = createFileRoute("/_auth/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    setPending(true);
    try {
      await completeOnboarding({
        data: {
          username: String(form.get("username") ?? ""),
          firstName: String(form.get("firstName") ?? ""),
          lastName: String(form.get("lastName") ?? "") || undefined,
          gender: (form.get("gender") as "male" | "female" | "") || undefined,
          birthday: (String(form.get("birthday") ?? "") || undefined) as string | undefined,
          locale: (form.get("locale") as "en" | "th") ?? "th",
        },
      });
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your hero</CardTitle>
        <CardDescription>Just a few quick details to get you started.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Hero name (username)</Label>
            <Input id="username" name="username" required minLength={3} maxLength={24} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required maxLength={40} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" maxLength={40} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                className="h-11 rounded-xl border border-input bg-card px-4 text-sm"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input id="birthday" name="birthday" type="date" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="locale">Language</Label>
            <select
              id="locale"
              name="locale"
              defaultValue="th"
              className="h-11 rounded-xl border border-input bg-card px-4 text-sm"
            >
              <option value="th">ไทย</option>
              <option value="en">English</option>
            </select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending} size="lg" className="w-full">
            {pending ? "Saving…" : "Begin my quest"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
