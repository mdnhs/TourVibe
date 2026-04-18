"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Ban, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { roleLabels } from "@/lib/permissions";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: keyof typeof roleLabels;
  banned: boolean;
  banReason: string | null;
  createdAt: string;
};

export function UserManagementTable({
  users,
  currentUserId,
}: {
  users: ManagedUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(
    userId: string,
    body:
      | {
          action: "set-role";
          role: keyof typeof roleLabels;
        }
      | {
          action: "ban";
          banReason?: string;
        }
      | {
          action: "unban";
        }
      | {
          action: "set-password";
          newPassword: string;
        },
  ) {
    setFeedback(null);
    setError(null);
    setPendingUserId(userId);

    startTransition(async () => {
      const response = await fetch("/api/admin/users/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...body,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Admin action failed.");
        setPendingUserId(null);
        return;
      }

      setFeedback("User settings updated.");
      setPendingUserId(null);
      router.refresh();
    });
  }

  function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
    userId: string,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newPassword = String(formData.get("newPassword") ?? "");

    runAction(userId, {
      action: "set-password",
      newPassword,
    });

    form.reset();
  }

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Super admin can review all accounts, change roles, ban access, and
          reset passwords.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {feedback ? (
          <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
            {feedback}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            const isBusy = isPending && pendingUserId === user.id;

            return (
              <div
                key={user.id}
                className="rounded-2xl border border-border bg-muted/30 p-4"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <span className="rounded-full bg-background border border-border px-2.5 py-1 text-xs text-muted-foreground">
                        {roleLabels[user.role]}
                      </span>
                      {user.banned ? (
                        <span className="rounded-full bg-destructive/10 border border-destructive/20 px-2.5 py-1 text-xs text-destructive">
                          Banned
                        </span>
                      ) : null}
                      {isCurrentUser ? (
                        <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-xs text-amber-800 dark:text-amber-400">
                          You
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Created {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    {user.banReason ? (
                      <p className="text-xs text-destructive">
                        Reason: {user.banReason}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 xl:min-w-[28rem]">
                    <div className="flex flex-col gap-2 md:flex-row">
                      <select
                        defaultValue={user.role}
                        disabled={isBusy || isCurrentUser}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                        onChange={(event) =>
                          runAction(user.id, {
                            action: "set-role",
                            role: event.target.value as keyof typeof roleLabels,
                          })
                        }
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="driver">Driver</option>
                        <option value="tourist">Tourist</option>
                      </select>
                      {user.banned ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isBusy || isCurrentUser}
                          onClick={() =>
                            runAction(user.id, { action: "unban" })
                          }
                        >
                          {isBusy ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="size-4" />
                          )}
                          Unban
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isBusy || isCurrentUser}
                          onClick={() =>
                            runAction(user.id, {
                              action: "ban",
                              banReason: "Account disabled by super admin.",
                            })
                          }
                        >
                          {isBusy ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Ban className="size-4" />
                          )}
                          Ban
                        </Button>
                      )}
                    </div>

                    <form
                      className="flex flex-col gap-2 md:flex-row"
                      onSubmit={(event) => handlePasswordSubmit(event, user.id)}
                    >
                      <Input
                        name="newPassword"
                        type="password"
                        minLength={8}
                        placeholder="Set new password"
                        disabled={isBusy}
                        required
                      />
                      <Button type="submit" disabled={isBusy}>
                        {isBusy ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <KeyRound className="size-4" />
                        )}
                        Reset Password
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
