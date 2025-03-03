"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function UserMenu() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname?.split("/")[1];
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || ""}
                width={32}
                height={32}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {user?.name || t("admin.account.anonymous")}
          <div className="text-xs font-normal text-muted-foreground">
            {user?.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/${locale}/admin/settings`}>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("admin.settings.title")}</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="text-red-600" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("navigation.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
