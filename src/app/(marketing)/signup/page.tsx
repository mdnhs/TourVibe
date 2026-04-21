import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MapPin, Star, Compass } from "lucide-react";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { getServerSession } from "@/lib/session";

const perks = [
  {
    icon: Compass,
    title: "Discover Ireland",
    description: "Browse our full collection of scenic road tours, coastal drives and countryside adventures.",
    accent: { iconBg: "bg-amber-400", bar: "from-amber-400 to-orange-500", glow: "bg-amber-300/20" },
  },
  {
    icon: Star,
    title: "Save your favourites",
    description: "Bookmark tours, track your bookings and leave reviews after each unforgettable journey.",
    accent: { iconBg: "bg-cyan-400", bar: "from-cyan-400 to-sky-500", glow: "bg-cyan-300/20" },
  },
  {
    icon: MapPin,
    title: "Personalised journeys",
    description: "Tell us your dream route and we&apos;ll tailor an itinerary just for you — every time.",
    accent: { iconBg: "bg-emerald-400", bar: "from-emerald-400 to-teal-500", glow: "bg-emerald-300/20" },
  },
];

export default async function SignupPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative overflow-hidden px-4 py-12 text-slate-900 sm:px-6">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-80 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">

        {/* ── LEFT: info panel ── */}
        <div className="flex-1 space-y-7 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 px-8 py-10 shadow-[0_40px_120px_rgba(148,163,184,0.18)] backdrop-blur-sm
                        animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-amber-300/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-cyan-300/15 blur-3xl" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-amber-600" />
            </span>
            Join TourVibe
          </div>

          <div className="space-y-3">
            <h1 className="font-heading max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Your next{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Irish adventure</span>
                <span className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60" aria-hidden="true" />
              </span>{" "}
              starts here.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-slate-500">
              Create a free account to explore our tour packages, save your favourites and book your perfect road trip across Ireland.
            </p>
          </div>

          {/* Perk cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.title}
                  style={{ animationDelay: `${120 + i * 70}ms` }}
                  className="group animate-in fade-in slide-in-from-bottom-3 duration-500
                             relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-5
                             transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md"
                >
                  <div className={`pointer-events-none absolute -top-6 -right-6 size-24 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${perk.accent.glow}`} />
                  <div className={`absolute inset-x-0 top-0 h-0.75 rounded-t-2xl bg-linear-to-r ${perk.accent.bar}`} />
                  <div className={`mt-1 flex size-9 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${perk.accent.iconBg}`}>
                    <Icon className="size-4" />
                  </div>
                  <h2 className="mt-4 text-sm font-bold text-slate-950">{perk.title}</h2>
                  <p className="mt-1.5 text-xs leading-6 text-slate-500">{perk.description}</p>
                </div>
              );
            })}
          </div>

          {/* Bottom accent */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-0.75 w-8 rounded-full bg-linear-to-r from-amber-400 to-orange-500" />
            <div className="h-0.75 w-3 rounded-full bg-linear-to-r from-amber-400 to-orange-500 opacity-40" />
          </div>
        </div>

        {/* ── RIGHT: form ── */}
        <div
          className="w-full max-w-lg animate-in fade-in slide-in-from-right-4 duration-500 lg:pt-14"
          style={{ animationDelay: "100ms" }}
        >
          <SignUpForm />
          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="group inline-flex items-center gap-1 font-semibold text-slate-950 hover:text-amber-600 transition-colors"
            >
              Sign in
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
