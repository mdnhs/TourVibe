"use client";

import { useState, useTransition, useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  SaveIcon,
  CloudIcon,
  CreditCardIcon,
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircle2Icon,
  XIcon,
} from "lucide-react";
import { saveIntegrationsConfig } from "@/app/dashboard/site-config/actions";
import { cn } from "@/lib/utils";

interface IntegrationsSetupDialogProps {
  missingCloudinary: boolean;
  missingStripe: boolean;
}

function SecretInput({
  id,
  name,
  placeholder,
}: {
  id: string;
  name: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete="off"
        className="pr-9"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
      </button>
    </div>
  );
}

const DISMISS_KEY = "integrations_setup_dismissed";

export function IntegrationsSetupDialog({
  missingCloudinary,
  missingStripe,
}: IntegrationsSetupDialogProps) {
  const dismissed = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem(DISMISS_KEY),
    () => null,
  );
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const shouldAutoOpen = (missingCloudinary || missingStripe) && !dismissed;
  const open = manualOpen ?? shouldAutoOpen;
  const setOpen = (value: boolean) => setManualOpen(value);

  if (!missingCloudinary && !missingStripe) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveIntegrationsConfig(fd);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setSaved(true);
        toast.success("Integration credentials saved.");
        setTimeout(() => setOpen(false), 1200);
      }
    });
  }

  const missing = [
    missingCloudinary && "Cloudinary",
    missingStripe && "Stripe",
  ].filter(Boolean).join(" and ");

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60">
              <AlertTriangleIcon className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-base">Setup Required</DialogTitle>
          </div>
          <DialogDescription>
            <strong className="text-foreground">{missing}</strong>{" "}
            {missing.includes("and") ? "credentials are" : "credentials are"} not configured.
            Set them now to enable uploads and payments.
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60">
              <CheckCircle2Icon className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-semibold text-sm">Credentials saved successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">

            {/* ── Cloudinary ── */}
            {missingCloudinary && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                    <CloudIcon className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold">Cloudinary</h3>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full px-2 py-0.5">
                    Required for image uploads
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/10 p-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="s-cloudName" className="text-xs">Cloud Name</Label>
                    <Input id="s-cloudName" name="cloudinaryCloudName" placeholder="e.g. my-cloud" autoComplete="off" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-apiKey" className="text-xs">API Key</Label>
                    <SecretInput id="s-apiKey" name="cloudinaryApiKey" placeholder="e.g. 737271562341938" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-apiSecret" className="text-xs">API Secret</Label>
                    <SecretInput id="s-apiSecret" name="cloudinaryApiSecret" placeholder="Your Cloudinary API secret" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Find these in Cloudinary Dashboard → Settings → Access Keys.
                  </p>
                </div>
              </div>
            )}

            {/* ── Stripe ── */}
            {missingStripe && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/50">
                    <CreditCardIcon className="size-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-sm font-bold">Stripe</h3>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full px-2 py-0.5">
                    Required for payments
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/10 p-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="s-stripeKey" className="text-xs">Secret Key</Label>
                    <SecretInput id="s-stripeKey" name="stripeSecretKey" placeholder="sk_live_… or sk_test_…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-webhookSecret" className="text-xs">Webhook Secret</Label>
                    <SecretInput id="s-webhookSecret" name="stripeWebhookSecret" placeholder="whsec_…" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Stripe Dashboard → Developers → API Keys &amp; Webhooks.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={pending} size="sm" className="gap-2">
                {pending
                  ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
                  : <><SaveIcon className="size-3.5" /> Save &amp; Continue</>}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={dismiss}
                className="gap-1.5 text-muted-foreground"
              >
                <XIcon className="size-3.5" />
                Skip for now
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
