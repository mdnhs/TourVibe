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
    card: "bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-200/60 dark:from-amber-950/50 dark:to-orange-950/20 dark:border-amber-800/30",
    iconWrap: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    valueColor: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    bar: "bg-amber-200 dark:bg-amber-900/50",
    barFill: "bg-gradient-to-r from-amber-400 to-orange-500",
    glowColor: "#f59e0b",
  },
  {
    key: "vehicleCount" as const,
    title: "Fleet Vehicles",
    description: "Sedans, SUVs & vans",
    icon: CarFrontIcon,
    card: "bg-gradient-to-br from-sky-50 to-blue-50/60 border-sky-200/60 dark:from-sky-950/50 dark:to-blue-950/20 dark:border-sky-800/30",
    iconWrap: "bg-sky-100 dark:bg-sky-900/50",
    iconColor: "text-sky-600 dark:text-sky-400",
    valueColor: "text-sky-700 dark:text-sky-300",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
    bar: "bg-sky-200 dark:bg-sky-900/50",
    barFill: "bg-gradient-to-r from-sky-400 to-blue-500",
    glowColor: "#0ea5e9",
  },
  {
    key: "driverCount" as const,
    title: "Active Drivers",
    description: "Ready for assignments",
    icon: BusFrontIcon,
    card: "bg-gradient-to-br from-emerald-50 to-green-50/60 border-emerald-200/60 dark:from-emerald-950/50 dark:to-green-950/20 dark:border-emerald-800/30",
    iconWrap: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    valueColor: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    bar: "bg-emerald-200 dark:bg-emerald-900/50",
    barFill: "bg-gradient-to-r from-emerald-400 to-green-500",
    glowColor: "#10b981",
  },
  {
    key: "userCount" as const,
    title: "System Users",
    description: "Guests & administrators",
    icon: UsersIcon,
    card: "bg-gradient-to-br from-violet-50 to-purple-50/60 border-violet-200/60 dark:from-violet-950/50 dark:to-purple-950/20 dark:border-violet-800/30",
    iconWrap: "bg-violet-100 dark:bg-violet-900/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    valueColor: "text-violet-700 dark:text-violet-300",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
    bar: "bg-violet-200 dark:bg-violet-900/50",
    barFill: "bg-gradient-to-r from-violet-400 to-purple-500",
    glowColor: "#8b5cf6",
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
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${cfg.card}`}
          >
            {/* Decorative glow blob */}
            <div
              className="absolute -right-6 -top-6 size-28 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
              style={{ background: cfg.glowColor }}
            />

            {/* Header row */}
            <div className="relative flex items-start justify-between">
              <div className={`flex size-11 items-center justify-center rounded-xl shadow-sm ${cfg.iconWrap}`}>
                <Icon className={`size-5 ${cfg.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}>
                <TrendingUpIcon className="size-3" />
                Live
              </div>
            </div>

            {/* Metric */}
            <div className="relative mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cfg.title}
              </p>
              <p className={`mt-1 text-4xl font-bold tabular-nums tracking-tight ${cfg.valueColor}`}>
                {value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{cfg.description}</p>
            </div>

            {/* Progress bar */}
            <div className={`relative mt-4 h-1.5 w-full overflow-hidden rounded-full ${cfg.bar}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${cfg.barFill}`}
                style={{ width: `${Math.min(100, (value / 20) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
