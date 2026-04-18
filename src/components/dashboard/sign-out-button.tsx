"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      className="w-full justify-start rounded-xl border-slate-300 bg-white/80 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
      onClick={handleSignOut}
      title="Sign Out"
    >
      <LogOut className="size-4" />
      <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
    </Button>
  );
}
