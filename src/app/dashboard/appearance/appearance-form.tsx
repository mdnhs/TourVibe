"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();

  return <div className="space-y-8"></div>;
}
