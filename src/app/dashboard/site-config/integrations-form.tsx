"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  SaveIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { saveIntegrationsConfig } from "./actions";

interface IntegrationsValues {
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
}

function StatusBadge({ configured }: { configured: boolean }) {
  return configured ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
      <CheckCircle2Icon className="size-2.5" /> Configured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400">
      <AlertCircleIcon className="size-2.5" /> Not set
    </span>
  );
}

function SecretField({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  const isConfigured = !!defaultValue;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label htmlFor={name}>{label}</Label>
        <StatusBadge configured={isConfigured} />
      </div>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          autoComplete="off"
          className="pr-9 font-mono text-sm"
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
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function IntegrationsForm({ values }: { values: IntegrationsValues }) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveIntegrationsConfig(fd);
      if (res?.error) toast.error(res.error);
      else toast.success("Integration credentials saved.");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <p className="text-xs text-muted-foreground rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-2">
        Credentials are stored in the database. Secrets are masked by default — click the eye icon to reveal.
      </p>

      {/* ── Cloudinary ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold">Cloudinary</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Used for image uploads (logos, tour thumbnails, hero cover).</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="cloudinaryCloudName">Cloud Name</Label>
              <StatusBadge configured={!!values.cloudinaryCloudName} />
            </div>
            <Input
              id="cloudinaryCloudName"
              name="cloudinaryCloudName"
              defaultValue={values.cloudinaryCloudName}
              placeholder="e.g. my-cloud"
              autoComplete="off"
            />
          </div>

          <SecretField
            label="API Key"
            name="cloudinaryApiKey"
            defaultValue={values.cloudinaryApiKey}
            placeholder="e.g. 737271562341938"
          />

          <SecretField
            label="API Secret"
            name="cloudinaryApiSecret"
            defaultValue={values.cloudinaryApiSecret}
            hint="Find these in Cloudinary Dashboard → Settings → Access Keys."
          />
        </div>
      </div>

      {/* ── Stripe ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold">Stripe</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Used for payment processing and booking checkout.</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-3">
          <SecretField
            label="Secret Key"
            name="stripeSecretKey"
            defaultValue={values.stripeSecretKey}
            placeholder="sk_live_… or sk_test_…"
            hint="Stripe Dashboard → Developers → API Keys."
          />

          <SecretField
            label="Webhook Secret"
            name="stripeWebhookSecret"
            defaultValue={values.stripeWebhookSecret}
            placeholder="whsec_…"
            hint="Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret."
          />
        </div>
      </div>

      <Button type="submit" disabled={pending} className="gap-2">
        {pending
          ? <><Loader2 className="size-4 animate-spin" /> Saving…</>
          : <><SaveIcon className="size-4" /> Save Credentials</>}
      </Button>
    </form>
  );
}
