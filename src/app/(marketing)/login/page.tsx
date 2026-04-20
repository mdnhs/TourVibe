import Link from "next/link";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";

import { SignInForm } from "@/components/auth/sign-in-form";

const features = [
  {
    icon: ShieldCheck,
    title: "Role-aware access",
    description: "Super admins, drivers and tourists each get a separate operational view.",
    accent: { iconBg: "bg-amber-400", bar: "from-amber-400 to-orange-500", glow: "bg-amber-400/15" },
  },
  {
    icon: KeyRound,
    title: "Simple credentials",
    description: "Email and password auth is ready now, without needing a third-party login provider.",
    accent: { iconBg: "bg-cyan-400", bar: "from-cyan-400 to-sky-500", glow: "bg-cyan-400/15" },
  },
];

export default function LoginPage() {
  return (
    <div className="relative overflow-hidden px-4 py-12 text-slate-900 sm:px-6">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-400/6 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-80 rounded-full bg-cyan-400/6 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">

        {/* ── LEFT: dark info panel ── */}
        <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 px-8 py-10 text-white shadow-[0_40px_120px_rgba(15,23,42,0.45)]
                        animate-in fade-in slide-in-from-left-4 duration-500">
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-amber-400/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-cyan-400/8 blur-3xl" />

          {/* Top gradient bar */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-amber-400 via-orange-500 to-cyan-500" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-cyan-400" />
            </span>
            Secure access
          </div>

          <div className="mt-5 space-y-3">
            <h1 className="font-heading max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              One place for{" "}
              <span className="relative inline-block">
                <span className="relative z-10">operators</span>
                <span
                  className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60"
                  aria-hidden="true"
                />
              </span>
              , drivers and travelers.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/55">
              Better Auth secures email login, SQLite stores your local data,
              and the RBAC layer keeps each user inside the right workflow.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  style={{ animationDelay: `${120 + i * 80}ms` }}
                  className="group animate-in fade-in slide-in-from-bottom-3 duration-500
                             relative overflow-hidden rounded-2xl border border-white/8 bg-white/5 p-5
                             transition-all hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/8"
                >
                  {/* Hover glow */}
                  <div className={`pointer-events-none absolute -top-6 -right-6 size-24 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${f.accent.glow}`} />
                  {/* Top bar */}
                  <div className={`absolute inset-x-0 top-0 h-0.75 rounded-t-2xl bg-linear-to-r ${f.accent.bar}`} />

                  <div className={`mt-1 flex size-9 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${f.accent.iconBg}`}>
                    <Icon className="size-4" />
                  </div>
                  <h2 className="mt-4 text-sm font-bold text-white">{f.title}</h2>
                  <p className="mt-1.5 text-xs leading-6 text-white/50">{f.description}</p>
                </div>
              );
            })}
          </div>

          {/* Bottom accent */}
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
          <p className="mt-5 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="group inline-flex items-center gap-1 font-semibold text-slate-950 hover:text-amber-600 transition-colors"
            >
              Sign up
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
