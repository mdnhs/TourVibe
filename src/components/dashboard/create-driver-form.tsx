"use client";

import { FormEvent, useState, useTransition } from "react";
import { LoaderCircle, UserPlus2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateDriverForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const response = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });

      const data = (await response.json()) as { error?: string; user?: { email?: string } };

      if (!response.ok) {
        setError(data.error ?? "Unable to create the driver account.");
        return;
      }

      form.reset();
      setSuccess(
        `Driver account created${data.user?.email ? ` for ${data.user.email}` : "."}`,
      );
    });
  }

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Create Driver Account</CardTitle>
        <CardDescription>
          Drivers are provisioned only by super admin from this dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="driver-name">Full name</Label>
            <Input id="driver-name" name="name" placeholder="Rahim Driver" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driver-email">Email</Label>
            <Input
              id="driver-email"
              name="email"
              type="email"
              placeholder="driver@tourvibe.demo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driver-password">Temporary password</Label>
            <Input
              id="driver-password"
              name="password"
              type="password"
              minLength={8}
              placeholder="At least 8 characters"
              required
            />
          </div>
          {error ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              {success}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full"
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <UserPlus2 className="size-4" />
            )}
            Create Driver
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
