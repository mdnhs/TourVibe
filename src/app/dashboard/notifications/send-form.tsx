"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
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

const NOTIFICATION_TYPES = [
  { value: "general", label: "General" },
  { value: "offer", label: "Offer" },
  { value: "sale", label: "Sale" },
  { value: "new_tour", label: "New Tour Package" },
  { value: "new_car", label: "New Car / Vehicle" },
  { value: "booking", label: "Booking Update" },
];

interface SendFormProps {
  users: { id: string; name: string; email: string }[];
}

export function SendNotificationForm({ users }: SendFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [type, setType] = React.useState<string>("general");
  const [target, setTarget] = React.useState<string>("all");
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
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Type */}
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            name="type"
            value={type}
            onValueChange={(v) => v && setType(v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audience */}
        <div className="space-y-2">
          <Label>Send To</Label>
          <Select
            value={target}
            onValueChange={(v) => v && setTarget(v)}
          >
            <SelectTrigger>
              <SelectValue />
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
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="notif-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="notif-title"
          name="title"
          placeholder="e.g. 🎉 20% off all tours this weekend!"
          required
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label htmlFor="notif-body">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="notif-body"
          name="body"
          rows={3}
          placeholder="Write your notification message here..."
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Send className="mr-2 size-4" />
          )}
          Send Notification
        </Button>
      </div>
    </form>
  );
}
