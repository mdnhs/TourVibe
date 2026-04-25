import { requireDashboardSession } from "@/lib/dashboard";
import { AdminOverview } from "./admin-overview";
import { DriverOverview } from "./driver-overview";
import { TouristOverview } from "./tourist-overview";

interface DashboardPageProps {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function DashboardOverviewPage({
  searchParams,
}: DashboardPageProps) {
  const { session, role, label, highlights, isSuperAdmin } =
    await requireDashboardSession();

  if (role === "driver") {
    return (
      <DriverOverview session={session} label={label} highlights={highlights} />
    );
  }

  if (!isSuperAdmin) {
    return (
      <TouristOverview session={session} label={label} highlights={highlights} />
    );
  }

  const { range, from, to } = await searchParams;

  return (
    <AdminOverview
      session={session}
      label={label}
      highlights={highlights}
      range={range}
      from={from}
      to={to}
    />
  );
}
