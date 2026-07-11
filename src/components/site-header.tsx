"use client";

import { LogOut, ExternalLink, Bell, Mail, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { authClient } from "@/lib/auth-client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getUnreadCount, getRecentNotifications } from "./site-header-actions";
import { formatDistanceToNow } from "date-fns";

export function SiteHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    getUnreadCount().then(setUnreadCount);
    // Optional: Poll every 30s
    const interval = setInterval(() => {
      getUnreadCount().then(setUnreadCount);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isPopoverOpen) {
      getRecentNotifications().then(setRecentNotifications);
    }
  }, [isPopoverOpen]);

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
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="relative size-8 rounded-full border border-border/40 bg-background/50 text-muted-foreground hover:text-foreground"
                  >
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-border/50 bg-background/95 backdrop-blur-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                    <p className="text-sm font-semibold">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="text-xs font-medium text-indigo-500">{unreadCount} unread</span>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href={notif.href}
                          className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                          onClick={() => setIsPopoverOpen(false)}
                        >
                          <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 p-1.5 text-indigo-500">
                            {notif.type === "message" ? <Mail className="size-3.5" /> : <Info className="size-3.5" />}
                          </div>
                          <div className="flex flex-col gap-1 overflow-hidden">
                            <p className="text-sm font-medium leading-none truncate">{notif.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{notif.body}</p>
                            <span className="text-[10px] text-muted-foreground/80 mt-1">
                              {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        <Bell className="mx-auto size-6 mb-2 opacity-20" />
                        No new notifications
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-border/40 bg-muted/20">
                    <Button variant="ghost" className="w-full h-8 text-xs font-medium text-indigo-500 hover:text-indigo-600" asChild>
                      <Link href="/dashboard/notifications" onClick={() => setIsPopoverOpen(false)}>
                        View all notifications
                      </Link>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

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
