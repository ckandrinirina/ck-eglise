"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

type Status = "active" | "inactive" | "pending";

const getStatusStyle = (status: Status) => {
  const styles = {
    active: "bg-green-50 text-green-700 ring-green-600/20",
    inactive: "bg-gray-50 text-gray-600 ring-gray-500/20",
    pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  };
  return styles[status];
};

export default function UsersPage() {
  const t = useTranslations("admin.users");

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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              {t("addUser")}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("addUser")}</TooltipContent>
        </Tooltip>
      </div>

      <Card className="overflow-x-auto">
        <div className="min-w-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead>{t("table.email")}</TableHead>
                <TableHead>{t("table.role")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead className="w-[48px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Sample User</TableCell>
                <TableCell className="truncate max-w-[200px]">
                  user@example.com
                </TableCell>
                <TableCell>Member</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusStyle("active")}`}
                  >
                    Active
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>{t("actions.more")}</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem>{t("actions.edit")}</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        {t("actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
