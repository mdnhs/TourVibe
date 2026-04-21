"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground mt-1">{children}</p>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-4 mt-6 first:mt-0">
      {children}
    </h3>
  );
}

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
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <input type="hidden" name={name} value={value ? "true" : "false"} />
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
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

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const color = len > max ? "text-destructive" : len > max * 0.9 ? "text-amber-500" : "text-muted-foreground";
  return (
    <span className={`text-[10px] font-mono ${color}`}>
      {len}/{max}
    </span>
  );
}

function TextFieldWithCount({
  id,
  name,
  label,
  hint,
  defaultValue,
  maxLength,
  placeholder,
  required,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultValue: string;
  maxLength: number;
  placeholder?: string;
  required?: boolean;
}) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <CharCount value={val} max={maxLength} />
      </div>
      <Input
        id={id}
        name={name}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength + 20}
      />
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

function TextareaWithCount({
  id,
  name,
  label,
  hint,
  defaultValue,
  maxLength,
  placeholder,
  rows = 3,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultValue: string;
  maxLength: number;
  placeholder?: string;
  rows?: number;
}) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <CharCount value={val} max={maxLength} />
      </div>
      <Textarea
        id={id}
        name={name}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength + 40}
      />
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

function StatusBadge({ enabled, label }: { enabled: boolean; label: string }) {
  return enabled ? (
    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 gap-1 text-[10px]">
      <CheckCircle2 className="size-3" /> {label}
    </Badge>
  ) : (
    <Badge variant="outline" className="text-slate-400 border-slate-200 bg-slate-50 gap-1 text-[10px]">
      <AlertCircle className="size-3" /> {label}
    </Badge>
  );
}

