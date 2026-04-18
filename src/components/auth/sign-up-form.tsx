"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, UserPlus } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to create the account.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <Card className="border-white/60 bg-white/90 shadow-2xl shadow-cyan-950/10 backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-slate-950">
          Create your TourVibe account
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Public signup creates tourist accounts only. Driver access is provisioned by
          a super admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" placeholder="Ariana Walker" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Tourist is the default public account role.
          </div>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <Button
            className="h-11 w-full rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400"
            type="submit"
            disabled={isPending}
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Create Account
          </Button>
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-semibold text-cyan-700" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
