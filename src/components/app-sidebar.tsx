"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import {
  BellIcon,
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
} from "@/components/ui/sidebar";

export function AppSidebar({
  user,
  unreadNotifications = 0,
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
  allowedMenus?: string[] | null;
}) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
    { label: "Bookings", href: "/dashboard/bookings", icon: TicketIcon },
    { label: "Tours", href: "/dashboard/tours", icon: MapIcon, adminOnly: true },
    { label: "Reviews", href: "/dashboard/reviews", icon: StarIcon },
    { label: "Drivers", href: "/dashboard/drivers", icon: BusFrontIcon, adminOnly: true },
    { label: "Vehicles", href: "/dashboard/vehicles", icon: CarFrontIcon, adminOnly: true },
    { label: "Users", href: "/dashboard/users", icon: UsersIcon, adminOnly: true },
    { label: "Roles & Permissions", href: "/dashboard/roles", icon: ShieldCheckIcon, adminOnly: true },
    { label: "Live Tracking", href: "/dashboard/tracking", icon: NavigationIcon },
    { label: "Notifications", href: "/dashboard/notifications", icon: BellIcon },
    { label: "Appearance", href: "/dashboard/appearance", icon: PaletteIcon, adminOnly: true },
    { label: "Account", href: "/dashboard/account", icon: CircleUserRoundIcon },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    // If dynamic permissions are provided, use them
    if (allowedMenus) {
      return allowedMenus.includes(item.label);
    }

    // Default hardcoded logic
    if (item.adminOnly && user.role !== "Super Admin") return false;
    if (item.label === "Reviews" && user.role === "Driver") return false;
    return true;
  });

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
              tooltip="TourVibe"
            >
              <CarFrontIcon className="size-5!" />
              <span className="text-base font-semibold">TourVibe</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                const isNotif = item.href === "/dashboard/notifications";

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {isNotif && unreadNotifications > 0 && (
                      <SidebarMenuBadge>
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
