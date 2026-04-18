import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { getServerSession } from "@/lib/session";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getServerSession();
  const session = sessionData?.session ?? null;

  return (
    <div className="flex flex-col min-h-screen relative isolate">
      <div className="absolute inset-x-0 top-0 -z-10 h-screen bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.35),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(34,211,238,0.22),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.7))]" />
      <Navbar session={session} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
