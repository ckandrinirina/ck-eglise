import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { AdminSidebar } from "@/components/shared/admin/sidebar";
import { Breadcrumbs } from "@/components/shared/admin/breadcrumbs";
import { UserMenu } from "@/components/shared/admin/user-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider
        className="!block"
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "4rem",
          } as React.CSSProperties
        }
      >
        <AdminSidebar />
        <SidebarInset className="lg:pl-64 transition-[padding] duration-300 group-has-[[data-collapsible=icon]]/sidebar-wrapper:lg:pl-16">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
          <main className="flex-1 flex flex-col gap-4 p-4 pt-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
