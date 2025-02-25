import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { AdminSidebar } from "@/components/shared/admin/sidebar";
import { Breadcrumbs } from "@/components/shared/admin/breadcrumbs";
import { UserMenu } from "@/components/shared/admin/user-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "4rem",
          } as React.CSSProperties
        }
        className="flex h-screen overflow-hidden bg-background relative"
      >
        <AdminSidebar />
        <SidebarInset className="flex-1 transition-[padding] duration-300 group-has-[[data-collapsible=icon]]/sidebar-wrapper">
          <div className="flex h-full flex-col">
            <header className="flex h-16 shrink-0 items-center border-b bg-background">
              <div className="flex items-center justify-between w-full px-4">
                <div className="flex items-center gap-2">
                  <Breadcrumbs />
                </div>
                <div className="flex items-center gap-4">
                  <LanguageSwitcher variant="inline" />
                  <Separator orientation="vertical" className="h-6" />
                  <UserMenu />
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
