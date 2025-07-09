"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Menu, ChevronRight } from "lucide-react";

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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

const navItems = [
  {
    title: "administration", // Changed to lowercase to match translation key pattern
    url: "/admin",
    icon: LayoutDashboard,
    isActive: true,
    items: [
      {
        title: "dashboard", // Changed to match translation key pattern
        url: "/admin",
      },
      {
        title: "users", // Changed to match translation key pattern
        url: "/admin/users",
      },
      {
        title: "dropdowns", // Added new item
        url: "/admin/dropdowns",
      },
      {
        title: "transactions", // Added new finance section
        url: "/admin/finance/transactions",
      },
      {
        title: "money_goals", // Added money goals section
        url: "/admin/finance/money-goals",
      },
      {
        title: "settings", // Changed to match translation key pattern
        url: "/admin/settings",
      },
    ],
  },
];

function MainNav({}: { isMobile?: boolean }) {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "fr";
  const t = useTranslations("admin");

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("navigation.title")}</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => {
          const localizedUrl = `/${locale}${item.url}`;
          const isActive = pathname === localizedUrl;

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={t(`${item.title}.title`)}
                    isActive={isActive}
                  >
                    {item.icon && (
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span>{t(`${item.title}.title`)}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const localizedSubUrl = `/${locale}${subItem.url}`;
                      const isSubActive = pathname === localizedSubUrl;

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link href={localizedSubUrl}>
                              <span>{t(`${subItem.title}.title`)}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
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
