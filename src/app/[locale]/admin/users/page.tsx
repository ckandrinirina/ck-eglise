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
import { UserDialog } from "@/components/shared/admin/user-dialog";
import { format } from "date-fns";
import { useUsersManagement } from "@/hooks/admin/useUsersManagement";
import { toast } from "sonner";

export default function UsersPage() {
  const t = useTranslations("admin.users");
  const {
    users,
    selectedUser,
    dialogOpen,
    handleEdit,
    handleDelete,
    handleAdd,
    handleDialogClose,
  } = useUsersManagement();

  const showDeleteConfirmation = (userId: string) => {
    const { confirmDelete } = handleDelete(userId);

    toast.custom(
      () => (
        <div className="rounded-lg bg-background p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-medium">{t("dialog.confirmDelete")}</h3>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => toast.dismiss()}>
              {t("dialog.cancel")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                toast.dismiss();
                confirmDelete();
              }}
            >
              {t("dialog.confirm")}
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleAdd} className="w-full sm:w-auto">
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
                <TableHead>{t("table.createdAt")}</TableHead>
                <TableHead className="w-[48px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {user.email}
                  </TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "PPp")}
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
                              <span className="sr-only">
                                {t("actions.more")}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>{t("actions.more")}</TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          {t("actions.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => showDeleteConfirmation(user.id)}
                        >
                          {t("actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <UserDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        user={selectedUser || undefined}
      />
    </div>
  );
}
