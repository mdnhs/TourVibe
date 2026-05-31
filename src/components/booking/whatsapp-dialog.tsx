"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { isValidE164, normalizeWhatsapp } from "@/lib/whatsapp";

interface WhatsappDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function WhatsappDialog({ open, onOpenChange, onSuccess }: WhatsappDialogProps) {
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeWhatsapp(whatsapp);
    if (!isValidE164(normalized)) {
      toast.error("Enter a valid WhatsApp number in international format (e.g. +14155551234)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: normalized }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save WhatsApp number");
        return;
      }
      onOpenChange(false);
      setWhatsapp("");
      onSuccess();
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="text-xl font-bold">
          Add your WhatsApp number
        </DialogTitle>
        <DialogDescription>
          We use WhatsApp to confirm your booking and share trip details.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-whatsapp">WhatsApp number</Label>
            <Input
              id="booking-whatsapp"
              type="tel"
              autoFocus
              required
              placeholder="+14155551234"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Include country code with leading +.
            </p>
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save and continue"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
