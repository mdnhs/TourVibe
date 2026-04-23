"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, SaveIcon } from "lucide-react";
import { updateSiteConfig } from "./actions";
import { type SiteConfig } from "./types";

const ICON_OPTIONS = [
  "Compass", "Plane", "Users", "Map", "Headset",
  "Car", "Star", "Shield", "Clock", "MapPin", "Camera", "Heart",
];

function Field({
  label,
  name,
  defaultValue,
  hint,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TextareaField({
  label,
  name,
  defaultValue,
  hint,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} defaultValue={defaultValue ?? ""} rows={rows} />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function IconSelect({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>Icon</Label>
      <Select name={name} defaultValue={defaultValue ?? "Compass"}>
        <SelectTrigger id={name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ICON_OPTIONS.map((icon) => (
            <SelectItem key={icon} value={icon}>{icon}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SiteConfigForm({ config }: { config: SiteConfig }) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSiteConfig(fd);
      if (res?.error) toast.error(res.error);
      else toast.success("Site config saved.");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* ── General ── */}
        <TabsContent value="general" className="space-y-4">
          <Field
            label="Site Name"
            name="siteName"
            defaultValue={config.siteName}
            hint="Displayed in navbar, footer and browser tab."
          />
          <Field
            label="Tagline"
            name="tagline"
            defaultValue={config.tagline}
            hint="Short description under the logo."
          />
          <Field
            label="Logo URL"
            name="logoUrl"
            defaultValue={config.logoUrl}
            hint="Leave empty to use the default car icon."
          />
          <Field
            label="Footer Tagline"
            name="footerTagline"
            defaultValue={config.footerTagline}
          />
        </TabsContent>

        {/* ── Hero ── */}
        <TabsContent value="hero" className="space-y-4">
          <Field
            label="Hero Background Image URL"
            name="heroImage"
            defaultValue={config.heroImage}
            hint='Use an absolute URL or a path like "/cover.jpg".'
          />
          <Field
            label="Badge Text"
            name="heroBadgeText"
            defaultValue={config.heroBadgeText}
            hint='Small pill above the headline, e.g. "Your Journey Starts Here".'
          />
          <Field
            label="Hero Title"
            name="heroTitle"
            defaultValue={config.heroTitle}
            hint='Full headline text, e.g. "Discover Ireland."'
          />
          <Field
            label="Highlighted Word"
            name="heroTitleHighlight"
            defaultValue={config.heroTitleHighlight}
            hint="Exact word/phrase in the title to underline-highlight."
          />
          <TextareaField
            label="Hero Subtitle"
            name="heroSubtitle"
            defaultValue={config.heroSubtitle}
            rows={2}
          />
          <div>
            <p className="mb-2 text-sm font-medium">Popular Tags (up to 3)</p>
            <div className="grid grid-cols-[60px_1fr] gap-2 mb-2 items-end">
              <Field label="Emoji" name="heroTag1Emoji" defaultValue={config.heroTag1Emoji} />
              <Field label="Label" name="heroTag1Label" defaultValue={config.heroTag1Label} />
            </div>
            <div className="grid grid-cols-[60px_1fr] gap-2 mb-2 items-end">
              <Field label="Emoji" name="heroTag2Emoji" defaultValue={config.heroTag2Emoji} />
              <Field label="Label" name="heroTag2Label" defaultValue={config.heroTag2Label} />
            </div>
            <div className="grid grid-cols-[60px_1fr] gap-2 items-end">
              <Field label="Emoji" name="heroTag3Emoji" defaultValue={config.heroTag3Emoji} />
              <Field label="Label" name="heroTag3Label" defaultValue={config.heroTag3Label} />
            </div>
          </div>
        </TabsContent>

        {/* ── About ── */}
        <TabsContent value="about" className="space-y-4">
          <Field
            label="About Title"
            name="aboutTitle"
            defaultValue={config.aboutTitle}
          />
          <Field
            label="Highlighted Word"
            name="aboutTitleHighlight"
            defaultValue={config.aboutTitleHighlight}
            hint="Exact word in the title to underline."
          />
          <TextareaField
            label="About Description"
            name="aboutDescription"
            defaultValue={config.aboutDescription}
            rows={4}
          />
          <div>
            <p className="mb-2 text-sm font-medium">Stats (3 items)</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stat 1 Value" name="aboutStat1Value" defaultValue={config.aboutStat1Value} />
              <Field label="Stat 1 Label" name="aboutStat1Label" defaultValue={config.aboutStat1Label} />
              <Field label="Stat 2 Value" name="aboutStat2Value" defaultValue={config.aboutStat2Value} />
              <Field label="Stat 2 Label" name="aboutStat2Label" defaultValue={config.aboutStat2Label} />
              <Field label="Stat 3 Value" name="aboutStat3Value" defaultValue={config.aboutStat3Value} />
              <Field label="Stat 3 Label" name="aboutStat3Label" defaultValue={config.aboutStat3Label} />
            </div>
          </div>
        </TabsContent>

        {/* ── Services ── */}
        <TabsContent value="services" className="space-y-6">
          <div className="space-y-4">
            <Field label="Badge Text" name="servicesBadgeText" defaultValue={config.servicesBadgeText} hint='Pill above heading, e.g. "What We Offer".' />
            <Field label="Section Title" name="servicesSectionTitle" defaultValue={config.servicesSectionTitle} hint="Full heading text." />
            <Field label="Highlighted Word" name="servicesSectionHighlight" defaultValue={config.servicesSectionHighlight} hint="Exact word in the title to underline." />
            <TextareaField label="Section Subtitle" name="servicesSectionSubtitle" defaultValue={config.servicesSectionSubtitle} rows={2} />
          </div>
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <div key={n} className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700">Service {n}{n === 1 ? " (Featured)" : ""}</p>
              <Field label="Title" name={`service${n}Title`} defaultValue={(config as SiteConfig)[`service${n}Title` as keyof SiteConfig]} />
              <TextareaField label="Description" name={`service${n}Description`} defaultValue={(config as SiteConfig)[`service${n}Description` as keyof SiteConfig]} rows={2} />
              <IconSelect name={`service${n}Icon`} defaultValue={(config as SiteConfig)[`service${n}Icon` as keyof SiteConfig]} />
            </div>
          ))}
        </TabsContent>

        {/* ── Contact ── */}
        <TabsContent value="contact" className="space-y-4">
          <Field label="Email" name="contactEmail" defaultValue={config.contactEmail} type="email" />
          <Field label="Phone" name="contactPhone" defaultValue={config.contactPhone} />
          <Field label="Location" name="contactLocation" defaultValue={config.contactLocation} />
        </TabsContent>
      </Tabs>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <SaveIcon className="mr-2 size-4" />}
        Save Changes
      </Button>
    </form>
  );
}
