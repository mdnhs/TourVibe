"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Bell,
  Car,
  Loader2,
  MapPin,
  Percent,
  Send,
  Tag,
  Ticket,
  Users,
  User,
} from "lucide-react";
import { sendNotification } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const NOTIFICATION_TYPES = [
  {
    value: "general",
    label: "General",
    icon: <Bell className="size-4" />,
    gradient: "from-slate-500 to-slate-400",
    activeRing: "ring-slate-400",
  },
  {
    value: "offer",
    label: "Offer",
    icon: <Tag className="size-4" />,
    gradient: "from-orange-500 to-amber-400",
    activeRing: "ring-orange-400",
  },
  {
    value: "sale",
    label: "Sale",
    icon: <Percent className="size-4" />,
    gradient: "from-red-500 to-rose-400",
    activeRing: "ring-red-400",
  },
  {
    value: "new_tour",
    label: "New Tour",
    icon: <MapPin className="size-4" />,
    gradient: "from-blue-500 to-cyan-400",
    activeRing: "ring-blue-400",
  },
  {
    value: "new_car",
    label: "New Car",
    icon: <Car className="size-4" />,
    gradient: "from-emerald-500 to-teal-400",
    activeRing: "ring-emerald-400",
  },
  {
    value: "booking",
    label: "Booking",
    icon: <Ticket className="size-4" />,
    gradient: "from-violet-500 to-purple-400",
    activeRing: "ring-violet-400",
  },
];

interface SendFormProps {
  users: { id: string; name: string; email: string }[];
}

export function SendNotificationForm({ users }: SendFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [type, setType] = React.useState<string>("general");
  const [target, setTarget] = React.useState<string>("all");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (target === "all") formData.delete("targetUserId");

    startTransition(async () => {
      const result = await sendNotification(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Notification sent successfully");
        formRef.current?.reset();
        setType("general");
        setTarget("all");
        setTitle("");
        setBody("");
      }
    });
  };

  const selectedType = NOTIFICATION_TYPES.find((t) => t.value === type)!;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Type picker */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Notification Type
        </Label>
        <input type="hidden" name="type" value={type} />
        <div className="flex flex-wrap gap-2">
          {NOTIFICATION_TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-150",
                type === t.value
                  ? cn("border-transparent text-white shadow-md ring-2 ring-offset-1 bg-linear-to-br", t.gradient, t.activeRing)
                  : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audience */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Send To
        </Label>
        <Select value={target} onValueChange={(v) => v && setTarget(v)}>
          <SelectTrigger className="h-10 rounded-xl">
            <div className="flex items-center gap-2">
              {target === "all" ? (
                <Users className="size-3.5 text-muted-foreground" />
              ) : (
                <User className="size-3.5 text-muted-foreground" />
              )}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name} ({u.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {target !== "all" && (
          <input type="hidden" name="targetUserId" value={target} />
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label
          htmlFor="notif-title"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="notif-title"
          name="title"
          className="h-10 rounded-xl"
          placeholder="e.g. 20% off all tours this weekend!"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label
          htmlFor="notif-body"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="notif-body"
          name="body"
          rows={3}
          className="rounded-xl resize-none"
          placeholder="Write your notification message here..."
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      {/* Preview */}
      {(title || body) && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Preview
          </p>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm bg-linear-to-br",
                selectedType.gradient,
              )}
            >
              {selectedType.icon}
            </div>
            <div>
              {title && <p className="text-sm font-semibold">{title}</p>}
              {body && (
                <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className={cn(
            "gap-2 rounded-xl px-5 text-white shadow-md transition-all",
            "bg-linear-to-br",
            selectedType.gradient,
          )}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Send Notification
        </Button>
      </div>
    </form>
  );
}
