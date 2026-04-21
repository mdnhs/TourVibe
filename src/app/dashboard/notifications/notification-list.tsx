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
  { icon: React.ReactNode; color: string; bg: string }
> = {
  offer: {
    icon: <Tag className="size-4" />,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  sale: {
    icon: <Percent className="size-4" />,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  new_tour: {
    icon: <MapPin className="size-4" />,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  new_car: {
    icon: <Car className="size-4" />,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  booking: {
    icon: <Ticket className="size-4" />,
    color: "text-violet-600",
    bg: "bg-violet-100",
  },
  general: {
    icon: <Bell className="size-4" />,
    color: "text-slate-600",
    bg: "bg-slate-100",
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            disabled={isPending}
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
            <Bell className="size-6 text-muted-foreground" />
          </div>
          <p className="mt-4 font-medium">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            You're all caught up!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-4 rounded-xl border p-4 transition-colors",
                  n.isRead
                    ? "bg-background"
                    : "border-primary/20 bg-primary/5",
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                    cfg.bg,
                    cfg.color,
                  )}
                >
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        n.isRead ? "font-medium" : "font-semibold",
                      )}
                    >
                      {n.title}
                      {!n.isRead && (
                        <span className="ml-2 inline-block size-2 rounded-full bg-primary align-middle" />
                      )}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </div>

                {/* Mark read button */}
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs"
                    disabled={isPending}
                    onClick={() => handleRead(n.id)}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