export function SeoForm({ initialData }: { initialData: SeoSettings }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSeoSettings(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("SEO settings saved successfully");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    const fullUrl = `${window.location.origin}${text}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("URL copied to clipboard");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Status strip */}
      <div className="flex flex-wrap gap-2 mb-6 p-3 rounded-lg bg-muted/50 border">
        <StatusBadge enabled={!!initialData.googleAnalyticsId} label="Google Analytics" />
        <StatusBadge enabled={!!initialData.googleTagManagerId} label="GTM" />
        <StatusBadge enabled={!!initialData.metaPixelId} label="Meta Pixel" />
        <StatusBadge enabled={!!initialData.ogImage} label="OG Image" />
        <StatusBadge enabled={initialData.enableJsonLd} label="JSON-LD" />
        <StatusBadge enabled={initialData.robotsIndex} label="Indexed" />
        <StatusBadge enabled={initialData.robotsFollow} label="Followed" />
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6 w-full h-auto flex-wrap gap-1">
          <TabsTrigger value="general">
            <Globe className="size-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="size-3.5" /> Social
          </TabsTrigger>
          <TabsTrigger value="technical">
            <Wrench className="size-3.5" /> Technical
          </TabsTrigger>
          <TabsTrigger value="verification">
            <ShieldCheck className="size-3.5" /> Verify
          </TabsTrigger>
          <TabsTrigger value="structured">
            <Code2 className="size-3.5" /> Schema
          </TabsTrigger>
        </TabsList>

        {/* ── GENERAL ── */}
        <TabsContent value="general" className="space-y-4">
          <TextFieldWithCount
            id="siteTitle"
            name="siteTitle"
            label="Site Name"
            defaultValue={initialData.siteTitle}
            maxLength={60}
            placeholder="TourVibe"
            hint="Used in structured data and as default OG site name."
            required
          />
          <div className="space-y-1.5">
            <Label htmlFor="titleTemplate">Title Template</Label>
            <Input
              id="titleTemplate"
              name="titleTemplate"
              defaultValue={initialData.titleTemplate}
              placeholder="%s | TourVibe"
            />
            <FieldHint>
              Use <code className="bg-muted px-1 rounded text-[10px]">%s</code> as placeholder for page-specific title. e.g. <em>%s | TourVibe</em>
            </FieldHint>
          </div>
          <TextareaWithCount
            id="description"
            name="description"
            label="Default Meta Description"
            defaultValue={initialData.description}
            maxLength={160}
            placeholder="Compelling description under 160 characters…"
            hint="Shown in search engine result snippets. Keep under 160 characters."
            rows={3}
          />
          <div className="space-y-1.5">
            <Label htmlFor="keywords">Meta Keywords</Label>
            <Input
              id="keywords"
              name="keywords"
              defaultValue={initialData.keywords}
              placeholder="car tour, road trip, scenic tours"
            />
            <FieldHint>Comma-separated. Low SEO impact but still used by some engines.</FieldHint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="siteUrl">Canonical Site URL</Label>
            <Input
              id="siteUrl"
              name="siteUrl"
              type="url"
              defaultValue={initialData.siteUrl}
              placeholder="https://tourvibe.com"
            />
            <FieldHint>Used for canonical tags, sitemaps, and structured data.</FieldHint>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <SectionHeading>Open Graph (Facebook, LinkedIn, WhatsApp)</SectionHeading>
          <TextFieldWithCount
            id="ogTitle"
            name="ogTitle"
            label="OG Title"
            defaultValue={initialData.ogTitle}
            maxLength={95}
            placeholder="Leave blank to use default site title"
            hint="Overrides the default title when shared on social media. Max 95 chars."
          />
          <TextareaWithCount
            id="ogDescription"
            name="ogDescription"
            label="OG Description"
            defaultValue={initialData.ogDescription}
            maxLength={200}
            placeholder="Leave blank to use default meta description"
            hint="Description shown in link previews. Max 200 chars."
            rows={3}
          />
          <div className="space-y-1.5">
            <Label htmlFor="ogImage">OG Image URL</Label>
            <Input
              id="ogImage"
              name="ogImage"
              type="url"
              defaultValue={initialData.ogImage}
              placeholder="https://tourvibe.com/og-image.png"
            />
            <FieldHint>Recommended: 1200×630px PNG/JPG. Shown as preview card image.</FieldHint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ogSiteName">OG Site Name</Label>
            <Input
              id="ogSiteName"
              name="ogSiteName"
              defaultValue={initialData.ogSiteName}
              placeholder="TourVibe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ogType">OG Type</Label>
            <select
              id="ogType"
              name="ogType"
              defaultValue={initialData.ogType}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="product">product</option>
            </select>
          </div>

          <SectionHeading>Twitter / X Cards</SectionHeading>
          <div className="space-y-1.5">
            <Label htmlFor="twitterCard">Card Type</Label>
            <select
              id="twitterCard"
              name="twitterCard"
              defaultValue={initialData.twitterCard}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="summary_large_image">summary_large_image (recommended)</option>
              <option value="summary">summary</option>
              <option value="app">app</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="twitterSite">Twitter Site Handle</Label>
            <Input
              id="twitterSite"
              name="twitterSite"
              defaultValue={initialData.twitterSite}
              placeholder="@tourvibe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="twitterCreator">Twitter Creator Handle</Label>
            <Input
              id="twitterCreator"
              name="twitterCreator"
              defaultValue={initialData.twitterCreator}
              placeholder="@username"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="twitterImage">Twitter Image URL</Label>
            <Input
              id="twitterImage"
              name="twitterImage"
              type="url"
              defaultValue={initialData.twitterImage}
              placeholder="Leave blank to use OG Image"
            />
            <FieldHint>Falls back to OG Image if left blank. Min 600×314px.</FieldHint>
          </div>
        </TabsContent>

        {/* ── TECHNICAL ── */}
        <TabsContent value="technical" className="space-y-4">
          <SectionHeading>Crawl &amp; Indexing</SectionHeading>
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

          <SectionHeading>Analytics &amp; Tag Manager</SectionHeading>
          <div className="space-y-1.5">
            <Label htmlFor="googleAnalyticsId">Google Analytics 4 Measurement ID</Label>
            <Input
              id="googleAnalyticsId"
              name="googleAnalyticsId"
              defaultValue={initialData.googleAnalyticsId}
              placeholder="G-XXXXXXXXXX"
            />
            <FieldHint>Starts with <code className="bg-muted px-1 rounded text-[10px]">G-</code>. Found in GA4 &rarr; Admin &rarr; Data Streams.</FieldHint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="googleTagManagerId">Google Tag Manager Container ID</Label>
            <Input
              id="googleTagManagerId"
              name="googleTagManagerId"
              defaultValue={initialData.googleTagManagerId}
              placeholder="GTM-XXXXXXX"
            />
            <FieldHint>Starts with <code className="bg-muted px-1 rounded text-[10px]">GTM-</code>. Loads GTM in &lt;head&gt; and &lt;body&gt;.</FieldHint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metaPixelId">Meta Pixel ID</Label>
            <Input
              id="metaPixelId"
              name="metaPixelId"
              defaultValue={initialData.metaPixelId}
              placeholder="XXXXXXXXXXXXXXXX"
            />
            <FieldHint>Enter your Meta Pixel ID to enable tracking.</FieldHint>
          </div>

          <SectionHeading>Feeds &amp; Catalogs</SectionHeading>
          <div className="space-y-1.5">
            <Label>Facebook Catalog Feed URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={initialData.facebookCatalogUrl}
                className="bg-muted font-mono text-[12px]"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(initialData.facebookCatalogUrl)}
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <FieldHint>
              Use this URL in Facebook Commerce Manager to automatically sync your tour packages to your Facebook Catalog.
            </FieldHint>
          </div>
        </TabsContent>

        {/* ── VERIFICATION ── */}
        <TabsContent value="verification" className="space-y-4">
          <SectionHeading>Search Console Verification</SectionHeading>
          <div className="space-y-1.5">
            <Label htmlFor="googleSiteVerification">Google Search Console</Label>
            <Input
              id="googleSiteVerification"
              name="googleSiteVerification"
              defaultValue={initialData.googleSiteVerification}
              placeholder="Paste the content= value from the meta tag"
            />
            <FieldHint>
              In Search Console, choose &ldquo;HTML tag&rdquo; method and paste only the <code className="bg-muted px-1 rounded text-[10px]">content</code> value here.
            </FieldHint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bingSiteVerification">Bing Webmaster Tools</Label>
            <Input
              id="bingSiteVerification"
              name="bingSiteVerification"
              defaultValue={initialData.bingSiteVerification}
              placeholder="Bing verification content value"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yandexVerification">Yandex Webmaster</Label>
            <Input
              id="yandexVerification"
              name="yandexVerification"
              defaultValue={initialData.yandexVerification}
              placeholder="Yandex verification content value"
            />
          </div>
        </TabsContent>

        {/* ── STRUCTURED DATA ── */}
        <TabsContent value="structured" className="space-y-4">
          <SectionHeading>JSON-LD Structured Data</SectionHeading>
          <ToggleField
            name="enableJsonLd"
            label="Enable JSON-LD structured data"
            hint="Adds Organization + WebSite schema to the homepage. Improves rich results in Google."
            defaultValue={initialData.enableJsonLd}
          />
          <div className="space-y-1.5">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              name="orgName"
              defaultValue={initialData.orgName}
              placeholder="TourVibe"
            />
            <FieldHint>Used in Organization schema. Should match your legal/brand name.</FieldHint>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="orgLogo">Organization Logo URL</Label>
            <Input
              id="orgLogo"
              name="orgLogo"
              type="url"
              defaultValue={initialData.orgLogo}
              placeholder="https://tourvibe.com/logo.png"
            />
            <FieldHint>Recommended: square image, min 112×112px. Used in Knowledge Panel.</FieldHint>
          </div>
          <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preview</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              JSON-LD is injected into each page &lt;head&gt;. Tour detail pages automatically get{" "}
              <code className="bg-muted px-1 rounded">TouristAttraction</code> + <code className="bg-muted px-1 rounded">Product</code> schema
              with name, description, price, and aggregate ratings for rich snippets.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isPending} className="min-w-32">
          {isPending ? "Saving…" : "Save SEO Settings"}
        </Button>
      </div>
    </form>
  );
}
