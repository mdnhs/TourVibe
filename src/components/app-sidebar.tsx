"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  BellIcon,
  BookOpenIcon,
  BusFrontIcon,
  CarFrontIcon,
  CircleUserRoundIcon,
  LayoutDashboardIcon,
  MapIcon,
  NavigationIcon,
  StarIcon,
  UsersIcon,
  TicketIcon,
  PaletteIcon,
  ShieldCheckIcon,
  SettingsIcon,
  ChevronRightIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  InboxIcon,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar({
  user,
  unreadNotifications = 0,
  unreadMessages = 0,
  allowedMenus = null,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
  unreadNotifications?: number;
  unreadMessages?: number;
  allowedMenus?: string[] | null;
}) {
  const pathname = usePathname();
  const { setOpen, open } = useSidebar();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({
    "Settings": true,
  });

  const toggleMenu = (label: string) => {
    if (!open) {
      setOpen(true);
      setOpenMenus((prev) => ({
        ...prev,
        [label]: true,
      }));
      return;
    }
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const menuGroups = [
    {
      label: "Platform",
      items: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
        { label: "Live Tracking", href: "/dashboard/tracking", icon: NavigationIcon },
      ]
    },
    {
      label: "Operations",
      items: [
        { label: "Bookings", href: "/dashboard/bookings", icon: TicketIcon },
        { label: "Tours", href: "/dashboard/tours", icon: MapIcon, adminOnly: true },
        { label: "Vehicles", href: "/dashboard/vehicles", icon: CarFrontIcon, adminOnly: true },
        { label: "Drivers", href: "/dashboard/drivers", icon: BusFrontIcon, adminOnly: true },
      ]
    },
    {
      label: "Management",
      adminOnly: true,
      items: [
        { label: "Users", href: "/dashboard/users", icon: UsersIcon },
        { label: "Roles", href: "/dashboard/roles", icon: ShieldCheckIcon },
        { label: "Reviews", href: "/dashboard/reviews", icon: StarIcon },
      ]
    },
    {
      label: "Inbox",
      items: [
        { label: "Messages", href: "/dashboard/messages", icon: InboxIcon, adminOnly: true },
        { label: "Notifications", href: "/dashboard/notifications", icon: BellIcon },
        { label: "Blog", href: "/dashboard/blog", icon: BookOpenIcon, adminOnly: true },
      ]
    },
    {
      label: "System",
      adminOnly: true,
      items: [
        {
          label: "Settings",
          icon: SettingsIcon,
          items: [
            { label: "Appearance", href: "/dashboard/appearance", icon: PaletteIcon },
            { label: "SEO", href: "/dashboard/seo", icon: SearchIcon },
            { label: "Site Config", href: "/dashboard/site-config", icon: SlidersHorizontalIcon },
          ],
        },
      ]
    },
  ];

  const renderMenuItem = (item: any) => {
    const Icon = item.icon;
    const hasSubItems = item.items && item.items.length > 0;
    const isExpanded = openMenus[item.label];
    
    if (allowedMenus) {
      const isAllowed = allowedMenus.includes(item.label) || (item.items && item.items.some((si: any) => allowedMenus.includes(si.label)));
      if (!isAllowed) return null;
    } else if (item.adminOnly && user.role !== "Super Admin") {
      return null;
    }

    const isActive = item.href
      ? item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href)
      : hasSubItems && item.items?.some((sub: any) => pathname.startsWith(sub.href));

    const isNotif = item.href === "/dashboard/notifications";
    const isMessages = item.href === "/dashboard/messages";

    return (
      <SidebarMenuItem key={item.label}>
        {hasSubItems ? (
          <>
            <SidebarMenuButton
              onClick={() => toggleMenu(item.label)}
              isActive={isActive}
              tooltip={item.label}
              className={cn(
                "h-10 px-3 group-data-[collapsible=icon]:px-0 transition-all duration-200",
                isActive ? "bg-white/10 text-white font-bold" : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className="flex-1 text-sm group-data-[collapsible=icon]:hidden">{item.label}</span>
              <ChevronRightIcon
                className={cn(
                  "ml-auto size-3.5 transition-transform duration-200 group-data-[collapsible=icon]:hidden",
                  isExpanded ? "rotate-90" : ""
                )}
              />
            </SidebarMenuButton>
            {isExpanded && (
              <SidebarMenuSub className="border-white/10 ml-4 pl-2 space-y-1 mt-1 group-data-[collapsible=icon]:hidden">
                {item.items?.map((subItem: any) => {
                  if (allowedMenus && !allowedMenus.includes(subItem.label)) return null;
                  return (
                    <SidebarMenuSubItem key={subItem.href}>
                      <SidebarMenuSubButton
                        render={<Link href={subItem.href} />}
                        isActive={pathname === subItem.href}
                        className={cn(
                          "h-8 text-[13px] transition-all duration-200 px-3 rounded-lg",
                          pathname === subItem.href 
                            ? "text-white font-semibold bg-white/15" 
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {subItem.icon && <subItem.icon className="size-3.5" />}
                        <span>{subItem.label}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            )}
          </>
        ) : (
          <>
            <SidebarMenuButton
              render={<Link href={item.href!} />}
              isActive={isActive}
              tooltip={item.label}
              className={cn(
                "h-10 px-3 group-data-[collapsible=icon]:px-0 transition-all duration-200 rounded-xl",
                isActive 
                  ? "bg-white/20 text-white font-bold shadow-lg shadow-black/40 ring-1 ring-white/30" 
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className="flex-1 text-sm group-data-[collapsible=icon]:hidden">{item.label}</span>
              
              {isNotif && unreadNotifications > 0 && (
                <SidebarMenuBadge className="bg-amber-500 text-black text-[10px] font-black px-1.5 rounded-full min-w-[18px] group-data-[collapsible=icon]:hidden">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </SidebarMenuBadge>
              )}
              {isMessages && unreadMessages > 0 && (
                <SidebarMenuBadge className="bg-sky-400 text-black text-[10px] font-black px-1.5 rounded-full min-w-[18px] group-data-[collapsible=icon]:hidden">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </SidebarMenuBadge>
              )}
            </SidebarMenuButton>
          </>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props} className="border-r border-white/5">
      {/* ── RICH DEEP GRADIENT CONTAINER ── */}
      <div className="relative flex size-full flex-col overflow-hidden bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e1b4b] text-white">
        
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 size-80 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-12 size-72 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-2xl" />
          <div className="absolute right-1/4 bottom-0 size-40 rounded-full bg-pink-500/10 blur-2xl" />
        </div>

        {/* Dot-grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top shimmer line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

        <SidebarHeader className="h-20 flex flex-col justify-center px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center z-10 border-b border-white/10 relative bg-transparent">
          <SidebarMenu>
            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <SidebarMenuButton
                size="lg"
                className="group/brand hover:bg-transparent p-0 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center"
                render={<Link href="/dashboard" />}
                tooltip="TourVibe"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30">
                  <CarFrontIcon className="size-5 text-white" />
                </div>
                <div className="flex flex-col gap-0 leading-none ml-3 group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-bold tracking-tight text-white">TourVibe</span>
                  <span className="text-[10px] font-medium text-white/40">Admin Panel</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="py-6 z-10 relative bg-transparent">
          {menuGroups.map((group, idx) => {
            if (!allowedMenus && group.adminOnly && user.role !== "Super Admin") return null;
            
            const visibleItems = group.items.filter(item => {
              if (allowedMenus) {
                 return allowedMenus.includes(item.label) || (item.items && item.items.some((si: any) => allowedMenus.includes(si.label)));
              }
              if (item.adminOnly && user.role !== "Super Admin") return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <React.Fragment key={group.label}>
                <SidebarGroup className="mb-2 group-data-[collapsible=icon]:mb-4 group-data-[collapsible=icon]:p-0">
                  <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 px-4 group-data-[collapsible=icon]:hidden mb-3">
                    {group.label}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-1.5 px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
                      {group.items.map(renderMenuItem)}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                {idx < menuGroups.length - 1 && (
                  <SidebarSeparator className="mx-4 bg-white/5" />
                )}
              </React.Fragment>
            );
          })}
        </SidebarContent>

        <SidebarFooter className="border-t group-data-[collapsible=icon]:border-none border-white/10 pb-8 z-10 relative bg-black/10">
          <div className="px-3 group-data-[collapsible=icon]:px-0 pt-6">
            <Link 
              href="/dashboard/account"
              className={cn(
                "flex items-center gap-3 px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center py-4 rounded-2xl transition-all duration-300 ring-1 ring-white/5 shadow-inner group-data-[collapsible=icon]:ring-0 group-data-[collapsible=icon]:shadow-none",
                pathname === "/dashboard/account" 
                  ? "bg-white/20 text-white shadow-lg ring-white/20" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-black truncate text-white">{user.name}</span>
                <span className="text-[10px] font-medium text-white/30 truncate">{user.email}</span>
              </div>
            </Link>
          </div>
        </SidebarFooter>
      </div>
      <SidebarRail />
    </Sidebar>
  );
}
