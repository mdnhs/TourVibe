"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSeoSettings } from "./actions";

interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
}

export function SeoForm({ initialData }: { initialData: SeoSettings }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateSeoSettings(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("SEO settings updated successfully");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Meta Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initialData.title}
          placeholder="Site title for search engines"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Meta Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData.description}
          placeholder="Brief summary of the site"
          rows={4}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="keywords">Keywords</Label>
        <Input
          id="keywords"
          name="keywords"
          defaultValue={initialData.keywords}
          placeholder="comma, separated, keywords"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Updating..." : "Update SEO Settings"}
      </Button>
    </form>
  );
}
