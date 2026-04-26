"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultTab?: "signin" | "signup";
}

export function AuthDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultTab = "signin",
}: AuthDialogProps) {
  const [tab, setTab] = useState<string>(defaultTab);

  function handleSuccess() {
    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-950 dark:text-white">
            Sign in to continue
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1 dark:text-slate-400">
            Login or create an account to book this tour.
          </DialogDescription>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="px-6 pb-6">
          <TabsList className="w-full mb-5">
            <TabsTrigger value="signin" className="flex-1">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <SignInForm onSuccess={handleSuccess} compact />
          </TabsContent>

          <TabsContent value="signup">
            <SignUpForm onSuccess={handleSuccess} compact />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
