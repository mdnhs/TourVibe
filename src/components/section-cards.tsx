import {
  BusFrontIcon,
  CalendarRangeIcon,
  CarFrontIcon,
  UsersIcon,
  TrendingUpIcon,
} from "lucide-react";

interface SectionCardsProps {
  stats: {
    tourCount: number;
    vehicleCount: number;
    driverCount: number;
    userCount: number;
    avgRating: number;
  };
}

const cardConfigs = [
  {
    key: "tourCount" as const,
    title: "Tour Packages",
    description: "Active curated tours",
    icon: CalendarRangeIcon,
    card: "bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-50/40 border-amber-300/50 dark:from-amber-950/60 dark:via-orange-950/30 dark:to-amber-950/20 dark:border-amber-700/30",
    iconGradient: "from-amber-400 to-orange-500",
    iconShadow: "shadow-amber-400/40",
    valueColor: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/30",
    bar: "bg-amber-200/60 dark:bg-amber-900/40",
    barFill: "bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500",
    glowColor: "oklch(0.78 0.18 70)",
    accentLine: "from-amber-400 to-orange-500",
  },
  {
    key: "vehicleCount" as const,
    title: "Fleet Vehicles",
    description: "Sedans, SUVs & vans",
    icon: CarFrontIcon,
    card: "bg-gradient-to-br from-sky-50 via-blue-50/80 to-sky-50/40 border-sky-300/50 dark:from-sky-950/60 dark:via-blue-950/30 dark:to-sky-950/20 dark:border-sky-700/30",
    iconGradient: "from-sky-400 to-blue-600",
    iconShadow: "shadow-sky-400/40",
    valueColor: "text-sky-700 dark:text-sky-300",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 border border-sky-200/60 dark:border-sky-700/30",
    bar: "bg-sky-200/60 dark:bg-sky-900/40",
    barFill: "bg-gradient-to-r from-sky-400 via-blue-400 to-blue-600",
    glowColor: "oklch(0.65 0.20 230)",
    accentLine: "from-sky-400 to-blue-600",
  },
  {
    key: "driverCount" as const,
    title: "Active Drivers",
    description: "Ready for assignments",
    icon: BusFrontIcon,
    card: "bg-gradient-to-br from-emerald-50 via-green-50/80 to-emerald-50/40 border-emerald-300/50 dark:from-emerald-950/60 dark:via-green-950/30 dark:to-emerald-950/20 dark:border-emerald-700/30",
    iconGradient: "from-emerald-400 to-teal-500",
    iconShadow: "shadow-emerald-400/40",
    valueColor: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-700/30",
    bar: "bg-emerald-200/60 dark:bg-emerald-900/40",
    barFill: "bg-gradient-to-r from-emerald-400 via-teal-400 to-teal-500",
    glowColor: "oklch(0.72 0.18 160)",
    accentLine: "from-emerald-400 to-teal-500",
  },
  {
    key: "userCount" as const,
    title: "System Users",
    description: "Guests & administrators",
    icon: UsersIcon,
    card: "bg-gradient-to-br from-violet-50 via-purple-50/80 to-violet-50/40 border-violet-300/50 dark:from-violet-950/60 dark:via-purple-950/30 dark:to-violet-950/20 dark:border-violet-700/30",
    iconGradient: "from-violet-500 to-purple-600",
    iconShadow: "shadow-violet-400/40",
    valueColor: "text-violet-700 dark:text-violet-300",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400 border border-violet-200/60 dark:border-violet-700/30",
    bar: "bg-violet-200/60 dark:bg-violet-900/40",
    barFill: "bg-gradient-to-r from-violet-400 via-purple-500 to-purple-600",
    glowColor: "oklch(0.60 0.20 295)",
    accentLine: "from-violet-500 to-purple-600",
  },
];

export function SectionCards({ stats }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardConfigs.map((cfg) => {
        const Icon = cfg.icon;
        const value = stats[cfg.key];

        return (
          <div
            key={cfg.key}
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cfg.card}`}
          >
            {/* Top accent line */}
            <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-80 ${cfg.accentLine}`} />

            {/* Glow blob */}
            <div
              className="absolute -right-8 -top-8 size-36 rounded-full opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
              style={{ background: cfg.glowColor }}
            />
            <div
              className="absolute -bottom-10 -left-6 size-28 rounded-full opacity-10 blur-2xl"
              style={{ background: cfg.glowColor }}
            />

            {/* Header row */}
            <div className="relative flex items-start justify-between">
              <div className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${cfg.iconGradient} ${cfg.iconShadow}`}>
                <Icon className="size-5 text-white drop-shadow" />
              </div>
              <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.badge}`}>
                <TrendingUpIcon className="size-2.5" />
                Live
              </div>
            </div>

            {/* Metric */}
            <div className="relative mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                {cfg.title}
              </p>
              <p className={`mt-1 text-4xl font-black tabular-nums tracking-tight ${cfg.valueColor}`}>
                {value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">{cfg.description}</p>
            </div>

            {/* Progress bar */}
            <div className={`relative mt-4 h-1.5 w-full overflow-hidden rounded-full ${cfg.bar}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 group-hover:shadow-sm ${cfg.barFill}`}
                style={{ width: `${Math.min(100, (value / 20) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
