import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BusFrontIcon,
  CalendarRangeIcon,
  CarFrontIcon,
  UsersIcon,
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

export function SectionCards({ stats }: SectionCardsProps) {
  const cards = [
    {
      title: "Tour packages",
      value: String(stats.tourCount),
      description:
        "Total curated tour packages available for booking.",
      icon: CalendarRangeIcon,
    },
    {
      title: "Total vehicles",
      value: String(stats.vehicleCount),
      description: "Sedans, SUVs and family vans in the fleet.",
      icon: CarFrontIcon,
    },
    {
      title: "Active drivers",
      value: String(stats.driverCount),
      description:
        "Registered driver accounts ready for assignments.",
      icon: BusFrontIcon,
    },
    {
      title: "System users",
      value: String(stats.userCount),
      description: "Total registered accounts including guests and admins.",
      icon: UsersIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title} className="@container/card bg-card shadow-xs">
            <CardHeader>
              <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Icon className="size-5" />
              </div>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                {card.description}
              </p>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
