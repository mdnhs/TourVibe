export interface ThemeConfig {
  primaryHue: number;  // 0–360
  radius: number;      // rem value
}

export const themeDefaults: ThemeConfig = {
  primaryHue: 264,
  radius: 0.875,
};

export function buildThemeCss(config: ThemeConfig): string {
  const h = config.primaryHue;
  const r = config.radius;

  return `
:root {
  --background: oklch(0.99 0.008 ${h});
  --foreground: oklch(0.19 0.05 ${h});
  --card: oklch(1 0.006 ${h});
  --card-foreground: oklch(0.19 0.05 ${h});
  --popover: oklch(1 0.006 ${h});
  --popover-foreground: oklch(0.19 0.05 ${h});
  --primary: oklch(0.52 0.24 ${h});
  --primary-foreground: oklch(0.99 0.005 ${h});
  --secondary: oklch(0.95 0.04 ${h});
  --secondary-foreground: oklch(0.28 0.05 ${h});
  --muted: oklch(0.95 0.015 ${h});
  --muted-foreground: oklch(0.52 0.05 ${h});
  --accent: oklch(0.93 0.06 ${h});
  --accent-foreground: oklch(0.26 0.05 ${h});
  --border: oklch(0.90 0.02 ${h});
  --input: oklch(0.90 0.02 ${h});
  --ring: oklch(0.58 0.24 ${h});
  --radius: ${r}rem;
  --sidebar: oklch(0.975 0.015 ${h});
  --sidebar-foreground: oklch(0.19 0.05 ${h});
  --sidebar-primary: oklch(0.52 0.24 ${h});
  --sidebar-primary-foreground: oklch(0.99 0.005 ${h});
  --sidebar-accent: oklch(0.93 0.04 ${h});
  --sidebar-accent-foreground: oklch(0.28 0.05 ${h});
  --sidebar-border: oklch(0.90 0.02 ${h});
  --sidebar-ring: oklch(0.58 0.24 ${h});
}
.dark {
  --background: oklch(0.13 0.03 ${h});
  --foreground: oklch(0.97 0.01 ${h});
  --card: oklch(0.175 0.04 ${h});
  --card-foreground: oklch(0.97 0.01 ${h});
  --popover: oklch(0.175 0.04 ${h});
  --popover-foreground: oklch(0.97 0.01 ${h});
  --primary: oklch(0.68 0.24 ${h});
  --primary-foreground: oklch(0.13 0.03 ${h});
  --secondary: oklch(0.23 0.05 ${h});
  --secondary-foreground: oklch(0.97 0.01 ${h});
  --muted: oklch(0.23 0.04 ${h});
  --muted-foreground: oklch(0.63 0.06 ${h});
  --accent: oklch(0.26 0.07 ${h});
  --accent-foreground: oklch(0.97 0.01 ${h});
  --ring: oklch(0.60 0.24 ${h});
  --sidebar: oklch(0.155 0.04 ${h});
  --sidebar-foreground: oklch(0.97 0.01 ${h});
  --sidebar-primary: oklch(0.68 0.24 ${h});
  --sidebar-primary-foreground: oklch(0.13 0.03 ${h});
  --sidebar-accent: oklch(0.22 0.06 ${h});
  --sidebar-accent-foreground: oklch(0.97 0.01 ${h});
  --sidebar-border: oklch(1 0 0 / 12%);
  --sidebar-ring: oklch(0.60 0.24 ${h});
}
`.trim();
}
