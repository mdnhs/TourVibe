import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ScrollToTop } from "@/components/landing/scroll-to-top";
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

  // Empty strings -> undefined so Navbar/Footer fall back to default content.
  // Social + link URLs stay raw ("" intentionally hides social / defaults to "#").
  const od = (v?: string) => (v && v.trim() ? v : undefined);

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
        siteName={od(siteConfig.siteName)}
        tagline={od(siteConfig.tagline)}
        logoUrl={od(siteConfig.logoUrl)}
      />
      <main className="flex-grow">{children}</main>
      <Footer
        siteName={od(siteConfig.siteName)}
        tagline={od(siteConfig.footerTagline)}
        location={od(siteConfig.contactLocation)}
        logoUrl={od(siteConfig.logoUrl)}
        footerCol1Heading={od(siteConfig.footerCol1Heading)}
        footerCol1Link1Label={od(siteConfig.footerCol1Link1Label)}
        footerCol1Link1Url={siteConfig.footerCol1Link1Url}
        footerCol1Link2Label={od(siteConfig.footerCol1Link2Label)}
        footerCol1Link2Url={siteConfig.footerCol1Link2Url}
        footerCol1Link3Label={od(siteConfig.footerCol1Link3Label)}
        footerCol1Link3Url={siteConfig.footerCol1Link3Url}
        footerCol1Link4Label={od(siteConfig.footerCol1Link4Label)}
        footerCol1Link4Url={siteConfig.footerCol1Link4Url}
        footerCol2Heading={od(siteConfig.footerCol2Heading)}
        footerCol2Link1Label={od(siteConfig.footerCol2Link1Label)}
        footerCol2Link1Url={siteConfig.footerCol2Link1Url}
        footerCol2Link2Label={od(siteConfig.footerCol2Link2Label)}
        footerCol2Link2Url={siteConfig.footerCol2Link2Url}
        footerCol2Link3Label={od(siteConfig.footerCol2Link3Label)}
        footerCol2Link3Url={siteConfig.footerCol2Link3Url}
        footerCol2Link4Label={od(siteConfig.footerCol2Link4Label)}
        footerCol2Link4Url={siteConfig.footerCol2Link4Url}
        footerCol3Heading={od(siteConfig.footerCol3Heading)}
        footerCol3Link1Label={od(siteConfig.footerCol3Link1Label)}
        footerCol3Link1Url={siteConfig.footerCol3Link1Url}
        footerCol3Link2Label={od(siteConfig.footerCol3Link2Label)}
        footerCol3Link2Url={siteConfig.footerCol3Link2Url}
        footerCol3Link3Label={od(siteConfig.footerCol3Link3Label)}
        footerCol3Link3Url={siteConfig.footerCol3Link3Url}
        footerCol3Link4Label={od(siteConfig.footerCol3Link4Label)}
        footerCol3Link4Url={siteConfig.footerCol3Link4Url}
        footerFacebookUrl={siteConfig.footerFacebookUrl}
        footerInstagramUrl={siteConfig.footerInstagramUrl}
        footerTwitterUrl={siteConfig.footerTwitterUrl}
        footerYoutubeUrl={siteConfig.footerYoutubeUrl}
        footerPoweredByText={od(siteConfig.footerPoweredByText)}
      />

      {/* Floating WhatsApp Button */}
      {(() => {
        const phone = siteConfig.contactPhone?.trim() || "+35318000000";
        return (
          <a
            href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center size-14 rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            aria-label="Chat with us on WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </a>
        );
      })()}

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
