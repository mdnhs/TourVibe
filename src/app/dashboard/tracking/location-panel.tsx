"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Car,
  CheckCircle2,
  Clock,
  Crosshair,
  Loader2,
  MapPin,
  WifiOff,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { updateMyLocation, clearMyLocation } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface LocationPanelProps {
  currentLat: number | null;
  currentLng: number | null;
  currentLocationName: string | null;
  locationUpdatedAt: string | null;
}

export function LocationPanel({
  currentLat,
  currentLng,
  currentLocationName,
  locationUpdatedAt,
}: LocationPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [isGettingGPS, setIsGettingGPS] = React.useState(false);
  const [locationName, setLocationName] = React.useState(currentLocationName ?? "");
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(
    currentLat && currentLng ? { lat: currentLat, lng: currentLng } : null,
  );

  const isSharing = coords !== null;

  const parseUtc = (s: string) =>
    new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z");

  const handleGetGPS = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setIsGettingGPS(false);
        toast.success("GPS location acquired. Click Share to go live.");
      },
      (err) => {
        setIsGettingGPS(false);
        toast.error("Could not get GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const handleShare = () => {
    if (!coords) return;
    startTransition(async () => {
      const result = await updateMyLocation(coords.lat, coords.lng, locationName);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Location shared!");
        router.refresh();
      }
    });
  };

  const handleClear = () => {
    startTransition(async () => {
      const result = await clearMyLocation();
      if (result?.error) {
        toast.error(result.error);
      } else {
        setCoords(null);
        setLocationName("");
        toast.success("Location cleared.");
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            isSharing ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground",
          )}>
            <Car className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">My Location</p>
            <p className={cn("text-xs", isSharing ? "text-emerald-600" : "text-muted-foreground")}>
              {isSharing ? "Currently sharing" : "Not sharing"}
            </p>
          </div>
        </div>
        {isSharing && locationUpdatedAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {formatDistanceToNow(parseUtc(locationUpdatedAt), { addSuffix: true })}
          </div>
        )}
      </div>

      {/* Current coords */}
      {coords && (
        <div className="rounded-lg bg-muted/50 border px-3 py-2 text-xs font-mono text-muted-foreground">
          <MapPin className="inline size-3 mr-1" />
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          {currentLocationName && (
            <span className="ml-2 not-italic font-sans text-foreground">
              · {currentLocationName}
            </span>
          )}
        </div>
      )}

      {/* Location name */}
      <div className="space-y-1.5">
        <Label htmlFor="loc-name" className="text-xs">
          Spot Name <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="loc-name"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g. Cox's Bazar Beach, Sylhet Tea Garden…"
          className="h-8 text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleGetGPS}
          disabled={isGettingGPS || isPending}
        >
          {isGettingGPS ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Crosshair className="size-3.5" />
          )}
          {coords ? "Re-acquire GPS" : "Get GPS Location"}
        </Button>

        {coords && (
          <Button
            size="sm"
            onClick={handleShare}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            Share Location
          </Button>
        )}

        {isSharing && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={handleClear}
            disabled={isPending}
          >
            <X className="size-3.5" />
            Stop Sharing
          </Button>
        )}
      </div>

      {!coords && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <WifiOff className="size-3 shrink-0" />
          Tourists and admin will see your location on the live map when you share.
        </p>
      )}
    </div>
  );
}
