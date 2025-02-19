"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("admin.settings");
  const [settings, setSettings] = useState({
    siteName: "CK Eglise",
    environment: "Development",
    sessionTimeout: "24",
  });

  const handleChange =
    (key: keyof typeof settings) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSave = () => {
    // TODO: Implement settings save
    console.log("Saving settings:", settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button onClick={handleSave} className="w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {t("actions.save")}
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6">
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium mb-4">
            {t("general.title")}
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-1">
                {t("general.siteName")}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                {t("general.siteNameDescription")}
              </p>
              <Input
                value={settings.siteName}
                onChange={handleChange("siteName")}
                className="max-w-sm w-full"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">
                {t("general.environment")}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                {t("general.environmentDescription")}
              </p>
              <Input
                value={settings.environment}
                onChange={handleChange("environment")}
                className="max-w-sm w-full"
                disabled
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium mb-4">
            {t("security.title")}
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-1">
                {t("security.sessionTimeout")}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                {t("security.sessionTimeoutDescription")}
              </p>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={handleChange("sessionTimeout")}
                className="max-w-sm w-full"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-4 sm:hidden">
        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
