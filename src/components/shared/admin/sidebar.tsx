"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Menu, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "dashboard.title", icon: LayoutDashboard },
  { href: "/admin/users", label: "users.title", icon: Users },
  { href: "/admin/settings", label: "settings.title", icon: Settings },
];

function SidebarContent() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";
  const t = useTranslations("admin");

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const localizedHref = `/${locale}${item.href}`;
            const isActive = pathname === localizedHref;
            const Icon = item.icon;
            return (
              <Link
                key={localizedHref}
                href={localizedHref}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(item.label)}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <p className="text-xs text-muted-foreground">© 2024 CK Admin</p>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden absolute left-4 top-3 z-20">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-64 flex-col border-r bg-background">
        <SidebarContent />
      </div>
    </>
  );
}
