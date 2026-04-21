"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Car,
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
import { Badge } from "@/components/ui/badge";
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

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  offer: { label: "Offer", icon: <Tag className="size-3.5" />, color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  sale: { label: "Sale", icon: <Percent className="size-3.5" />, color: "text-red-700", bg: "bg-red-50 border-red-200" },
  new_tour: { label: "New Tour", icon: <MapPin className="size-3.5" />, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  new_car: { label: "New Car", icon: <Car className="size-3.5" />, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  booking: { label: "Booking", icon: <Ticket className="size-3.5" />, color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  general: { label: "General", icon: <Bell className="size-3.5" />, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
};

interface AdminNotificationTableProps {
  notifications: AdminNotification[];
}

export function AdminNotificationTable({ notifications }: AdminNotificationTableProps) {
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
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 text-center">
        <Bell className="size-8 text-muted-foreground" />
        <p className="mt-3 font-medium text-muted-foreground">No notifications sent yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((n) => {
        const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
        return (
          <div
            key={n.id}
            className="flex items-start gap-4 rounded-xl border bg-background p-4"
          >
            {/* Type badge */}
            <Badge
              variant="outline"
              className={cn("mt-0.5 flex shrink-0 items-center gap-1 text-xs font-semibold", cfg.color, cfg.bg)}
            >
              {cfg.icon}
              {cfg.label}
            </Badge>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-sm">{n.title}</p>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {n.targetUserId ? (
                    <><User className="size-3" /> {n.targetUserName ?? "Specific user"}</>
                  ) : (
                    <><Users className="size-3" /> All users</>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {n.readCount} read
                </span>
                <span className="text-xs text-muted-foreground">
                  · {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.body}</p>
            </div>

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              disabled={isPending}
              onClick={() => handleDelete(n.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
