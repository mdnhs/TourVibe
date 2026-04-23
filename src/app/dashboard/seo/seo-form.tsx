"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateSeoSettings, type SeoSettings } from "./actions";
import {
  Globe,
  Share2,
  Wrench,
  ShieldCheck,
  Code2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Loader2,
  SaveIcon,
} from "lucide-react";

// ── Small helpers ─────────────────────────────────────────────────────────────

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{children}</p>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 mt-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground first:mt-0">
      {children}
    </p>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const over = len > max;
  const warn = !over && len > max * 0.9;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
        over
          ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
          : warn
            ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {len}/{max}
    </span>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function ToggleField({
  name,
  label,
  hint,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
      <input type="hidden" name={name} value={value ? "true" : "false"} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => setValue((v) => !v)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          value ? "bg-primary" : "bg-input"
        }`}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ── Text field with char counter ──────────────────────────────────────────────

function TextFieldWithCount({
  id, name, label, hint, defaultValue, maxLength, placeholder, required,
}: {
  id: string; name: string; label: string; hint?: string;
  defaultValue: string; maxLength: number; placeholder?: string; required?: boolean;
}) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        <CharCount value={val} max={maxLength} />
      </div>
      <Input
        id={id} name={name} value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder} required={required}
        maxLength={maxLength + 20}
        className="h-9 text-sm"
      />
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

function TextareaWithCount({
  id, name, label, hint, defaultValue, maxLength, placeholder, rows = 3,
}: {
  id: string; name: string; label: string; hint?: string;
  defaultValue: string; maxLength: number; placeholder?: string; rows?: number;
}) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        <CharCount value={val} max={maxLength} />
      </div>
      <Textarea
        id={id} name={name} value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder} rows={rows}
        maxLength={maxLength + 40}
        className="resize-none text-sm"
      />
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

// ── Status health badges ──────────────────────────────────────────────────────

function StatusPill({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        enabled
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400"
          : "border-border bg-muted/30 text-muted-foreground"
      }`}
    >
      {enabled ? (
        <CheckCircle2 className="size-3 text-emerald-500" />
      ) : (
        <AlertCircle className="size-3 text-muted-foreground/50" />
      )}
      {label}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function SeoForm({ initialData }: { initialData: SeoSettings }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSeoSettings(formData);
      if (result.error) toast.error(result.error);
      else toast.success("SEO settings saved successfully");
    });
  };

  const copyToClipboard = (text: string) => {
    const fullUrl = `${window.location.origin}${text}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("URL copied");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Integration health strip ── */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Integration Status
        </p>
        <div className="flex flex-wrap gap-2">
          <StatusPill enabled={!!initialData.googleAnalyticsId} label="Google Analytics" />
          <StatusPill enabled={!!initialData.googleTagManagerId} label="GTM" />
          <StatusPill enabled={!!initialData.metaPixelId} label="Meta Pixel" />
          <StatusPill enabled={!!initialData.ogImage} label="OG Image" />
          <StatusPill enabled={initialData.enableJsonLd} label="JSON-LD" />
          <StatusPill enabled={initialData.robotsIndex} label="Indexed" />
          <StatusPill enabled={initialData.robotsFollow} label="Followed" />
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="general">
        <TabsList className="mb-6 grid w-full grid-cols-5 rounded-xl border border-border/60 bg-muted/30 p-1">
          {[
            { value: "general",      label: "General",  Icon: Globe       },
            { value: "social",       label: "Social",   Icon: Share2      },
            { value: "technical",    label: "Technical", Icon: Wrench     },
            { value: "verification", label: "Verify",   Icon: ShieldCheck },
            { value: "structured",   label: "Schema",   Icon: Code2       },
          ].map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── GENERAL ── */}
        <TabsContent value="general" className="space-y-4">
          <TextFieldWithCount
            id="siteTitle" name="siteTitle" label="Site Name"
            defaultValue={initialData.siteTitle} maxLength={60}
            placeholder="TourVibe"
            hint="Used in structured data and as default OG site name."
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="titleTemplate" className="text-sm font-medium">Title Template</Label>
            <Input
              id="titleTemplate" name="titleTemplate"
              defaultValue={initialData.titleTemplate}
              placeholder="%s | TourVibe"
              className="h-9 text-sm"
            />
            <FieldHint>
              Use <code className="rounded bg-muted px-1 text-[10px]">%s</code> as placeholder for page-specific title.{" "}
              e.g. <em>%s | TourVibe</em>
            </FieldHint>
          </div>
          <TextareaWithCount
            id="description" name="description" label="Default Meta Description"
            defaultValue={initialData.description} maxLength={160}
            placeholder="Compelling description under 160 characters…"
            hint="Shown in search result snippets. Keep under 160 characters."
            rows={3}
          />
          <div className="space-y-1.5">
            <Label htmlFor="keywords" className="text-sm font-medium">Meta Keywords</Label>
            <Input
              id="keywords" name="keywords"
              defaultValue={initialData.keywords}
              placeholder="car tour, road trip, scenic tours"
              className="h-9 text-sm"
            />
            <FieldHint>Comma-separated. Low SEO impact but used by some engines.</FieldHint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="siteUrl" className="text-sm font-medium">Canonical Site URL</Label>
            <Input
              id="siteUrl" name="siteUrl" type="url"
              defaultValue={initialData.siteUrl}
              placeholder="https://tourvibe.com"
              className="h-9 text-sm"
            />
            <FieldHint>Used for canonical tags, sitemaps, and structured data.</FieldHint>
          </div>
        </TabsContent>

        {/* ── SOCIAL ── */}
        <TabsContent value="social" className="space-y-4">
          <SectionLabel>Open Graph — Facebook · LinkedIn · WhatsApp</SectionLabel>
          <TextFieldWithCount
            id="ogTitle" name="ogTitle" label="OG Title"
            defaultValue={initialData.ogTitle} maxLength={95}
            placeholder="Leave blank to use default site title"
            hint="Overrides title when shared on social media. Max 95 chars."
          />
          <TextareaWithCount
            id="ogDescription" name="ogDescription" label="OG Description"
            defaultValue={initialData.ogDescription} maxLength={200}
            placeholder="Leave blank to use default meta description"
            hint="Description in link previews. Max 200 chars."
            rows={3}
          />
          <div className="space-y-1.5">
            <Label htmlFor="ogImage" className="text-sm font-medium">OG Image URL</Label>
            <Input id="ogImage" name="ogImage" type="url"
              defaultValue={initialData.ogImage}
              placeholder="https://tourvibe.com/og-image.png"
              className="h-9 text-sm"
            />
            <FieldHint>Recommended: 1200×630px PNG/JPG. Shown as preview card image.</FieldHint>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ogSiteName" className="text-sm font-medium">OG Site Name</Label>
              <Input id="ogSiteName" name="ogSiteName"
                defaultValue={initialData.ogSiteName}
                placeholder="TourVibe" className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ogType" className="text-sm font-medium">OG Type</Label>
              <select
                id="ogType" name="ogType" defaultValue={initialData.ogType}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="website">website</option>
                <option value="article">article</option>
                <option value="product">product</option>
              </select>
            </div>
          </div>

          <SectionLabel>Twitter / X Cards</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="twitterCard" className="text-sm font-medium">Card Type</Label>
              <select
                id="twitterCard" name="twitterCard" defaultValue={initialData.twitterCard}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="summary_large_image">summary_large_image (recommended)</option>
                <option value="summary">summary</option>
                <option value="app">app</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="twitterSite" className="text-sm font-medium">Site Handle</Label>
              <Input id="twitterSite" name="twitterSite"
                defaultValue={initialData.twitterSite}
                placeholder="@tourvibe" className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="twitterCreator" className="text-sm font-medium">Creator Handle</Label>
              <Input id="twitterCreator" name="twitterCreator"
                defaultValue={initialData.twitterCreator}
                placeholder="@username" className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="twitterImage" className="text-sm font-medium">Twitter Image URL</Label>
              <Input id="twitterImage" name="twitterImage" type="url"
                defaultValue={initialData.twitterImage}
                placeholder="Falls back to OG Image" className="h-9 text-sm"
              />
            </div>
          </div>
        </TabsContent>

        {/* ── TECHNICAL ── */}
        <TabsContent value="technical" className="space-y-4">
          <SectionLabel>Crawl &amp; Indexing</SectionLabel>
          <ToggleField
            name="robotsIndex"
            label="Allow search engines to index this site"
            hint="Disabling adds 'noindex' to all pages — removes site from search results."
            defaultValue={initialData.robotsIndex}
          />
          <ToggleField
            name="robotsFollow"
            label="Allow search engines to follow links"
            hint="Disabling adds 'nofollow' globally — link equity won't be passed."
            defaultValue={initialData.robotsFollow}
          />

          <SectionLabel>Analytics &amp; Tag Manager</SectionLabel>
          <div className="space-y-1.5">
            <Label htmlFor="googleAnalyticsId" className="text-sm font-medium">
              Google Analytics 4 Measurement ID
            </Label>
            <Input id="googleAnalyticsId" name="googleAnalyticsId"
              defaultValue={initialData.googleAnalyticsId}
              placeholder="G-XXXXXXXXXX" className="h-9 font-mono text-sm"
            />
            <FieldHint>
              Starts with <code className="rounded bg-muted px-1 text-[10px]">G-</code>. Found in GA4 → Admin → Data Streams.
            </FieldHint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="googleTagManagerId" className="text-sm font-medium">
              Google Tag Manager Container ID
            </Label>
            <Input id="googleTagManagerId" name="googleTagManagerId"
              defaultValue={initialData.googleTagManagerId}
              placeholder="GTM-XXXXXXX" className="h-9 font-mono text-sm"
            />
            <FieldHint>
              Starts with <code className="rounded bg-muted px-1 text-[10px]">GTM-</code>. Loads GTM in &lt;head&gt; and &lt;body&gt;.
            </FieldHint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metaPixelId" className="text-sm font-medium">Meta Pixel ID</Label>
            <Input id="metaPixelId" name="metaPixelId"
              defaultValue={initialData.metaPixelId}
              placeholder="XXXXXXXXXXXXXXXX" className="h-9 font-mono text-sm"
            />
          </div>

          <SectionLabel>Feeds &amp; Catalogs</SectionLabel>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Facebook Catalog Feed URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly value={initialData.facebookCatalogUrl}
                className="h-9 bg-muted font-mono text-xs"
              />
              <Button
                type="button" variant="outline" size="icon"
                className="size-9 shrink-0"
                onClick={() => copyToClipboard(initialData.facebookCatalogUrl)}
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <FieldHint>
              Use in Facebook Commerce Manager to sync tour packages to your catalog.
            </FieldHint>
          </div>
        </TabsContent>

        {/* ── VERIFICATION ── */}
        <TabsContent value="verification" className="space-y-4">
          <SectionLabel>Search Console Verification</SectionLabel>
          <div className="space-y-1.5">
            <Label htmlFor="googleSiteVerification" className="text-sm font-medium">
              Google Search Console
            </Label>
            <Input id="googleSiteVerification" name="googleSiteVerification"
              defaultValue={initialData.googleSiteVerification}
              placeholder="Paste the content= value from the meta tag"
              className="h-9 font-mono text-sm"
            />
            <FieldHint>
              In Search Console, choose "HTML tag" method and paste only the{" "}
              <code className="rounded bg-muted px-1 text-[10px]">content</code> value here.
            </FieldHint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bingSiteVerification" className="text-sm font-medium">
              Bing Webmaster Tools
            </Label>
            <Input id="bingSiteVerification" name="bingSiteVerification"
              defaultValue={initialData.bingSiteVerification}
              placeholder="Bing verification content value"
              className="h-9 font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yandexVerification" className="text-sm font-medium">
              Yandex Webmaster
            </Label>
            <Input id="yandexVerification" name="yandexVerification"
              defaultValue={initialData.yandexVerification}
              placeholder="Yandex verification content value"
              className="h-9 font-mono text-sm"
            />
          </div>
        </TabsContent>

        {/* ── STRUCTURED DATA ── */}
        <TabsContent value="structured" className="space-y-4">
          <SectionLabel>JSON-LD Structured Data</SectionLabel>
          <ToggleField
            name="enableJsonLd"
            label="Enable JSON-LD structured data"
            hint="Adds Organization + WebSite schema to the homepage. Improves rich results in Google."
            defaultValue={initialData.enableJsonLd}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="orgName" className="text-sm font-medium">Organization Name</Label>
              <Input id="orgName" name="orgName"
                defaultValue={initialData.orgName}
                placeholder="TourVibe" className="h-9 text-sm"
              />
              <FieldHint>Used in Organization schema. Should match your legal/brand name.</FieldHint>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="orgLogo" className="text-sm font-medium">Organization Logo URL</Label>
              <Input id="orgLogo" name="orgLogo" type="url"
                defaultValue={initialData.orgLogo}
                placeholder="https://tourvibe.com/logo.png"
                className="h-9 text-sm"
              />
              <FieldHint>Recommended: square, min 112×112px. Used in Knowledge Panel.</FieldHint>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Preview
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              JSON-LD is injected into each page &lt;head&gt;. Tour detail pages automatically get{" "}
              <code className="rounded bg-muted px-1">TouristAttraction</code> +{" "}
              <code className="rounded bg-muted px-1">Product</code> schema with name, description,
              price, and aggregate ratings for rich snippets.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Submit ── */}
      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button type="submit" disabled={isPending} className="min-w-36 gap-2">
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <SaveIcon className="size-3.5" />
              Save SEO Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
