"use client";

import { useTransition, useState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { SendIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitContactForm(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSent(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
          <CheckCircle2Icon className="size-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="font-heading text-xl font-bold text-slate-950">Message sent!</p>
          <p className="mt-1 text-sm text-slate-500">We&apos;ll get back to you as soon as possible.</p>
        </div>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="John Doe"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="john@example.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Phone</label>
          <input
            name="phone"
            type="tel"
            placeholder="+353 87 000 0000"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            name="subject"
            required
            placeholder="Tour enquiry"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Message <span className="text-rose-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us about your trip plans, questions or anything else…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/35 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {pending ? (
          <><Loader2Icon className="size-4 animate-spin" /> Sending…</>
        ) : (
          <><SendIcon className="size-4 transition-transform group-hover:translate-x-0.5" /> Send Message</>
        )}
      </button>
    </form>
  );
}
