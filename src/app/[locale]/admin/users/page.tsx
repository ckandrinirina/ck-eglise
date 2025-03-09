"use client";

import { useTranslations } from "next-intl";
import UsersList from "@/components/shared/admin/users/users-list";

/**
 * UsersPage component for displaying the users management page
 */
export default function UsersPage() {
  const t = useTranslations("admin.users");

  return (
    <div className="space-y-4 p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <UsersList />
    </div>
  );
}
