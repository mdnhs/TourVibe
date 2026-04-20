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

      {/* ── Fixed full-page background ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Warm cream base */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(150deg,#fffbef 0%,#f6fbff 45%,#f4f8ff 70%,#fdf5ff 100%)" }} />

        {/* Amber/gold bloom — top left */}
        <div
          className="absolute -top-64 -left-64 size-[900px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(251,191,36,0.32) 0%,transparent 65%)", filter: "blur(80px)" }}
        />

        {/* Cyan bloom — top right */}
        <div
          className="absolute -top-48 -right-48 size-[700px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(34,211,238,0.22) 0%,transparent 65%)", filter: "blur(80px)" }}
        />

        {/* Rose/coral bloom — mid right */}
        <div
          className="absolute top-[40%] -right-32 size-[500px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(251,113,133,0.12) 0%,transparent 65%)", filter: "blur(80px)" }}
        />

        {/* Emerald bloom — mid left */}
        <div
          className="absolute top-[35%] -left-48 size-[600px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(52,211,153,0.13) 0%,transparent 65%)", filter: "blur(80px)" }}
        />

        {/* Violet bloom — bottom center */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[700px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 65%)", filter: "blur(80px)" }}
        />

        {/* Subtle dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <Navbar session={session} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
