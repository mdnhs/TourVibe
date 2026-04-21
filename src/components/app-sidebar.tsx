"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
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
  SettingsIcon,
  ChevronRightIcon,
  SearchIcon,
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
      ],
    },
    { label: "Account", href: "/dashboard/account", icon: CircleUserRoundIcon },
  ];

  const filteredMenuItems = menuItems
    .filter((item) => {
      // Default hardcoded logic (always check this first)
      if (item.adminOnly && user.role !== "Super Admin") return false;
      if (item.label === "Reviews" && user.role === "Driver") return false;
      return true;
    })
    .map((item) => {
      if (item.items) {
        return {
          ...item,
          items: item.items.filter((subItem) => {
            // Check hardcoded logic for sub-items
            if ((subItem as any).adminOnly && user.role !== "Super Admin")
              return false;
            // If dynamic permissions are provided, check them
            if (allowedMenus && !allowedMenus.includes(subItem.label))
              return false;
            return true;
          }),
        };
      }
      return item;
    })
    .filter((item) => {
      // If dynamic permissions are provided, use them
      if (allowedMenus) {
        // Show if parent is explicitly allowed OR it has any allowed sub-items
        const isParentAllowed = allowedMenus.includes(item.label);
        const hasAllowedSubItems = item.items && item.items.length > 0;
        return isParentAllowed || hasAllowedSubItems;
      }
      return true;
    })
    .filter((item) => {
      // If it had sub-items but they were all filtered out, and it has no href of its own, hide it
      if (item.items && item.items.length === 0 && !item.href) return false;
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
                const hasSubItems = item.items && item.items.length > 0;
                const isExpanded = openMenus[item.label];

                const isActive = item.href
                  ? item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)
                  : hasSubItems &&
                    item.items?.some((sub) => pathname.startsWith(sub.href));

                const isNotif = item.href === "/dashboard/notifications";

                return (
                  <SidebarMenuItem key={item.label}>
                    {hasSubItems ? (
                      <>
                        <SidebarMenuButton
                          onClick={() => toggleMenu(item.label)}
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Icon />
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
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        {isNotif && unreadNotifications > 0 && (
                          <SidebarMenuBadge>
                            {unreadNotifications > 99
                              ? "99+"
                              : unreadNotifications}
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
        <SidebarSeparator />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
