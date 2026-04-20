"use client";

import Link from "next/link";
import { CarFront, ArrowRight, Menu, X } from "lucide-react";
import { Session } from "better-auth";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  session: Session | null;
}

const navLinks = [
  { label: "Home",    href: "/" },
  { label: "Tours",   href: "/tours" },
  { label: "Services", href: "/#services" },
  { label: "About",   href: "/#about" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY < 100) setActiveHash("");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHash(`#${entry.target.id}`);
        });
      },
      { root: null, rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    ["services", "about", "reviews", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const onHash = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHash);
    };
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && (activeHash === "" || activeHash === "#");
    if (href === "/tours") return pathname.startsWith("/tours");
    if (href.includes("#")) {
      const [, hash] = href.split("#");
      return pathname === "/" && activeHash === `#${hash}`;
    }
    return pathname === href;
  };

  return (
    <div className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-6">
      <header
        className={cn(
          "mx-auto max-w-6xl rounded-2xl border px-4 py-2.5 transition-all duration-300",
          scrolled
            ? "border-white/80 bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-lg"
            : "border-white/60 bg-white/80 shadow-lg shadow-slate-900/6 backdrop-blur-md",
        )}
      >
        <div className="flex items-center justify-between">
          {/* ── Logo ── */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 transition-transform duration-300 group-hover:scale-105">
              <CarFront className="size-[17px]" />
            </div>
            <div className="hidden sm:block">
              <p className="font-heading text-[15px] font-extrabold leading-tight text-slate-900">
                TourVibe
              </p>
              <p className="text-[10px] font-medium leading-tight text-slate-400 tracking-wide">
                Car-based tour management
              </p>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all",
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-900",
                  )}
                >
                  {link.label}
                  {/* Active / hover underline dot */}
                  <span
                    className={cn(
                      "absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 rounded-full bg-amber-400 transition-all duration-200",
                      active ? "w-1" : "w-0 group-hover:w-1",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* ── CTA + mobile toggle ── */}
          <div className="flex items-center gap-2">
            {session ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-[13px] font-bold text-slate-950 shadow-md shadow-amber-400/25 transition-all hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-amber-400/30"
              >
                Dashboard
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-xl px-4 py-2 text-[13px] font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 sm:block"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-[13px] font-bold text-white shadow-md shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Sign Up
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="mt-2.5 border-t border-slate-100 pt-3 pb-1 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-0.5">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    {link.label}
                    {active && (
                      <span className="size-1.5 rounded-full bg-amber-400" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              {session ? (
                <Link href="/dashboard" className="flex-1">
                  <button className="w-full rounded-xl bg-amber-400 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1">
                    <button className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                      Login
                    </button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <button className="w-full rounded-xl bg-slate-950 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
