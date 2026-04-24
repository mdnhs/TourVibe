"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import {
  MailIcon, MailOpenIcon, CheckCheck, Trash2Icon, PhoneIcon,
  InboxIcon, ArrowLeftIcon, SearchIcon, ClockIcon,
} from "lucide-react";
import { updateMessageStatus, deleteMessage } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

const STATUS_CONFIG = {
  unread:  { label: "Unread",  class: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" },
  read:    { label: "Read",    class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  replied: { label: "Replied", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
};

export function MessagesTable({ messages }: { messages: Message[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedMessage = messages.find((m) => m.id === selectedId);

  const filteredMessages = messages.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  function markRead(id: string) {
    startTransition(async () => {
      await updateMessageStatus(id, "read");
      toast.success("Marked as read.");
    });
  }

  function markReplied(id: string) {
    startTransition(async () => {
      await updateMessageStatus(id, "replied");
      toast.success("Marked as replied.");
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    startTransition(async () => {
      await deleteMessage(id);
      if (selectedId === id) setSelectedId(null);
      toast.success("Message deleted.");
    });
  }

  function handleSelect(msg: Message) {
    setSelectedId(msg.id);
    if (msg.status === "unread") {
      markRead(msg.id);
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden bg-background">
      {/* List Panel */}
      <div className={cn(
        "flex w-full flex-col border-r md:w-80 lg:w-96",
        selectedId && "hidden md:flex"
      )}>
        <div className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border bg-muted/50 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <Separator />
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <InboxIcon className="size-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filteredMessages.map((msg) => {
                const isSelected = selectedId === msg.id;
                const isUnread = msg.status === "unread";
                return (
                  <button
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className={cn(
                      "flex w-full flex-col gap-1 p-4 text-left transition-colors hover:bg-muted/50",
                      isSelected && "bg-muted",
                      isUnread && "bg-indigo-50/30 dark:bg-indigo-950/10"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-sm font-semibold", isUnread && "text-indigo-600 dark:text-indigo-400")}>
                        {msg.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString("en-IE", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("line-clamp-1 text-xs", isUnread ? "font-bold" : "font-medium")}>
                        {msg.subject}
                      </span>
                      {isUnread && <span className="size-1.5 rounded-full bg-indigo-500" />}
                    </div>
                    <p className="line-clamp-2 text-[11px] text-muted-foreground leading-normal">
                      {msg.message}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden",
        !selectedId && "hidden md:flex items-center justify-center bg-muted/10"
      )}>
        {selectedMessage ? (
          <>
            {/* Toolbar */}
            <div className="flex h-14 items-center justify-between border-b px-4 shrink-0 bg-background">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {selectedMessage.status !== "replied" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => markReplied(selectedMessage.id)}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <CheckCheck className="size-3.5" /> Mark replied
                    </Button>
                  )}
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium hover:bg-accent transition-colors"
                  >
                    <MailIcon className="size-3.5" /> Reply
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={pending}
                  onClick={() => remove(selectedMessage.id)}
                  className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                      {selectedMessage.subject}
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-y py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-bold text-sm">
                          {selectedMessage.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="grid gap-0.5">
                          <p className="text-sm font-semibold">{selectedMessage.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedMessage.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ClockIcon className="size-3.5" />
                          {new Date(selectedMessage.createdAt).toLocaleString("en-IE", {
                            day: "numeric", month: "long", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                        {selectedMessage.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <PhoneIcon className="size-3.5" />
                            {selectedMessage.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap py-2">
                    {selectedMessage.message}
                  </div>

                  <div className="mt-8 border-t pt-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status: {STATUS_CONFIG[selectedMessage.status as keyof typeof STATUS_CONFIG]?.label || selectedMessage.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50 border shadow-inner">
              <MailIcon className="size-8 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-sm font-semibold">Select a message to read</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
                Choose a message from the list on the left to view its full details.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
