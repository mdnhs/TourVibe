import Link from "next/link";
import { CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Session } from "better-auth";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  return (
    <div className="sticky top-0 z-50 w-full px-6 pt-4">
      <header className="mx-auto max-w-6xl flex flex-col gap-6 rounded-full border border-white/70 bg-white/80 px-5 py-4 shadow-lg shadow-amber-950/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="flex size-11 items-center justify-center rounded-full bg-slate-950 text-white">
              <CarFront className="size-5" />
            </div>
          </Link>
          <div>
            <p className="font-heading text-lg font-semibold">TourVibe</p>
            <p className="text-sm text-slate-500">
              Car-based tour management platform
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <a href="#services" className="transition hover:text-slate-950">
            Services
          </a>
          <a href="#about" className="transition hover:text-slate-950">
            About
          </a>
          <a href="#reviews" className="transition hover:text-slate-950">
            Reviews
          </a>
          <a href="#contact" className="transition hover:text-slate-950">
            Contact
          </a>
          {session ? (
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="rounded-full h-10 border-amber-300 bg-amber-50 px-6 text-amber-900 hover:bg-amber-100 cursor-pointer"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="rounded-full h-10 border-amber-300 bg-amber-50 px-6 text-amber-900 hover:bg-amber-100 cursor-pointer"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full h-10 bg-slate-950 px-6 text-white hover:bg-slate-800 cursor-pointer">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </header>
    </div>
  );
}
