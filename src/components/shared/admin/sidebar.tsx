"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Menu, Settings, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/admin", label: "dashboard.title", icon: LayoutDashboard },
  { href: "/admin/users", label: "users.title", icon: Users },
  { href: "/admin/settings", label: "settings.title", icon: Settings },
];

function MainNav({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "fr";
  const t = useTranslations("admin");
  const { state } = useSidebar();

  return (
    <nav className="flex flex-col gap-4">
      {navItems.map((item) => {
        const localizedHref = `/${locale}${item.href}`;
        const isActive = pathname === localizedHref;
        const Icon = item.icon;
        return (
          <Link
            key={localizedHref}
            href={localizedHref}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ${
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-secondary/50"
            } ${!isMobile && state === "collapsed" ? "group-data-[collapsible=icon]:justify-center" : ""}`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {(isMobile || state !== "collapsed") && (
              <span>{t(item.label)}</span>
            )}
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
      className="border-r min-h-screen bg-background z-30"
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
      <SidebarFooter className="p-4 border-t">
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
  const t = useTranslations("admin");

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed left-4 top-3 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetTitle className="p-6 text-lg font-semibold border-b">
              {t("title")}
            </SheetTitle>
            <div className="p-4">
              <MainNav isMobile />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContainer>
          <MainNav />
        </SidebarContainer>
      </div>
    </>
  );
}
