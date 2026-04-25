"use client";

import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(secure)/admin/logout.action";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NookLogo } from "@/components/shop/nook-logo";

const NAV_ITEMS = [
  { href: "/admin",           label: "Dashboard",     icon: LayoutDashboard },
  { href: "/admin/products",  label: "Productos",     icon: Package },
  { href: "/admin/inventory", label: "Inventario",    icon: Warehouse },
  { href: "/admin/orders",    label: "Pedidos",       icon: ShoppingBag },
  { href: "/admin/finance",   label: "Finanzas",      icon: CreditCard },
  { href: "/admin/reports",   label: "Reportes",      icon: BarChart3 },
  { href: "/admin/settings",  label: "Configuración", icon: Settings },
] as const;

interface AppSidebarProps {
  userRole: string;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (pathname === href) return true;
    if (href === "/admin") return false;
    return pathname.startsWith(href);
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border bg-espresso p-4">
        <NookLogo variant="dark" width={110} />
        <p className="mt-1 font-sans text-xs text-cream/50">Panel de Administración</p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={isActive(href)}>
                    <Link href={href}>
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="space-y-2 border-t border-sidebar-border p-4">
        <p className="font-sans text-xs capitalize text-muted-foreground">Rol: {userRole}</p>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Cerrar sesión
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
