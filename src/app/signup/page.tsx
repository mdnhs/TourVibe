import Link from "next/link";
import { ArrowLeft, BusFront, Compass, Users } from "lucide-react";

import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.22),_transparent_25%),linear-gradient(180deg,#f8fafc_0%,#fff7ed_100%)] px-6 py-8 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row">
        <div className="flex-1 space-y-6 rounded-[2rem] border border-slate-200/70 bg-white/70 px-8 py-10 shadow-[0_40px_120px_rgba(148,163,184,0.18)] backdrop-blur">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs uppercase tracking-[0.28em] text-amber-700">
              Join TourVibe
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Launch bookings, transport coordination and guest service from one app.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Public registration is for tourists. Operational driver accounts are created
              by your super admin from the dashboard.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <Compass className="mb-3 size-5 text-cyan-600" />
              <h2 className="font-medium">Tourist journeys</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Book rides, explore itineraries and submit reviews after the trip.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <BusFront className="mb-3 size-5 text-amber-600" />
              <h2 className="font-medium">Driver operations</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Driver accounts are provisioned internally so access stays controlled.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <Users className="mb-3 size-5 text-slate-700" />
              <h2 className="font-medium">Admin oversight</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A seeded super admin account is available for platform setup and
                testing.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full max-w-lg lg:pt-14">
          <SignUpForm />
        </div>
      </div>
    </main>
  );
}
