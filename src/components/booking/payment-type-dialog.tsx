"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/currency";

interface PaymentTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  currency?: string;
  loading?: boolean;
  onConfirm: (paymentType: "ADVANCE" | "FULL") => void;
}

export function PaymentTypeDialog({
  open,
  onOpenChange,
  total,
  currency,
  loading,
  onConfirm,
}: PaymentTypeDialogProps) {
  const [choice, setChoice] = useState<"ADVANCE" | "FULL">("FULL");
  const advance = Math.round(total * 0.2 * 100) / 100;
  const balance = Math.round((total - advance) * 100) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose payment option</DialogTitle>
          <DialogDescription>
            Total package amount: <span className="font-semibold">{formatPrice(total, currency)}</span>
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={choice}
          onValueChange={(v) => setChoice(v as "ADVANCE" | "FULL")}
          className="gap-3"
        >
          <Label
            htmlFor="pay-advance"
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <RadioGroupItem id="pay-advance" value="ADVANCE" className="mt-1" />
            <div className="flex-1">
              <div className="font-semibold">Pay 20% advance</div>
              <div className="text-sm text-muted-foreground">
                Pay {formatPrice(advance, currency)} now. Remaining{" "}
                {formatPrice(balance, currency)} due before tour date.
              </div>
            </div>
          </Label>

          <Label
            htmlFor="pay-full"
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <RadioGroupItem id="pay-full" value="FULL" className="mt-1" />
            <div className="flex-1">
              <div className="font-semibold">Pay full amount</div>
              <div className="text-sm text-muted-foreground">
                Pay {formatPrice(total, currency)} now. Booking confirmed instantly.
              </div>
            </div>
          </Label>
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(choice)} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
