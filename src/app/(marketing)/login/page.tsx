import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MapPin, Star } from "lucide-react";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getServerSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative overflow-hidden px-4 py-12 text-slate-900 sm:px-6 dark:text-slate-100">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-400/6 blur-3xl dark:bg-amber-400/10" />
        <div className="absolute bottom-0 right-1/4 size-80 rounded-full bg-cyan-400/6 blur-3xl dark:bg-cyan-400/10" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">

        {/* ── LEFT: dark panel ── */}
        <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 px-8 py-10 text-white shadow-[0_40px_120px_rgba(15,23,42,0.45)]
                        animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-amber-400/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-cyan-400/8 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-amber-400 via-orange-500 to-cyan-500" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-cyan-400" />
            </span>
            Welcome back
          </div>

          <h1 className="mt-6 font-heading max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Your{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Ireland</span>
              <span className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60" aria-hidden="true" />
            </span>{" "}
            awaits. Sign in to continue.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
            Access your bookings, saved tours and trip history — all in one place. Your next adventure is just a sign-in away.
          </p>

          {/* Testimonial */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm leading-7 text-white/65 italic">
              &ldquo;Signing up was instant and the tour booking took two minutes. Best travel experience I&apos;ve had in Ireland.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-amber-400/20 text-xs font-bold text-amber-300">
                SF
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Sophie Fletcher</p>
                <p className="mt-0.5 text-[10px] text-white/40">Tourist from London</p>
              </div>
            </div>
          </div>

          {/* Location pill */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/40">
            <MapPin className="size-3.5 text-amber-400" />
            Operating across Ireland
          </div>

          <div className="mt-8 flex items-center gap-2">
            <div className="h-0.75 w-8 rounded-full bg-linear-to-r from-amber-400 to-orange-500" />
            <div className="h-0.75 w-3 rounded-full bg-linear-to-r from-amber-400 to-orange-500 opacity-40" />
          </div>
        </div>

        {/* ── RIGHT: form ── */}
        <div
          className="w-full max-w-lg animate-in fade-in slide-in-from-right-4 duration-500 lg:pt-14"
          style={{ animationDelay: "100ms" }}
        >
          <SignInForm />
          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="group inline-flex items-center gap-1 font-semibold text-slate-950 hover:text-amber-600 transition-colors dark:text-white dark:hover:text-amber-400"
            >
              Sign up free
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
