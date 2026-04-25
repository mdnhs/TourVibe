"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogIn } from "lucide-react";
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

interface SignInFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function SignInForm({ onSuccess, compact }: SignInFormProps = {}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to sign in.");
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  const formContent = (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button
        className="h-11 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800"
        type="submit"
        disabled={isPending}
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        Sign In
      </Button>
      {!compact && (
        <p className="text-sm text-slate-600">
          New here?{" "}
          <Link className="font-semibold text-amber-700" href="/signup">
            Create an account
          </Link>
        </p>
      )}
    </form>
  );

  if (compact) return formContent;

  return (
    <Card className="border-white/60 bg-white/90 shadow-2xl shadow-amber-950/10 backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-slate-950">Welcome back</CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Sign in to manage tours, bookings, routes and customer requests.
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
