"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createCustomRole } from "./actions";

const AVAILABLE_MENUS = [
  "Overview",
  "Bookings",
  "Tours",
  "Reviews",
  "Drivers",
  "Vehicles",
  "Users",
  "Roles & Permissions",
  "Live Tracking",
  "Notifications",
  "Appearance",
  "Account",
];

export function CreateRoleForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    selectedMenus.forEach(menu => {
      formData.append("permissions", menu);
    });

    startTransition(async () => {
      const result = await createCustomRole(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Role created successfully");
        onSuccess?.();
      }
    });
  };

  const toggleMenu = (menu: string) => {
    setSelectedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu) 
        : [...prev, menu]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Role Name</Label>
        <Input id="name" name="name" placeholder="e.g. Manager" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Role purpose..." />
      </div>
      <div className="space-y-2">
        <Label>Sidebar Permissions</Label>
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-4">
          {AVAILABLE_MENUS.map((menu) => (
            <div key={menu} className="flex items-center space-x-2">
              <Checkbox 
                id={`menu-${menu}`} 
                checked={selectedMenus.includes(menu)}
                onCheckedChange={() => toggleMenu(menu)}
              />
              <label 
                htmlFor={`menu-${menu}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {menu}
              </label>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Role"}
      </Button>
    </form>
  );
}
