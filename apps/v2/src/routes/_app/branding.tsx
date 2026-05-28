import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import imageCompression from "browser-image-compression";
import { isValidHslComponents } from "@heroquest/db";
import {
  getBrandConfig,
  presignBrandUpload,
  updateBrandConfig,
} from "@/server/fns/brand";
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

/**
 * Admin → Branding. Identity + theme + asset uploads in one page.
 * Saves go through `updateBrandConfig`, which busts the KV cache so the
 * next request reflects the change.
 */
export const Route = createFileRoute("/_app/branding")({
  beforeLoad: ({ context }) => {
    const role = (context as { profile?: { role?: string } } | undefined)?.profile?.role;
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: BrandingPage,
});

const THEME_FIELDS = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "magic", label: "Magic" },
  { key: "flame", label: "Flame" },
] as const;

function BrandingPage() {
  const queryClient = useQueryClient();
  const brandQ = useQuery({ queryKey: ["brand-config"], queryFn: () => getBrandConfig() });
  const update = useMutation({
    mutationFn: updateBrandConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["brand-config"] }),
  });

  if (!brandQ.data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const brand = brandQ.data;

  async function uploadAsset(kind: "logo" | "mascot", file: File): Promise<string | null> {
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: kind === "logo" ? 0.25 : 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });
      const intent = await presignBrandUpload({
        data: { kind, contentType: compressed.type || "image/png" },
      });
      const put = await fetch(intent.uploadUrl, {
        method: "PUT",
        headers: { "content-type": compressed.type || "image/png" },
        body: compressed,
      });
      if (!put.ok) throw new Error("Upload failed");
      return intent.key;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  function onIdentitySave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    update.mutate({
      data: {
        appName: String(form.get("appName") || ""),
        appShortName: String(form.get("appShortName") || ""),
        currencyName: String(form.get("currencyName") || ""),
        currencyShort: String(form.get("currencyShort") || ""),
        xpName: String(form.get("xpName") || ""),
      },
    });
  }

  function onThemeSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const patch: Record<string, string> = {};
    for (const { key } of THEME_FIELDS) {
      const v = String(form.get(`theme.${key}`) || "").trim();
      if (v && isValidHslComponents(v)) patch[key] = v;
    }
    const headingFont = String(form.get("theme.headingFont") || "").trim();
    const bodyFont = String(form.get("theme.bodyFont") || "").trim();
    if (headingFont) patch.headingFont = headingFont;
    if (bodyFont) patch.bodyFont = bodyFont;
    update.mutate({ data: { theme: patch } });
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-3xl">Branding</h1>
        <p className="text-sm text-muted-foreground">
          Customize the look, mascot, and terminology your community sees. Changes propagate
          within 60 seconds.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
          <CardDescription>App name, terminology, and assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onIdentitySave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field id="appName" label="App name" defaultValue={brand.appName} />
              <Field
                id="appShortName"
                label="Short name (home screen)"
                defaultValue={brand.appShortName}
              />
              <Field
                id="currencyName"
                label='Currency name (was "Brave Coins")'
                defaultValue={brand.currencyName}
              />
              <Field
                id="currencyShort"
                label="Currency short (1-3 chars)"
                defaultValue={brand.currencyShort}
              />
              <Field
                id="xpName"
                label='XP name (was "XP")'
                defaultValue={brand.xpName}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <AssetUploader
                kind="logo"
                currentUrl={brand.logoUrl}
                onUploaded={(key) => update.mutate({ data: { logoUrl: key } })}
                upload={uploadAsset}
              />
              <AssetUploader
                kind="mascot"
                currentUrl={brand.mascotUrl}
                onUploaded={(key) => update.mutate({ data: { mascotUrl: key } })}
                upload={uploadAsset}
              />
            </div>

            <Button type="submit" disabled={update.isPending} className="w-fit">
              {update.isPending ? "Saving…" : "Save identity"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            HSL components — "262 80% 60%". Bad input is silently dropped, defaults stay.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onThemeSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {THEME_FIELDS.map((f) => (
                <Field
                  key={f.key}
                  id={`theme.${f.key}`}
                  label={f.label}
                  defaultValue={brand.theme[f.key as keyof typeof brand.theme] as string}
                  hint={
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-border align-middle"
                      style={{ background: `hsl(${brand.theme[f.key]})` }}
                    />
                  }
                />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field
                id="theme.headingFont"
                label="Heading font"
                defaultValue={brand.theme.headingFont}
              />
              <Field
                id="theme.bodyFont"
                label="Body font"
                defaultValue={brand.theme.bodyFont}
              />
            </div>
            <Button type="submit" disabled={update.isPending} className="w-fit">
              {update.isPending ? "Saving…" : "Save theme"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  id,
  label,
  defaultValue,
  hint,
}: {
  id: string;
  label: string;
  defaultValue?: string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {label}
        {hint}
      </Label>
      <Input id={id} name={id} defaultValue={defaultValue ?? ""} />
    </div>
  );
}

function AssetUploader({
  kind,
  currentUrl,
  onUploaded,
  upload,
}: {
  kind: "logo" | "mascot";
  currentUrl: string | null;
  onUploaded: (key: string) => void;
  upload: (kind: "logo" | "mascot", file: File) => Promise<string | null>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Label>{kind === "logo" ? "Logo" : "Mascot"} (PNG / JPG / SVG)</Label>
      <div className="flex items-center gap-3">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={kind}
            className="h-14 w-14 rounded-lg border border-border bg-muted object-contain"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
            none
          </div>
        )}
        <label className="cursor-pointer rounded-xl border border-primary bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
          {busy ? "Uploading…" : `Upload ${kind}`}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              const key = await upload(kind, file);
              setBusy(false);
              if (key) onUploaded(key);
            }}
          />
        </label>
        {currentUrl ? (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => onUploaded("")}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
