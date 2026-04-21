"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  always:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  hourly:  "bg-sky-50 text-sky-700 border-sky-200",
  daily:   "bg-cyan-50 text-cyan-700 border-cyan-200",
  weekly:  "bg-amber-50 text-amber-700 border-amber-200",
  monthly: "bg-orange-50 text-orange-700 border-orange-200",
  yearly:  "bg-slate-50 text-slate-600 border-slate-200",
  never:   "bg-red-50 text-red-600 border-red-200",
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

  const addRow = () => {
    setEntries((prev) => [
      ...prev,
      { url: "", priority: 0.5, changeFrequency: "monthly" },
    ]);
  };

  const removeRow = (i: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateRow = (i: number, patch: Partial<SitemapEntry>) => {
    setEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e))
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSitemapCustomEntries(entries);
      if (result.error) toast.error(result.error);
      else toast.success("Sitemap custom URLs saved");
    });
  };

  const totalUrls = autoEntries.length + entries.filter((e) => e.url.trim()).length;

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">{totalUrls}</span>
          <span className="text-muted-foreground">total URLs in sitemap</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Lock className="size-3" />
          <span>{autoEntries.length} auto-generated</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <RefreshCw className="size-3" />
          <span>{entries.filter((e) => e.url.trim()).length} manual</span>
        </div>
        {siteUrl && (
          <>
            <div className="h-4 w-px bg-border" />
            <a
              href={`${siteUrl}/sitemap.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
            >
              View sitemap.xml <ExternalLink className="size-3" />
            </a>
          </>
        )}
      </div>

      {/* Auto-generated URLs (read-only) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Auto-Generated URLs</p>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Lock className="size-2.5" /> Read-only
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          These are generated automatically from your content. Edit them via their source pages.
        </p>
        <div className="rounded-lg border divide-y overflow-hidden">
          {autoEntries.map((e, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-muted/20 text-sm">
              <span className="flex-1 font-mono text-xs text-foreground truncate">{e.url}</span>
              <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${FREQ_COLORS[e.changeFrequency]}`}>
                {e.changeFrequency}
              </span>
              <span className="shrink-0 w-8 text-right text-[11px] font-mono text-muted-foreground">
                {e.priority.toFixed(1)}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground italic hidden sm:inline">
                {e.source}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Manual entries */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold">Custom URLs</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add extra pages not auto-generated (e.g. landing sections, external resources, custom routes).
          </p>
        </div>

        {entries.length > 0 ? (
          <div className="space-y-2">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_130px_70px_36px] gap-2 px-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">URL / Path</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Frequency</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Priority</p>
              <span />
            </div>

            {entries.map((entry, i) => (
              <div key={i} className="grid grid-cols-[1fr_130px_70px_36px] gap-2 items-center">
                <Input
                  value={entry.url}
                  onChange={(e) => updateRow(i, { url: e.target.value })}
                  placeholder="/about or https://…"
                  className="font-mono text-xs h-8"
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
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p.toFixed(1)}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRow(i)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 py-8 text-center">
            <p className="text-sm text-muted-foreground">No custom URLs yet.</p>
            <p className="text-xs text-muted-foreground mt-0.5">Click "Add URL" to add a custom sitemap entry.</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="size-3.5 mr-1.5" /> Add URL
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={handleSave}
          >
            {isPending ? "Saving…" : "Save Custom URLs"}
          </Button>
        </div>
      </div>
    </div>
  );
}
