"use client";

import { useTranslations } from "next-intl";
import DropdownsList from "@/components/shared/admin/dropdowns/dropdowns-list";

/**
 * DropdownsPage component for displaying the dropdowns management page
 */
export default function DropdownsPage() {
  const t = useTranslations("admin.dropdowns");

  return (
    <div className="space-y-4 p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <DropdownsList />
    </div>
  );
}
