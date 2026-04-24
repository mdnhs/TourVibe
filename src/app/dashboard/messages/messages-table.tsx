"use client";

import { useTransition, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  MailIcon, 
  MailOpenIcon, 
  CheckCheck, 
  Trash2Icon, 
  PhoneIcon,
  InboxIcon, 
  ArrowLeftIcon, 
  SearchIcon, 
  ClockIcon,
  ArchiveIcon,
  StarIcon,
  FilterIcon,
  MoreVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshCcwIcon,
  CheckIcon,
} from "lucide-react";
import { 
  updateMessageStatus, 
  deleteMessage, 
  bulkUpdateStatus, 
  bulkDeleteMessages 
} from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  unread:  { label: "Unread",  color: "bg-blue-500",    icon: MailIcon },
  read:    { label: "Read",    color: "bg-slate-400",   icon: MailOpenIcon },
  replied: { label: "Replied", color: "bg-emerald-500", icon: CheckCheck },
};

export function MessagesTable({ messages }: { messages: Message[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const selectedMessage = messages.find((m) => m.id === selectedId);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const matchesSearch = 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "unread" && m.status === "unread") ||
        (activeTab === "replied" && m.status === "replied");

      return matchesSearch && matchesTab;
    });
  }, [messages, search, activeTab]);

  function handleStatusChange(id: string, status: "unread" | "read" | "replied") {
    startTransition(async () => {
      await updateMessageStatus(id, status);
      toast.success(`Message marked as ${status}`);
    });
  }

  function handleBulkStatusChange(status: "read" | "replied") {
    if (selectedIds.size === 0) return;
    startTransition(async () => {
      await bulkUpdateStatus(Array.from(selectedIds), status);
      toast.success(`${selectedIds.size} messages marked as ${status}`);
      setSelectedIds(new Set());
    });
  }

  function handleRemove(id: string) {
    if (!confirm("Delete this message?")) return;
    startTransition(async () => {
      await deleteMessage(id);
      if (selectedId === id) setSelectedId(null);
      toast.success("Message deleted.");
    });
  }

  function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} messages?`)) return;
    startTransition(async () => {
      await bulkDeleteMessages(Array.from(selectedIds));
      if (selectedId && selectedIds.has(selectedId)) setSelectedId(null);
      setSelectedIds(new Set());
      toast.success("Messages deleted.");
    });
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map(m => m.id)));
    }
  }

  function handleSelectMessage(msg: Message) {
    setSelectedId(msg.id);
    if (msg.status === "unread") {
      handleStatusChange(msg.id, "read");
    }
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Sidebar List */}
      <div className={cn(
        "flex flex-col border-r bg-muted/5 w-full md:w-[350px] lg:w-[400px] shrink-0",
        selectedId && "hidden md:flex"
      )}>
        {/* Sidebar Header */}
        <div className="flex flex-col gap-4 p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Inbox</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8">
                <RefreshCcwIcon className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <FilterIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveTab("all")}>All Messages</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("unread")}>Unread</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("replied")}>Replied</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search in messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-full border bg-muted/50 pl-9 pr-4 text-sm transition-all focus:bg-background focus:ring-1 focus:ring-primary"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
              <TabsTrigger value="replied" className="text-xs">Replied</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Bulk Selection Header (only in sidebar) */}
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20">
          <Checkbox 
            checked={filteredMessages.length > 0 && selectedIds.size === filteredMessages.length}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all"
          />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
          </span>
          {selectedIds.size > 0 && (
            <div className="ml-auto flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={handleBulkDelete}>
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete selected</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => handleBulkStatusChange("read")}>
                    <MailOpenIcon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark as read</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Messages List */}
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="rounded-full bg-muted p-4 mb-4">
                <InboxIcon className="size-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-sm">Your inbox is empty</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
                No messages found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredMessages.map((msg) => {
                const isSelected = selectedId === msg.id;
                const isChecked = selectedIds.has(msg.id);
                const isUnread = msg.status === "unread";
                
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "group relative flex border-b transition-all hover:bg-muted/40",
                      isSelected && "bg-muted/60",
                      isUnread && "bg-blue-50/20 dark:bg-blue-900/5"
                    )}
                  >
                    <div className="flex items-start gap-3 p-4 w-full">
                      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={isChecked}
                          onCheckedChange={() => toggleSelect(msg.id)}
                        />
                      </div>
                      
                      <div 
                        className="flex flex-1 flex-col gap-1.5 min-w-0 cursor-pointer"
                        onClick={() => handleSelectMessage(msg)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn(
                              "text-sm truncate",
                              isUnread ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                            )}>
                              {msg.name}
                            </span>
                            {isUnread && <div className="size-2 rounded-full bg-blue-500 shrink-0" />}
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(msg.createdAt).toLocaleDateString("en-IE", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-0.5">
                          <p className={cn(
                            "text-xs truncate",
                            isUnread ? "font-semibold text-foreground" : "text-muted-foreground"
                          )}>
                            {msg.subject}
                          </p>
                          <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                            {msg.message}
                          </p>
                        </div>

                        {msg.status === "replied" && (
                          <div className="mt-1">
                            <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border-emerald-200">
                              REPLIED
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Detail */}
      <div className={cn(
        "flex flex-1 flex-col bg-background min-w-0 h-full",
        !selectedId && "hidden md:flex items-center justify-center bg-muted/5"
      )}>
        {selectedMessage ? (
          <>
            {/* Detail Header / Toolbar */}
            <div className="flex h-14 items-center justify-between border-b px-4 shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden size-8"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                
                <div className="flex items-center gap-1 border-l pl-2 ml-1 md:border-none md:pl-0 md:ml-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => handleRemove(selectedMessage.id)}>
                        <Trash2Icon className="size-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => handleStatusChange(selectedMessage.id, "unread")}>
                        <MailIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mark as unread</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <ArchiveIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Archive</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center text-[10px] text-muted-foreground font-medium mr-2">
                  1 of {filteredMessages.length}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="size-8">
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8">
                    <ChevronRightIcon className="size-4" />
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(selectedMessage.id, "replied")}>
                      Mark as Replied
                    </DropdownMenuItem>
                    <DropdownMenuItem>Print Message</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Message Content Area */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-background p-4 md:p-8">
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-xl font-bold tracking-tight md:text-2xl text-foreground">
                      {selectedMessage.subject}
                    </h1>
                    
                    <div className="flex items-center justify-between group py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-12 border shadow-sm">
                          <AvatarFallback className="bg-indigo-600 text-white font-bold">
                            {selectedMessage.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground truncate">{selectedMessage.name}</span>
                            <span className="text-[10px] text-muted-foreground">&lt;{selectedMessage.email}&gt;</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <span>to me</span>
                            <MoreVerticalIcon className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {new Date(selectedMessage.createdAt).toLocaleString("en-IE", {
                            day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <StarIcon className="size-3.5 text-muted-foreground hover:text-amber-500 cursor-pointer" />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}>
                                <MailIcon className="size-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>Reply</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-2xl p-6 md:p-8 border border-border/50">
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-sans min-h-[150px]">
                      {selectedMessage.message}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      Contact Information
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border">
                        <MailIcon className="size-3.5 text-primary" />
                        <span className="text-xs font-medium">{selectedMessage.email}</span>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border">
                          <PhoneIcon className="size-3.5 text-primary" />
                          <span className="text-xs font-medium">{selectedMessage.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border">
                        <ClockIcon className="size-3.5 text-primary" />
                        <span className="text-xs font-medium">Recieved on {new Date(selectedMessage.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Reply Box */}
                <div className="mt-8 border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm">
                  <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Quick Reply</span>
                    <Badge variant="outline" className="text-[9px] h-4">HTML SUPPORTED</Badge>
                  </div>
                  <textarea 
                    className="w-full h-32 p-4 text-sm focus:outline-none resize-none bg-transparent"
                    placeholder={`Reply to ${selectedMessage.name}...`}
                  />
                  <div className="px-4 py-2 bg-muted/50 border-t flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8"><CheckIcon className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-8"><Trash2Icon className="size-4" /></Button>
                    </div>
                    <Button 
                      size="sm" 
                      className="h-8 gap-2"
                      asChild
                    >
                      <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}>
                        <MailIcon className="size-3.5" /> Send Reply
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/5 animate-pulse" />
              <div className="relative flex size-24 items-center justify-center rounded-3xl bg-muted/40 border-2 border-dashed shadow-sm">
                <MailIcon className="size-10 text-muted-foreground/20" />
              </div>
            </div>
            <div className="max-w-[280px] space-y-2">
              <h3 className="font-bold text-lg">Select a message</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose a conversation from the list to read its content and respond to the customer.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">Shift + Click to multi-select</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
