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
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({
    "Site Settings": true,
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const menuItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
    { label: "Bookings", href: "/dashboard/bookings", icon: TicketIcon },
    {
      label: "Tours",
      href: "/dashboard/tours",
      icon: MapIcon,
      adminOnly: true,
    },
    { label: "Reviews", href: "/dashboard/reviews", icon: StarIcon },
    {
      label: "Drivers",
      href: "/dashboard/drivers",
      icon: BusFrontIcon,
      adminOnly: true,
    },
    {
      label: "Vehicles",
      href: "/dashboard/vehicles",
      icon: CarFrontIcon,
      adminOnly: true,
    },
    {
      label: "Users",
      href: "/dashboard/users",
      icon: UsersIcon,
      adminOnly: true,
    },
    {
      label: "Roles & Permissions",
      href: "/dashboard/roles",
      icon: ShieldCheckIcon,
      adminOnly: true,
    },
    {
      label: "Live Tracking",
      href: "/dashboard/tracking",
      icon: NavigationIcon,
    },
    {
      label: "Notifications",
      href: "/dashboard/notifications",
      icon: BellIcon,
    },
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: InboxIcon,
      adminOnly: true,
    },
    {
      label: "Blog",
      href: "/dashboard/blog",
      icon: BookOpenIcon,
      adminOnly: true,
    },
    {
      label: "Site Settings",
      icon: SettingsIcon,
      adminOnly: true,
      items: [
        {
          label: "Appearance",
          href: "/dashboard/appearance",
          icon: PaletteIcon,
        },
        {
          label: "SEO",
          href: "/dashboard/seo",
          icon: SearchIcon,
        },
        {
          label: "Site Config",
          href: "/dashboard/site-config",
          icon: SlidersHorizontalIcon,
        },
      ],
    },
    { label: "Account", href: "/dashboard/account", icon: CircleUserRoundIcon },
  ];

  const filteredMenuItems = menuItems
    .filter((item) => {
      // When allowedMenus is set (custom role / builtin override), skip hardcoded
      // adminOnly gate — allowedMenus is the sole authority for that session.
      if (allowedMenus) return true;
      // Default hardcoded rules for Super Admin / Driver / Tourist
      if (item.adminOnly && user.role !== "Super Admin") return false;
      if (item.label === "Reviews" && user.role === "Driver") return false;
      return true;
    })
    .map((item) => {
      if (item.items) {
        return {
          ...item,
          items: item.items.filter((subItem) => {
            if (allowedMenus) {
              // allowedMenus is authoritative — show only what's explicitly granted
              return allowedMenus.includes(subItem.label);
            }
            // Hardcoded sub-item rules
            if ((subItem as any).adminOnly && user.role !== "Super Admin")
              return false;
            return true;
          }),
        };
      }
      return item;
    })
    .filter((item) => {
      if (allowedMenus) {
        // Keep top-level item if it's directly allowed OR has at least one allowed sub-item
        const isParentAllowed = allowedMenus.includes(item.label);
        const hasAllowedSubItems = item.items && item.items.length > 0;
        return isParentAllowed || hasAllowedSubItems;
      }
      return true;
    })
    .filter((item) => {
      // Drop parent-only items whose sub-items were all filtered out
      if (item.items && item.items.length === 0 && !item.href) return false;
      return true;
    });

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! group/brand h-auto py-2"
              render={<Link href="/dashboard" />}
              tooltip="TourVibe"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30">
                <CarFrontIcon className="size-4! text-white" />
              </div>
              <div className="flex flex-col gap-0 leading-none">
                <span className="text-sm font-bold tracking-tight">TourVibe</span>
                <span className="text-[10px] font-medium text-muted-foreground/70 group-hover/brand:text-muted-foreground transition-colors">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mx-2 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent dark:via-indigo-500/20" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const hasSubItems = item.items && item.items.length > 0;
                const isExpanded = openMenus[item.label];

                const isActive = item.href
                  ? item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)
                  : hasSubItems &&
                    item.items?.some((sub) => pathname.startsWith(sub.href));

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
                          className={isActive ? "sidebar-gradient-active text-primary font-medium" : ""}
                        >
                          <div className={`flex size-5 shrink-0 items-center justify-center rounded-md transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                            <Icon className="size-4" />
                          </div>
                          <span>{item.label}</span>
                          <ChevronRightIcon
                            className={`ml-auto transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </SidebarMenuButton>
                        {isExpanded && (
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.href}>
                                <SidebarMenuSubButton
                                  render={<Link href={subItem.href} />}
                                  isActive={pathname === subItem.href}
                                  className={pathname === subItem.href ? "text-primary font-medium bg-primary/8" : ""}
                                >
                                  {subItem.icon && (
                                    <subItem.icon className="size-4" />
                                  )}
                                  <span>{subItem.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </>
                    ) : (
                      <>
                        <SidebarMenuButton
                          render={<Link href={item.href!} />}
                          isActive={isActive}
                          tooltip={item.label}
                          className={isActive ? "sidebar-gradient-active text-primary font-medium" : ""}
                        >
                          <div className={`flex size-5 shrink-0 items-center justify-center rounded-md transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                            <Icon className="size-4" />
                          </div>
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        {isNotif && unreadNotifications > 0 && (
                          <SidebarMenuBadge className="bg-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm shadow-violet-500/40">
                            {unreadNotifications > 99 ? "99+" : unreadNotifications}
                          </SidebarMenuBadge>
                        )}
                        {isMessages && unreadMessages > 0 && (
                          <SidebarMenuBadge className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm shadow-indigo-500/40">
                            {unreadMessages > 99 ? "99+" : unreadMessages}
                          </SidebarMenuBadge>
                        )}
                      </>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="mx-2 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent dark:via-indigo-500/20" />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
