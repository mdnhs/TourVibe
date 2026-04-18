"use client";

import * as React from "react";
import { useTransition, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDriver, updateDriver } from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// ── Create Driver Form ────────────────────────────────────────────────────────

export function CreateDriverForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createDriver(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Driver account created successfully");
        formRef.current?.reset();
        router.refresh();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="e.g. John Doe" required disabled={isPending} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="e.g. john@example.com" required disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Temporary Password</Label>
        <Input id="password" name="password" type="password" minLength={8} placeholder="At least 8 characters" required disabled={isPending} />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Creating..." : "Create Driver Account"}
        </Button>
      </div>
    </form>
  );
}

// ── Edit Driver Form ──────────────────────────────────────────────────────────

export function EditDriverForm({ 
  driver,
  onSuccess
}: { driver: any; onSuccess?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateDriver(driver.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Driver updated successfully");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/drivers");
        }
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={driver.name} 
          required 
          disabled={isPending} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email"
          defaultValue={driver.email} 
          required 
          disabled={isPending} 
        />
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
