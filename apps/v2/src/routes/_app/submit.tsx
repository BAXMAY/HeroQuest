import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import { submitQuest } from "@/server/fns/quests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export const Route = createFileRoute("/_app/submit")({
  loader: ({ context }) => context,
  component: SubmitPage,
});

const CATEGORIES = [
  { value: "family", label: "Family / Respect" },
  { value: "environment", label: "Environment" },
  { value: "animals", label: "Animals" },
  { value: "community", label: "Community" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
] as const;

function SubmitPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["value"]>("family");
  const [status, setStatus] = useState<"idle" | "compressing" | "uploading" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Add a photo of your deed");
      return;
    }
    setError(null);

    try {
      setStatus("compressing");
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      setStatus("uploading");
      const intentRes = await fetch("/api/uploads/quest-photo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentType: compressed.type || "image/jpeg" }),
      });
      if (!intentRes.ok) throw new Error("Upload intent failed");
      const { uploadUrl, key } = (await intentRes.json()) as {
        uploadUrl: string;
        key: string;
      };

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "content-type": compressed.type || "image/jpeg" },
        body: compressed,
      });
      if (!putRes.ok) throw new Error("Upload to R2 failed");

      setStatus("submitting");
      await submitQuest({ data: { description, category, photoR2Key: key } });
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setStatus("idle");
    }
  }

  const busyLabel: Record<typeof status, string> = {
    idle: "Submit quest",
    compressing: "Compressing photo…",
    uploading: "Uploading…",
    submitting: "Submitting…",
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit a quest</CardTitle>
          <CardDescription>
            Take a photo of your good deed and tell us what you did.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="photo">Photo proof</Label>
              <Input
                id="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={onFileChange}
              />
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-2 max-h-64 w-fit rounded-xl border border-border object-contain"
                />
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number]["value"])}
                className="h-11 rounded-xl border border-input bg-card px-4 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">What did you do?</Label>
              <Textarea
                id="description"
                placeholder="Describe your good deed (at least 10 characters)…"
                minLength={10}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={status !== "idle" || !file || description.length < 10}
              size="lg"
              className="w-full"
            >
              {busyLabel[status]}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
