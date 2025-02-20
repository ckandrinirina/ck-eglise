import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { AdminSidebar } from "@/components/shared/admin/sidebar";
import { Breadcrumbs } from "@/components/shared/admin/breadcrumbs";
import { UserMenu } from "@/components/shared/admin/user-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <div className="w-64 shrink-0">
          <AdminSidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background">
            <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center">
              {/* Left spacing for mobile menu button */}
              <div className="w-12 lg:hidden"></div>
              <div className="flex flex-1 items-center justify-between">
                <Breadcrumbs />
                <div className="flex items-center gap-4">
                  <LanguageSwitcher variant="inline" />
                  <Separator orientation="vertical" className="h-6" />
                  <UserMenu />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
