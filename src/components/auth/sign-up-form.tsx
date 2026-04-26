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

interface SignUpFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function SignUpForm({ onSuccess, compact }: SignUpFormProps = {}) {
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
        <Label htmlFor="signup-name">Full name</Label>
        <Input id="signup-name" name="name" placeholder="Ariana Walker" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          minLength={8}
          placeholder="At least 8 characters"
          required
        />
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
        Tourist is the default public account role.
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <Button
        className="h-11 w-full rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300"
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
      {!compact && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link className="font-semibold text-cyan-700 dark:text-cyan-400" href="/login">
            Sign in
          </Link>
        </p>
      )}
    </form>
  );

  if (compact) return formContent;

  return (
    <Card className="border-white/60 bg-white/90 shadow-2xl shadow-cyan-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/40">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-slate-950 dark:text-white">
          Create your TourVibe account
        </CardTitle>
        <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
          Public signup creates tourist accounts only. Driver access is provisioned by
          a super admin.
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
