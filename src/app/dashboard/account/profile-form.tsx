"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Loader2, Phone, User } from "lucide-react";
import Image from "next/image";

import { updateProfile } from "./actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phone: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="size-20">
            <AvatarImage src={preview ?? user.image ?? ""} alt={user.name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-foreground text-background shadow ring-2 ring-background transition hover:opacity-80"
          >
            <Camera className="size-3.5" />
          </button>
          <input
            ref={fileRef}
            name="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Change photo
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              defaultValue={user.name}
              required
              className="pl-9"
              placeholder="Your full name"
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user.email}
            readOnly
            disabled
            className="bg-muted/50"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="phone">
            Phone Number{" "}
            <span className="text-destructive">*</span>
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              (required to book tours)
            </span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={user.phone ?? ""}
              className="pl-9"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          {!user.phone && (
            <p className="text-xs text-amber-600">
              You must add a phone number before you can book a tour.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
