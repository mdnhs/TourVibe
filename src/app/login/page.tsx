import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

import { SignInForm } from "@/components/auth/sign-in-form";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.25),_transparent_28%),linear-gradient(180deg,#fff8ef_0%,#eff6ff_100%)] px-6 py-8 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row">
        <div className="flex-1 space-y-6 rounded-[2rem] border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-300">
              Secure access
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              One place for tour operators, drivers and travelers.
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/70">
              Better Auth secures email login, SQLite stores your local data, and the
              RBAC layer keeps each user inside the right workflow.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <ShieldCheck className="mb-3 size-5 text-amber-300" />
              <h2 className="text-lg font-medium">Role-aware access</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Super admins, drivers and tourists each get a separate operational
                view.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <KeyRound className="mb-3 size-5 text-cyan-300" />
              <h2 className="text-lg font-medium">Simple credentials</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Email and password auth is ready now, without needing a third-party
                login provider.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full max-w-lg lg:pt-14">
          <SignInForm />
        </div>
      </div>
    </main>
  );
}
