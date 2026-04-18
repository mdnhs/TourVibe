"use client";

import Link from "next/link";
import { CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Session } from "better-auth";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  session: Session | null;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }

    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveHash(`#${entry.target.id}`);
        }
      });
    }, observerOptions);

    const sections = ["services", "about", "reviews", "contact"];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveHash("");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" && (activeHash === "" || activeHash === "#");
    }
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      return pathname === path && activeHash === `#${hash}`;
    }
    return pathname === href;
  };

  return (
    <div className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-6">
      <header className="mx-auto max-w-6xl flex items-center justify-between rounded-full border border-white/70 bg-white/85 px-4 py-3 shadow-lg shadow-slate-900/8 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-md shadow-slate-900/30 transition group-hover:bg-slate-800">
            <CarFront className="size-[18px]" />
          </div>

          <div className="hidden sm:block">
            <p className="font-heading text-[15px] font-bold leading-tight text-slate-900">
              TourVibe
            </p>
            <p className="text-[11px] text-slate-400 leading-tight">
              Car-based tour management
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all hover:bg-slate-100/80 group",
                  active ? "text-slate-900 bg-slate-100/50" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {link.label}

                <span
                  className={cn(
                    "absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-amber-400 transition-all duration-200 group-hover:w-4",
                    active ? "w-4" : "w-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <Link href="/dashboard">
              <Button className="h-9 rounded-xl bg-amber-400 px-5 text-[13px] font-semibold text-slate-950 shadow-md shadow-amber-400/25 hover:bg-amber-300 transition-all">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="h-9 rounded-xl px-5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                >
                  Login
                </Button>
              </Link>

              <Link href="/signup">
                <Button className="h-9 rounded-xl bg-slate-950 px-5 text-[13px] font-semibold text-white shadow-md shadow-slate-900/20 hover:bg-slate-800 transition-all">
                  Sign Up
                  <span className="ml-1 text-slate-400">→</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
