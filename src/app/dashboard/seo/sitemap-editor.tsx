"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Lock,
  Loader2,
  SaveIcon,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  updateSitemapCustomEntries,
  type SitemapEntry,
  type ChangeFrequency,
} from "./actions";

const FREQ_OPTIONS: ChangeFrequency[] = [
  "always", "hourly", "daily", "weekly", "monthly", "yearly", "never",
];

const PRIORITY_OPTIONS = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

const FREQ_COLORS: Record<ChangeFrequency, string> = {
  always:  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400",
  hourly:  "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/40 dark:bg-sky-950/30 dark:text-sky-400",
  daily:   "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800/40 dark:bg-cyan-950/30 dark:text-cyan-400",
  weekly:  "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-400",
  monthly: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/40 dark:bg-orange-950/30 dark:text-orange-400",
  yearly:  "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  never:   "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-400",
};

interface AutoEntry {
  url: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  source: string;
}

interface SitemapEditorProps {
  autoEntries: AutoEntry[];
  customEntries: SitemapEntry[];
  siteUrl: string;
}

export function SitemapEditor({ autoEntries, customEntries, siteUrl }: SitemapEditorProps) {
  const [entries, setEntries] = useState<SitemapEntry[]>(customEntries);
  const [isPending, startTransition] = useTransition();

  const addRow = () =>
    setEntries((prev) => [...prev, { url: "", priority: 0.5, changeFrequency: "monthly" }]);

  const removeRow = (i: number) =>
    setEntries((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = (i: number, patch: Partial<SitemapEntry>) =>
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSitemapCustomEntries(entries);
      if (result.error) toast.error(result.error);
      else toast.success("Sitemap custom URLs saved");
    });
  };

  const totalUrls = autoEntries.length + entries.filter((e) => e.url.trim()).length;
  const manualCount = entries.filter((e) => e.url.trim()).length;

  return (
    <div className="space-y-6">

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total URLs",
            value: totalUrls,
            icon: Globe,
            color: "text-sky-600 dark:text-sky-400",
            bg: "bg-sky-100 dark:bg-sky-950/50",
          },
          {
            label: "Auto-generated",
            value: autoEntries.length,
            icon: Lock,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-100 dark:bg-emerald-950/50",
          },
          {
            label: "Custom URLs",
            value: manualCount,
            icon: RefreshCw,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-950/50",
          },
          {
            label: "View Sitemap",
            value: null,
            icon: ExternalLink,
            color: "text-violet-600 dark:text-violet-400",
            bg: "bg-violet-100 dark:bg-violet-950/50",
            href: siteUrl ? `${siteUrl}/sitemap.xml` : null,
          },
        ].map((item) => {
          const Icon = item.icon;
          const inner = (
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                <Icon className={`size-4 ${item.color}`} />
              </div>
              <div>
                {item.value !== null ? (
                  <>
                    <p className="text-lg font-bold tabular-nums leading-none">{item.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
                  </>
                ) : (
                  <>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Open XML →</p>
                  </>
                )}
              </div>
            </div>
          );

          return item.href ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-opacity hover:opacity-80"
            >
              {inner}
            </a>
          ) : (
            <div key={item.label}>{inner}</div>
          );
        })}
      </div>

      {/* ── Auto-generated URLs (read-only) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Auto-Generated URLs</p>
          <span className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            <Lock className="size-2.5" /> Read-only
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Generated automatically from your content. Edit via their source pages.
        </p>

        <div className="overflow-hidden rounded-xl border border-border/60">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_100px_52px_80px] gap-3 border-b border-border/60 bg-muted/30 px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">URL</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Frequency</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</p>
            <p className="hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:block">Source</p>
          </div>
          <div className="divide-y divide-border/40">
            {autoEntries.map((e, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_100px_52px_80px] items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/20"
              >
                <span className="truncate font-mono text-xs text-foreground">{e.url}</span>
                <span
                  className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${FREQ_COLORS[e.changeFrequency]}`}
                >
                  {e.changeFrequency}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {e.priority.toFixed(1)}
                </span>
                <span className="hidden text-[10px] italic text-muted-foreground sm:block">
                  {e.source}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Custom URLs ── */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold">Custom URLs</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add extra pages not auto-generated — landing sections, external resources, custom routes.
          </p>
        </div>

        {entries.length > 0 ? (
          <div className="space-y-2">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_130px_70px_36px] gap-2 px-1">
              {["URL / Path", "Frequency", "Priority", ""].map((h) => (
                <p key={h} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {h}
                </p>
              ))}
            </div>

            {entries.map((entry, i) => (
              <div key={i} className="grid grid-cols-[1fr_130px_70px_36px] items-center gap-2">
                <Input
                  value={entry.url}
                  onChange={(e) => updateRow(i, { url: e.target.value })}
                  placeholder="/about or https://…"
                  className="h-8 font-mono text-xs"
                />
                <select
                  value={entry.changeFrequency}
                  onChange={(e) => updateRow(i, { changeFrequency: e.target.value as ChangeFrequency })}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {FREQ_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <select
                  value={entry.priority}
                  onChange={(e) => updateRow(i, { priority: parseFloat(e.target.value) })}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p.toFixed(1)}</option>
                  ))}
                </select>
                <Button
                  type="button" variant="ghost" size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRow(i)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 py-10 text-center">
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted/40">
              <Plus className="size-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No custom URLs yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground/60">
              Click &ldquo;Add URL&rdquo; to add a custom sitemap entry
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
            <Plus className="size-3.5" /> Add URL
          </Button>
          <Button type="button" size="sm" className="gap-1.5" disabled={isPending} onClick={handleSave}>
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <SaveIcon className="size-3.5" /> Save Custom URLs
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
