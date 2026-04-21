"use client";

import * as React from "react";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

import { updatePassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [isPending, startTransition] = React.useTransition();
  const [show, setShow] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Password updated successfully");
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="currentPassword"
            name="currentPassword"
            type={show ? "text" : "password"}
            required
            className="pl-9 pr-10"
            placeholder="Enter current password"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type={show ? "text" : "password"}
            required
            minLength={8}
            className="pr-3"
            placeholder="Min. 8 characters"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={show ? "text" : "password"}
            required
            minLength={8}
            className="pr-3"
            placeholder="Repeat new password"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Update Password
        </Button>
      </div>
    </form>
  );
}
