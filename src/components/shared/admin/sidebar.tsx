"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Menu, Settings, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/admin", label: "dashboard.title", icon: LayoutDashboard },
  { href: "/admin/users", label: "users.title", icon: Users },
  { href: "/admin/settings", label: "settings.title", icon: Settings },
];

function MainNav() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "fr";
  const t = useTranslations("admin");
  const { state } = useSidebar();

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const localizedHref = `/${locale}${item.href}`;
        const isActive = pathname === localizedHref;
        const Icon = item.icon;
        return (
          <Link
            key={localizedHref}
            href={localizedHref}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all group-data-[collapsible=icon]:justify-center ${
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-secondary/50"
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {state !== "collapsed" && <span>{t(item.label)}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContainer({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const { state } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r h-screen fixed inset-y-0 left-0 transition-all duration-300"
    >
      <SidebarHeader className="p-6">
        {state !== "collapsed" ? (
          <h2 className="text-lg font-semibold">{t("title")}</h2>
        ) : (
          <div className="w-6 h-6 mx-auto">
            <LayoutDashboard className="w-full h-full" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>{children}</SidebarContent>
      <SidebarFooter className="p-4">
        {state !== "collapsed" && (
          <p className="text-xs text-muted-foreground">© 2024 CK Admin</p>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <SidebarProvider
      className="!block"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4rem",
        } as React.CSSProperties
      }
    >
      {/* Mobile Menu Button */}
      <div className="lg:hidden absolute left-4 top-3 z-20">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SidebarContainer>
              <MainNav />
            </SidebarContainer>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContainer>
          <MainNav />
        </SidebarContainer>
      </div>
    </SidebarProvider>
  );
}
