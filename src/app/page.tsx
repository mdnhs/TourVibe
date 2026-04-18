import Link from "next/link";
import {
  ArrowRight,
  BusFront,
  CalendarClock,
  CarFront,
  Headset,
  MapPinned,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { seededAdminCredentials } from "@/lib/seed";

const services = [
  {
    title: "City Tour Scheduling",
    description:
      "Plan morning rides, sunset circuits and full-day car tours with organized departure slots.",
    icon: CalendarClock,
  },
  {
    title: "Driver Coordination",
    description:
      "Assign drivers, surface route context and keep transport operations visible in one dashboard.",
    icon: BusFront,
  },
  {
    title: "Premium Vehicle Booking",
    description:
      "Offer family sedans, executive SUVs and group-ready vans for flexible tourist packages.",
    icon: CarFront,
  },
];

const reviews = [
  {
    quote:
      "Everything felt polished, from the airport pickup to the hill-view stopovers. The driver updates were especially useful.",
    name: "Mila Fernandes",
    role: "Tourist from Lisbon",
  },
  {
    quote:
      "We used one control panel for guests, vehicles and route timing. That removed most of our manual follow-up work.",
    name: "Rafid Hasan",
    role: "Operations Manager",
  },
  {
    quote:
      "The itinerary looked premium and the transport was punctual. It felt like a proper guided road experience.",
    name: "Ethan Blake",
    role: "Weekend traveler",
  },
];

const stats = [
  { value: "120+", label: "monthly tour bookings" },
  { value: "24/7", label: "customer support coverage" },
  { value: "4.9", label: "average tourist rating" },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#fff7ed_0%,#fff_22%,#f8fafc_100%)] text-slate-900">
      <section className="relative isolate px-6 pb-20 pt-6">
        <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.35),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(34,211,238,0.22),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.7))]" />
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-col gap-6 rounded-full border border-white/70 bg-white/80 px-5 py-4 shadow-lg shadow-amber-950/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-slate-950 text-white">
                <CarFront className="size-5" />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold">TourVibe</p>
                <p className="text-sm text-slate-500">Car-based tour management platform</p>
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
              <Link href="/login">
                <Button variant="outline" className="rounded-full border-slate-300 bg-white/80">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full bg-slate-950 text-white hover:bg-slate-800">
                  Sign Up
                </Button>
              </Link>
            </nav>
          </header>

          <div className="grid gap-10 pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-8">
              <Badge className="rounded-full bg-amber-100 px-4 py-1 text-amber-800 hover:bg-amber-100">
                Better Auth + SQLite + RBAC
              </Badge>
              <div className="space-y-5">
                <h1 className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                  Road-trip booking and driver operations in one clean platform.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  TourVibe helps you sell car-based tours, assign drivers, manage bookings
                  and keep tourists informed through an eye-catching customer experience.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button className="h-12 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
                    Start Free Setup
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="h-12 rounded-full border-amber-300 bg-amber-50 px-6 text-amber-900 hover:bg-amber-100"
                  >
                    Open Dashboard
                  </Button>
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-lg shadow-slate-200/40 backdrop-blur"
                  >
                    <p className="font-heading text-3xl font-semibold text-slate-950">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-10 top-10 size-40 rounded-full bg-cyan-200/50 blur-3xl" />
              <div className="absolute -right-6 bottom-12 size-48 rounded-full bg-amber-200/60 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-7 text-white shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-white/60">Today’s flagship ride</p>
                        <h2 className="mt-2 font-heading text-2xl font-semibold">
                          Coastal Highway Escape
                        </h2>
                      </div>
                      <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">
                        On schedule
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/6 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                          Driver
                        </p>
                        <p className="mt-2 text-lg font-medium">Nadia Rahman</p>
                      </div>
                      <div className="rounded-2xl bg-white/6 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                          Vehicle
                        </p>
                        <p className="mt-2 text-lg font-medium">Premium 7-seat SUV</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-slate-950">
                      <MapPinned className="size-5" />
                      <p className="mt-8 text-sm font-medium uppercase tracking-[0.24em]">
                        Route Coverage
                      </p>
                      <p className="mt-2 font-heading text-3xl font-semibold">14 stops</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                      <Users className="size-5 text-cyan-300" />
                      <p className="mt-8 text-sm font-medium uppercase tracking-[0.24em] text-white/50">
                        Live Guests
                      </p>
                      <p className="mt-2 font-heading text-3xl font-semibold">38 riders</p>
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-5 text-sm leading-7 text-white/70">
                    Seeded super admin for local testing:
                    <span className="block font-medium text-white">
                      {seededAdminCredentials.email}
                    </span>
                    <span className="block font-medium text-white">
                      {seededAdminCredentials.password}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Services
              </p>
              <h2 className="mt-3 font-heading text-4xl font-semibold tracking-tight">
                Built for modern road-tour businesses
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              The homepage is ready to sell your service, while auth and dashboards support
              internal operations immediately.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="overflow-hidden border-slate-200/70 bg-white shadow-lg shadow-slate-200/40">
                  <CardContent className="p-0">
                    <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-cyan-500" />
                    <div className="space-y-4 p-6">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-heading text-2xl font-semibold">{service.title}</h3>
                      <p className="text-sm leading-7 text-slate-600">{service.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.4)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
              About
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight">
              Designed for operators who sell memorable car journeys.
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/70">
              TourVibe combines a premium landing page with practical operator tooling:
              login, signup, roles, local database storage and a starter dashboard.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <ShieldCheck className="size-5 text-amber-600" />
              <h3 className="mt-8 font-heading text-2xl font-semibold">Secure by default</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Better Auth handles credentials and sessions, while SQLite keeps the setup
                lightweight for local development and fast iteration.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <Headset className="size-5 text-cyan-600" />
              <h3 className="mt-8 font-heading text-2xl font-semibold">
                Customer support ready
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                The contact and review sections give your tour brand a more trustworthy,
                service-led presentation from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Tourist Reviews
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight">
              Social proof for your car-tour experience
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="flex gap-1 text-amber-300">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-sm leading-7 text-white/75">“{review.quote}”</p>
                <div className="mt-6">
                  <p className="font-medium">{review.name}</p>
                  <p className="text-sm text-white/50">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
              Contact
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-slate-950">
              Ready to launch your tour brand?
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Use the signup page to onboard users right now, or log in with the seeded
              super admin account to test permissions and internal views.
            </p>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-500 to-cyan-500 p-[1px] shadow-2xl shadow-orange-200">
            <div className="h-full rounded-[calc(2rem-1px)] bg-white p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="mt-2 font-medium text-slate-950">hello@tourvibe.demo</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="mt-2 font-medium text-slate-950">+880 1700 000000</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Support</p>
                  <p className="mt-2 font-medium text-slate-950">24/7 trip assistance</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Launch path</p>
                  <p className="mt-2 font-medium text-slate-950">
                    Landing page, auth, dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
