"use client";

import { useTransition, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, SaveIcon, CheckIcon, RotateCcwIcon } from "lucide-react";
import { saveThemeConfig } from "./actions";
import { type ThemeConfig, themeDefaults } from "@/lib/theme";
import { cn } from "@/lib/utils";

const COLOR_PRESETS: { name: string; hue: number; bg: string }[] = [
  { name: "Rose",    hue: 15,  bg: "oklch(0.64 0.26 15)" },
  { name: "Orange",  hue: 45,  bg: "oklch(0.72 0.22 45)" },
  { name: "Amber",   hue: 75,  bg: "oklch(0.76 0.20 75)" },
  { name: "Lime",    hue: 125, bg: "oklch(0.72 0.22 125)" },
  { name: "Emerald", hue: 160, bg: "oklch(0.65 0.22 160)" },
  { name: "Teal",    hue: 185, bg: "oklch(0.65 0.20 185)" },
  { name: "Cyan",    hue: 200, bg: "oklch(0.68 0.20 200)" },
  { name: "Sky",     hue: 230, bg: "oklch(0.65 0.22 230)" },
  { name: "Blue",    hue: 250, bg: "oklch(0.58 0.24 250)" },
  { name: "Indigo",  hue: 264, bg: "oklch(0.52 0.24 264)" },
  { name: "Violet",  hue: 290, bg: "oklch(0.56 0.24 290)" },
  { name: "Purple",  hue: 305, bg: "oklch(0.58 0.24 305)" },
  { name: "Fuchsia", hue: 320, bg: "oklch(0.62 0.26 320)" },
  { name: "Pink",    hue: 5,   bg: "oklch(0.65 0.24 5)" },
  { name: "Slate",   hue: 220, bg: "oklch(0.55 0.06 220)" },
  { name: "Zinc",    hue: 240, bg: "oklch(0.55 0.04 240)" },
];

const RADIUS_PRESETS: { label: string; value: number; preview: string }[] = [
  { label: "Sharp",    value: 0.25,  preview: "rounded-sm" },
  { label: "Compact",  value: 0.5,   preview: "rounded" },
  { label: "Default",  value: 0.875, preview: "rounded-lg" },
  { label: "Rounded",  value: 1.25,  preview: "rounded-2xl" },
  { label: "Pill",     value: 1.75,  preview: "rounded-full" },
];

function applyLivePreview(hue: number, radius: number) {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");

  const vars: Record<string, string> = isDark
    ? {
        "--primary": `oklch(0.68 0.24 ${hue})`,
        "--primary-foreground": `oklch(0.13 0.03 ${hue})`,
        "--ring": `oklch(0.60 0.24 ${hue})`,
        "--secondary": `oklch(0.23 0.05 ${hue})`,
        "--muted": `oklch(0.23 0.04 ${hue})`,
        "--muted-foreground": `oklch(0.63 0.06 ${hue})`,
        "--accent": `oklch(0.26 0.07 ${hue})`,
        "--border": `oklch(1 0 0 / 10%)`,
        "--input": `oklch(1 0 0 / 15%)`,
        "--background": `oklch(0.13 0.03 ${hue})`,
        "--foreground": `oklch(0.97 0.01 ${hue})`,
        "--card": `oklch(0.175 0.04 ${hue})`,
        "--card-foreground": `oklch(0.97 0.01 ${hue})`,
        "--sidebar": `oklch(0.155 0.04 ${hue})`,
        "--sidebar-primary": `oklch(0.68 0.24 ${hue})`,
        "--sidebar-accent": `oklch(0.22 0.06 ${hue})`,
        "--sidebar-border": `oklch(1 0 0 / 12%)`,
        "--sidebar-ring": `oklch(0.60 0.24 ${hue})`,
      }
    : {
        "--primary": `oklch(0.52 0.24 ${hue})`,
        "--primary-foreground": `oklch(0.99 0.005 ${hue})`,
        "--ring": `oklch(0.58 0.24 ${hue})`,
        "--secondary": `oklch(0.95 0.04 ${hue})`,
        "--muted": `oklch(0.95 0.015 ${hue})`,
        "--muted-foreground": `oklch(0.52 0.05 ${hue})`,
        "--accent": `oklch(0.93 0.06 ${hue})`,
        "--border": `oklch(0.90 0.02 ${hue})`,
        "--input": `oklch(0.90 0.02 ${hue})`,
        "--background": `oklch(0.99 0.008 ${hue})`,
        "--foreground": `oklch(0.19 0.05 ${hue})`,
        "--card": `oklch(1 0.006 ${hue})`,
        "--card-foreground": `oklch(0.19 0.05 ${hue})`,
        "--sidebar": `oklch(0.975 0.015 ${hue})`,
        "--sidebar-primary": `oklch(0.52 0.24 ${hue})`,
        "--sidebar-accent": `oklch(0.93 0.04 ${hue})`,
        "--sidebar-border": `oklch(0.90 0.02 ${hue})`,
        "--sidebar-ring": `oklch(0.58 0.24 ${hue})`,
      };

  vars["--radius"] = `${radius}rem`;

  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v);
  }
}

