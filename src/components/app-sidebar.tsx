"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import {
  BusFrontIcon,
  CarFrontIcon,
  LayoutDashboardIcon,
  MapIcon,
  StarIcon,
  UsersIcon,
  TicketIcon,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      label: "Bookings",
      href: "/dashboard/bookings",
      icon: TicketIcon,
    },
    {
      label: "Tours",
      href: "/dashboard/tours",
      icon: MapIcon,
      adminOnly: true,
    },
    {
      label: "Reviews",
      href: "/dashboard/reviews",
      icon: StarIcon,
    },
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
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user.role === "Super Admin",
  );

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
