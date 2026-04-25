import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { getServerSession } from "@/lib/session";
import { getSiteConfig } from "@/app/dashboard/site-config/actions";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionData, siteConfig] = await Promise.all([
    getServerSession(),
    getSiteConfig(),
  ]);
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

      <Navbar
        session={session}
        siteName={siteConfig.siteName}
        tagline={siteConfig.tagline}
        logoUrl={siteConfig.logoUrl || undefined}
      />
      <main className="flex-grow">{children}</main>
      <Footer
        siteName={siteConfig.siteName}
        tagline={siteConfig.footerTagline}
        location={siteConfig.contactLocation}
        logoUrl={siteConfig.logoUrl || undefined}
        footerCol1Heading={siteConfig.footerCol1Heading}
        footerCol1Link1Label={siteConfig.footerCol1Link1Label}
        footerCol1Link1Url={siteConfig.footerCol1Link1Url}
        footerCol1Link2Label={siteConfig.footerCol1Link2Label}
        footerCol1Link2Url={siteConfig.footerCol1Link2Url}
        footerCol1Link3Label={siteConfig.footerCol1Link3Label}
        footerCol1Link3Url={siteConfig.footerCol1Link3Url}
        footerCol1Link4Label={siteConfig.footerCol1Link4Label}
        footerCol1Link4Url={siteConfig.footerCol1Link4Url}
        footerCol2Heading={siteConfig.footerCol2Heading}
        footerCol2Link1Label={siteConfig.footerCol2Link1Label}
        footerCol2Link1Url={siteConfig.footerCol2Link1Url}
        footerCol2Link2Label={siteConfig.footerCol2Link2Label}
        footerCol2Link2Url={siteConfig.footerCol2Link2Url}
        footerCol2Link3Label={siteConfig.footerCol2Link3Label}
        footerCol2Link3Url={siteConfig.footerCol2Link3Url}
        footerCol2Link4Label={siteConfig.footerCol2Link4Label}
        footerCol2Link4Url={siteConfig.footerCol2Link4Url}
        footerCol3Heading={siteConfig.footerCol3Heading}
        footerCol3Link1Label={siteConfig.footerCol3Link1Label}
        footerCol3Link1Url={siteConfig.footerCol3Link1Url}
        footerCol3Link2Label={siteConfig.footerCol3Link2Label}
        footerCol3Link2Url={siteConfig.footerCol3Link2Url}
        footerCol3Link3Label={siteConfig.footerCol3Link3Label}
        footerCol3Link3Url={siteConfig.footerCol3Link3Url}
        footerCol3Link4Label={siteConfig.footerCol3Link4Label}
        footerCol3Link4Url={siteConfig.footerCol3Link4Url}
        footerFacebookUrl={siteConfig.footerFacebookUrl}
        footerInstagramUrl={siteConfig.footerInstagramUrl}
        footerTwitterUrl={siteConfig.footerTwitterUrl}
        footerYoutubeUrl={siteConfig.footerYoutubeUrl}
        footerPoweredByText={siteConfig.footerPoweredByText}
      />
    </div>
  );
}
