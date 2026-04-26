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
          className="placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
          className="placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <Button
        className="h-11 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
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
        <p className="text-sm text-slate-600 dark:text-slate-400">
          New here?{" "}
          <Link className="font-semibold text-amber-700 dark:text-amber-400" href="/signup">
            Create an account
          </Link>
        </p>
      )}
    </form>
  );

  if (compact) return formContent;

  return (
    <Card className="border-white/60 bg-white/90 shadow-2xl shadow-amber-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/40">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-slate-950 dark:text-white">Welcome back</CardTitle>
        <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
          Sign in to manage tours, bookings, routes and customer requests.
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