export function AppearanceForm({ config }: { config: ThemeConfig }) {
  const [pending, startTransition] = useTransition();
  const [hue, setHue] = useState(config.primaryHue);
  const [radius, setRadius] = useState(config.radius);

  const updateHue = useCallback((h: number) => {
    setHue(h);
    applyLivePreview(h, radius);
  }, [radius]);

  const updateRadius = useCallback((r: number) => {
    setRadius(r);
    applyLivePreview(hue, r);
  }, [hue]);

  const reset = () => {
    setHue(themeDefaults.primaryHue);
    setRadius(themeDefaults.radius);
    applyLivePreview(themeDefaults.primaryHue, themeDefaults.radius);
  };

  const handleSave = () => {
    const fd = new FormData();
    fd.set("primaryHue", String(hue));
    fd.set("radius", String(radius));
    startTransition(async () => {
      const res = await saveThemeConfig(fd);
      if (res?.error) toast.error(res.error);
      else toast.success("Theme saved — applied site-wide.");
    });
  };

  const selectedPreset = COLOR_PRESETS.find(p => p.hue === hue);

  return (
    <div className="space-y-8 max-w-3xl">

      {/* ── Color ── */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold">Primary Color</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Sets the brand color across the entire site.</p>
        </div>

        {/* Preset swatches */}
        <div className="grid grid-cols-8 gap-2 sm:grid-cols-16">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.hue}
              type="button"
              title={preset.name}
              onClick={() => updateHue(preset.hue)}
              className={cn(
                "group relative size-9 rounded-xl border-2 transition-all duration-150 hover:scale-110 hover:shadow-md",
                hue === preset.hue
                  ? "border-foreground/70 scale-110 shadow-lg"
                  : "border-transparent hover:border-foreground/30",
              )}
              style={{ backgroundColor: preset.bg }}
            >
              {hue === preset.hue && (
                <CheckIcon className="absolute inset-0 m-auto size-4 text-white drop-shadow" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>

        {/* Hue name + custom slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedPreset?.name ?? "Custom"}{" "}
              <span className="text-muted-foreground font-normal">({hue}°)</span>
            </span>
            <span
              className="size-5 rounded-full border border-border shadow-sm"
              style={{ backgroundColor: `oklch(0.60 0.24 ${hue})` }}
            />
          </div>
          <div className="relative h-4">
            {/* Rainbow track */}
            <div
              className="absolute inset-y-0 left-0 right-0 rounded-full"
              style={{
                background: "linear-gradient(to right, oklch(0.60 0.24 0), oklch(0.60 0.24 30), oklch(0.60 0.24 60), oklch(0.60 0.24 90), oklch(0.60 0.24 120), oklch(0.60 0.24 150), oklch(0.60 0.24 180), oklch(0.60 0.24 210), oklch(0.60 0.24 240), oklch(0.60 0.24 270), oklch(0.60 0.24 300), oklch(0.60 0.24 330), oklch(0.60 0.24 360))",
              }}
            />
            <input
              type="range"
              min={0}
              max={360}
              value={hue}
              onChange={(e) => updateHue(Number(e.target.value))}
              className="relative w-full h-4 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-black/30 [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
              style={{ "--thumb-color": `oklch(0.60 0.24 ${hue})` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Mini live preview */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preview</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg px-4 py-1.5 text-sm font-semibold text-primary-foreground"
              style={{ backgroundColor: `oklch(0.52 0.24 ${hue})`, borderRadius: `${radius}rem` }}
            >
              Primary
            </button>
            <button
              type="button"
              className="rounded-lg px-4 py-1.5 text-sm font-semibold border"
              style={{
                borderColor: `oklch(0.52 0.24 ${hue} / 0.4)`,
                color: `oklch(0.52 0.24 ${hue})`,
                borderRadius: `${radius}rem`,
              }}
            >
              Outline
            </button>
            <span
              className="rounded-full px-3 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: `oklch(0.93 0.06 ${hue})`,
                color: `oklch(0.26 0.05 ${hue})`,
              }}
            >
              Badge
            </span>
            <div
              className="size-5 rounded-full border-2"
              style={{
                borderColor: `oklch(0.52 0.24 ${hue})`,
                backgroundColor: `oklch(0.52 0.24 ${hue} / 0.15)`,
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Radius ── */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold">Border Radius</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Controls rounded corners on buttons, cards and inputs.</p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {RADIUS_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => updateRadius(preset.value)}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-xl border-2 p-3 transition-all duration-150 hover:border-primary/60",
                radius === preset.value
                  ? "border-primary bg-primary/8 shadow-sm"
                  : "border-border/60 bg-muted/10",
              )}
            >
              {/* Shape preview */}
              <div
                className={cn(
                  "size-10 border-2 transition-colors",
                  radius === preset.value ? "border-primary bg-primary/15" : "border-border bg-muted/30",
                )}
                style={{ borderRadius: `${preset.value}rem` }}
              />
              <span className={cn(
                "text-[11px] font-semibold",
                radius === preset.value ? "text-primary" : "text-muted-foreground",
              )}>
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={pending} className="gap-2">
          {pending
            ? <><Loader2 className="size-4 animate-spin" /> Saving…</>
            : <><SaveIcon className="size-4" /> Save Theme</>}
        </Button>
        <Button type="button" variant="outline" onClick={reset} className="gap-2">
          <RotateCcwIcon className="size-4" />
          Reset to Default
        </Button>
        <p className="text-xs text-muted-foreground">
          Changes preview instantly · Save to apply site-wide
        </p>
      </div>

      {/* Hidden inputs for form data */}
      <input type="hidden" name="primaryHue" value={hue} />
      <input type="hidden" name="radius" value={radius} />
    </div>
  );
}
