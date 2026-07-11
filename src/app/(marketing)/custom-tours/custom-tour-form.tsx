"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitCustomTourRequest } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Send, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const TOURIST_PLACES = [
  "Cliffs of Moher",
  "Ring of Kerry",
  "Giant's Causeway",
  "Blarney Castle",
  "Killarney National Park",
  "Trinity College",
  "Guinness Storehouse",
  "Dingle Peninsula",
  "Kylemore Abbey",
  "Rock of Cashel",
  "Glendalough",
  "Skellig Michael",
  "Connemara National Park",
  "Charles Fort",
  "Kinsale City",
  "Old Head Cliff",
  "Aran Islands",
  "Dublin Castle",
  "Kilmainham Gaol",
  "The Burren",
];

export function CustomTourForm() {
  const [pending, startTransition] = useTransition();
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const togglePlace = (place: string) => {
    setSelectedPlaces((prev) =>
      prev.includes(place) ? prev.filter((p) => p !== place) : [...prev, place]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPlaces.length === 0) {
      toast.error("Please select at least one tourist place.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    fd.append("places", JSON.stringify(selectedPlaces));

    startTransition(async () => {
      const res = await submitCustomTourRequest(fd);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Request sent! We will contact you soon.");
        (e.target as HTMLFormElement).reset();
        setSelectedPlaces([]);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 sm:p-10">
      
      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Your Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-slate-700">Name</label>
            <Input id="name" name="name" required placeholder="John Doe" className="rounded-xl border-slate-200" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</label>
            <Input id="email" name="email" type="email" required placeholder="john@example.com" className="rounded-xl border-slate-200" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone</label>
            <Input id="phone" name="phone" type="tel" required placeholder="+1 234 567 890" className="rounded-xl border-slate-200" />
          </div>
        </div>
      </div>

      {/* Places Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Select Places to Visit</h3>
        <p className="text-sm text-slate-500">Choose the destinations you'd like to include in your custom tour.</p>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between rounded-xl border-slate-200 h-14 bg-slate-50/50 text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 focus:ring-4 focus:ring-amber-400/20 transition-all"
            >
              {selectedPlaces.length > 0
                ? <span className="text-slate-900">{selectedPlaces.length} place(s) selected</span>
                : "Select tourist places..."}
              <ChevronDown className={cn("ml-2 size-5 shrink-0 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            align="start"
            className="w-[var(--radix-popover-trigger-width)] p-1.5 max-h-80 overflow-y-auto rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 bg-white/95 backdrop-blur-xl"
          >
            <div className="grid gap-0.5">
              {TOURIST_PLACES.map((place) => {
                const isSelected = selectedPlaces.includes(place);
                return (
                  <label
                    key={place}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200",
                      isSelected ? "bg-amber-50/80" : "hover:bg-slate-100/60"
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => togglePlace(place)}
                        className={cn("size-5 rounded-[6px] border-2", isSelected ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300")}
                      />
                    </div>
                    <span className={cn("text-sm transition-colors", isSelected ? "font-bold text-amber-900" : "font-medium text-slate-700")}>
                      {place}
                    </span>
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {selectedPlaces.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedPlaces.map((place) => (
              <span key={place} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                <MapPin className="size-3" />
                {place}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-semibold text-slate-700">Additional Notes (Optional)</label>
        <Textarea 
          id="notes" 
          name="notes" 
          placeholder="Tell us about any specific requirements or ideas for your tour..." 
          className="min-h-[100px] rounded-xl border-slate-200" 
        />
      </div>

      {/* Submit */}
      <Button 
        type="submit" 
        disabled={pending} 
        className="w-full rounded-xl bg-amber-400 text-slate-900 hover:bg-amber-500 py-6 text-lg font-bold shadow-lg shadow-amber-400/20"
      >
        {pending ? (
          <Loader2 className="mr-2 size-5 animate-spin" />
        ) : (
          <Send className="mr-2 size-5" />
        )}
        Submit Request
      </Button>
    </form>
  );
}
