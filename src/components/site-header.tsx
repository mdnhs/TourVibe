"use client";

import { LogOut, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { authClient } from "@/lib/auth-client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SiteHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 flex-col transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex flex-1 items-center gap-2 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md lg:px-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
            <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto opacity-50" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-indigo-500/70 dark:text-indigo-400/60">
                {subtitle}
              </p>
              <h1 className="text-sm font-bold leading-tight tracking-tight">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 lg:flex mr-2">
              <div className="flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/60 px-3 py-1.5 text-[10px] text-indigo-700/80 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300/70">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span className="font-semibold">{date}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 rounded-full border border-border/40 bg-background/50 text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <Link href="/" target="_blank">
                      <ExternalLink className="size-4" />
                      <span className="sr-only">Visit frontend</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Visit frontend</TooltipContent>
              </Tooltip>

              <ModeToggle />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="size-8 rounded-full border border-border/40 bg-background/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="size-4" />
                    <span className="sr-only">Sign out</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sign out</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      {/* Gradient accent line */}
      <div className="h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 opacity-70 dark:opacity-50" />
    </header>
  );
}
