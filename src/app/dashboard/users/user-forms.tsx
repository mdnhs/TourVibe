"use client";

import * as React from "react";
import { useTransition, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createUser, updateUser } from "./actions";

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

// ── Create User Form ──────────────────────────────────────────────────────────

export function CreateUserForm({ 
  onSuccess,
  customRoles = {} 
}: { onSuccess?: () => void; customRoles?: Record<string, string> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<string>("tourist");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    startTransition(async () => {
      const result = await createUser(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("User account created successfully");
        formRef.current?.reset();
        if (onSuccess) onSuccess();
        router.refresh();
      }
    });
  };

  const hasCustomRoles = Object.keys(customRoles).length > 0;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="e.g. Jane Doe" required disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="e.g. jane@example.com" required disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Temporary Password</Label>
        <Input id="password" name="password" type="password" minLength={8} placeholder="At least 8 characters" required disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={setRole} disabled={isPending}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tourist">Tourist</SelectItem>
            <SelectItem value="driver">Driver</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            {hasCustomRoles && (
              <>
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground border-t mt-1 pt-2">
                  Custom Roles
                </div>
                {Object.entries(customRoles).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create User Account"}
      </Button>
    </form>
  );
}

// ── Edit User Form ────────────────────────────────────────────────────────────

export function EditUserForm({ 
  user,
  onSuccess,
  customRoles = {}
}: { user: any; onSuccess?: () => void; customRoles?: Record<string, string> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<string>(user.role);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    startTransition(async () => {
      const result = await updateUser(user.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("User updated successfully");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/users");
        }
        router.refresh();
      }
    });
  };

  const hasCustomRoles = Object.keys(customRoles).length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" defaultValue={user.name} required disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={user.email} required disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={setRole} disabled={isPending}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tourist">Tourist</SelectItem>
            <SelectItem value="driver">Driver</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            {hasCustomRoles && (
              <>
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground border-t mt-1 pt-2">
                  Custom Roles
                </div>
                {Object.entries(customRoles).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Change Password (optional)</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          placeholder="Leave blank to keep current password"
          disabled={isPending} 
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button 
          type="button"
          variant="outline" 
          onClick={() => onSuccess ? onSuccess() : router.refresh()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
