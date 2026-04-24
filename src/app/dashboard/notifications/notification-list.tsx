"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Car,
  CheckCheck,
  MapPin,
  Percent,
  Tag,
  Ticket,
  Check,
} from "lucide-react";

import { markAsRead, markAllAsRead } from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  isRead: boolean;
};

const TYPE_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    color: string;
    bg: string;
    gradient: string;
    border: string;
    label: string;
  }
> = {
  offer: {
    icon: <Tag className="size-4" />,
    color: "text-orange-600",
    bg: "bg-orange-100",
    gradient: "from-orange-500 to-amber-400",
    border: "border-l-orange-400",
    label: "Offer",
  },
  sale: {
    icon: <Percent className="size-4" />,
    color: "text-red-600",
    bg: "bg-red-100",
    gradient: "from-red-500 to-rose-400",
    border: "border-l-red-400",
    label: "Sale",
  },
  new_tour: {
    icon: <MapPin className="size-4" />,
    color: "text-blue-600",
    bg: "bg-blue-100",
    gradient: "from-blue-500 to-cyan-400",
    border: "border-l-blue-400",
    label: "New Tour",
  },
  new_car: {
    icon: <Car className="size-4" />,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    gradient: "from-emerald-500 to-teal-400",
    border: "border-l-emerald-400",
    label: "New Car",
  },
  booking: {
    icon: <Ticket className="size-4" />,
    color: "text-violet-600",
    bg: "bg-violet-100",
    gradient: "from-violet-500 to-purple-400",
    border: "border-l-violet-400",
    label: "Booking",
  },
  general: {
    icon: <Bell className="size-4" />,
    color: "text-slate-600",
    bg: "bg-slate-100",
    gradient: "from-slate-500 to-slate-400",
    border: "border-l-slate-400",
    label: "General",
  },
};

interface NotificationListProps {
  notifications: NotificationItem[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();
  const [data, setData] = React.useState(notifications);
  const [isPending, startTransition] = React.useTransition();
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  React.useEffect(() => {
    setData(notifications);
  }, [notifications]);

  const unreadCount = data.filter((n) => !n.isRead).length;
  const visible = filter === "unread" ? data.filter((n) => !n.isRead) : data;

  const handleRead = (id: string) => {
    startTransition(async () => {
      await markAsRead(id);
      setData((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      router.refresh();
    });
  };

  const handleMarkAll = () => {
    startTransition(async () => {
      await markAllAsRead();
      setData((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl border bg-muted/40 p-1 shadow-sm">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "relative rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : "Unread"}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={isPending}
            className="gap-1.5 text-xs shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 text-center">
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-inner">
            <Bell className="size-7 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary/20 ring-2 ring-background" />
          </div>
          <p className="mt-4 text-base font-semibold">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re all caught up!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
            return (
              <div
                key={n.id}
                className={cn(
                  "group relative flex items-start gap-4 rounded-xl border-l-4 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                  n.isRead
                    ? "border border-border border-l-4 bg-background"
                    : cn("border border-primary/10 bg-linear-to-r from-primary/5 to-transparent", cfg.border),
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm",
                    n.isRead ? cn(cfg.bg, cfg.color) : "bg-linear-to-br " + cfg.gradient + " text-white shadow-md",
                  )}
                >
                  {cfg.icon}
                  {!n.isRead && (
                    <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        n.isRead ? "font-medium text-foreground/80" : "font-semibold text-foreground",
                      )}
                    >
                      {n.title}
                    </p>
                    <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{n.body}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        cfg.bg,
                        cfg.color,
                      )}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Mark read button */}
                {!n.isRead && (
                  <button
                    className="shrink-0 flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary opacity-0 transition-all group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                    disabled={isPending}
                    onClick={() => handleRead(n.id)}
                    title="Mark as read"
                  >
                    <Check className="size-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
