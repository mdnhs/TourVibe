import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface ServicesProps {
  services: Service[];
}

export function Services({ services }: ServicesProps) {
  return (
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
                    <h3 className="font-heading text-2xl font-semibold text-slate-950">{service.title}</h3>
                    <p className="text-sm leading-7 text-slate-600">{service.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
