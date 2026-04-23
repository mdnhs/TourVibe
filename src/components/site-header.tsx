import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
              {subtitle}
            </p>
            <h1 className="text-sm font-semibold leading-tight">{title}</h1>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            <span className="font-medium">{date}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
