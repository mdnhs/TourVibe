"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Car,
  Eye,
  MapPin,
  Percent,
  Tag,
  Ticket,
  Trash2,
  Users,
  User,
} from "lucide-react";

import { deleteNotification } from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  targetUserId: string | null;
  targetUserName: string | null;
  createdAt: string;
  readCount: number;
};

const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    gradient: string;
    border: string;
  }
> = {
  offer: {
    label: "Offer",
    icon: <Tag className="size-3.5" />,
    color: "text-orange-700",
    bg: "bg-orange-50",
    gradient: "from-orange-500 to-amber-400",
    border: "border-l-orange-400",
  },
  sale: {
    label: "Sale",
    icon: <Percent className="size-3.5" />,
    color: "text-red-700",
    bg: "bg-red-50",
    gradient: "from-red-500 to-rose-400",
    border: "border-l-red-400",
  },
  new_tour: {
    label: "New Tour",
    icon: <MapPin className="size-3.5" />,
    color: "text-blue-700",
    bg: "bg-blue-50",
    gradient: "from-blue-500 to-cyan-400",
    border: "border-l-blue-400",
  },
  new_car: {
    label: "New Car",
    icon: <Car className="size-3.5" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    gradient: "from-emerald-500 to-teal-400",
    border: "border-l-emerald-400",
  },
  booking: {
    label: "Booking",
    icon: <Ticket className="size-3.5" />,
    color: "text-violet-700",
    bg: "bg-violet-50",
    gradient: "from-violet-500 to-purple-400",
    border: "border-l-violet-400",
  },
  general: {
    label: "General",
    icon: <Bell className="size-3.5" />,
    color: "text-slate-700",
    bg: "bg-slate-50",
    gradient: "from-slate-500 to-slate-400",
    border: "border-l-slate-400",
  },
};

interface AdminNotificationTableProps {
  notifications: AdminNotification[];
}

export function AdminNotificationTable({
  notifications,
}: AdminNotificationTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState(notifications);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setData(notifications);
  }, [notifications]);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this notification?")) return;
    startTransition(async () => {
      const result = await deleteNotification(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Notification deleted");
        setData((prev) => prev.filter((n) => n.id !== id));
        router.refresh();
      }
    });
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-14 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner">
          <Bell className="size-6 text-muted-foreground" />
        </div>
        <p className="mt-3 font-semibold text-muted-foreground">
          No notifications sent yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Use the form above to send your first notification.
        </p>
      </div>
    );
  }

  const totalReads = data.reduce((s, n) => s + n.readCount, 0);

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{data.length}</span>
          <span className="text-muted-foreground">sent</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <Eye className="size-3.5 text-muted-foreground" />
          <span className="font-semibold text-foreground">{totalReads}</span>
          <span className="text-muted-foreground">total reads</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {data.map((n) => {
          const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
          return (
            <div
              key={n.id}
              className={cn(
                "group flex items-start gap-4 rounded-xl border border-l-4 bg-background p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                cfg.border,
              )}
            >
              {/* Type icon */}
              <div
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                  cfg.gradient,
                )}
              >
                {cfg.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="font-semibold text-sm">{n.title}</p>
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

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {n.body}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-0.5">
                  {/* Audience */}
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    {n.targetUserId ? (
                      <>
                        <User className="size-3" />
                        {n.targetUserName ?? "Specific user"}
                      </>
                    ) : (
                      <>
                        <Users className="size-3" />
                        All users
                      </>
                    )}
                  </span>

                  {/* Read count */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <Eye className="size-3" />
                    {n.readCount} read
                  </span>

                  {/* Time */}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                disabled={isPending}
                onClick={() => handleDelete(n.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
